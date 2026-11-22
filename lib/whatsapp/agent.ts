import { markReadWithTyping, sendText, type IncomingMessage } from "./cloud-api";
import { whatsappConfig } from "./config";
import { systemPrompt } from "./knowledge";
import { chatCompletion, type ChatMessage } from "./llm";
import { loadConversation, saveConversation, type Conversation } from "./store";
import { TOOLS, runTool } from "./tools";

/**
 * The WhatsApp auto-responder: a chat model on Amazon Bedrock (Qwen by
 * default), with the site's data in the system prompt and two tools (quotes,
 * handover to the team).
 *
 * Each customer's messages are handled one batch at a time, in order. Messages
 * that arrive while a reply is being written are answered together next.
 */

/** Tool rounds per customer turn before giving up and handing over. */
const MAX_ROUNDS = 6;
/** Past this many stored messages, older turns are dropped. */
const MAX_MESSAGES = 60;
const KEEP_MESSAGES = 30;
/** A chat silent this long starts over. */
const STALE_MS = 30 * 24 * 60 * 60 * 1000;

const SORRY =
  "Sorry, I couldn't answer that just now. A member of our team will reply here shortly. JazakAllah for your patience.";

const karachiTime = (d: Date) =>
  d.toLocaleString("en-GB", {
    timeZone: "Asia/Karachi",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Drops old turns once a chat gets long. The kept part starts at a customer message. */
function trimHistory(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length <= MAX_MESSAGES) return messages;
  let start = messages.length - KEEP_MESSAGES;
  while (start < messages.length && messages[start].role !== "user") start++;
  return messages.slice(start);
}

/**
 * Turns Markdown the model may still write into WhatsApp formatting:
 * **bold** → *bold*, headings → bold lines, no trailing spaces.
 */
function toWhatsApp(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "*$1*")
    .replace(/__(.+?)__/g, "_$1_")
    .replace(/^#{1,6}\s+(.+)$/gm, "*$1*")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Runs the model over the conversation until it has a reply for the customer. Exported for local testing. */
export async function respond(conv: Conversation, onHandoff: () => void): Promise<string> {
  const ctx = { waId: conv.waId, profileName: conv.name, onHandoff };

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const { message, finishReason } = await chatCompletion(
      [{ role: "system", content: systemPrompt() }, ...conv.messages],
      TOOLS
    );

    if (message.tool_calls?.length) {
      if (finishReason === "length") {
        // Cut off mid tool call: the arguments are incomplete.
        return "";
      }
      conv.messages.push(message);
      for (const call of message.tool_calls) {
        let input: unknown;
        try {
          input = JSON.parse(call.function.arguments || "{}");
        } catch {
          input = null;
        }
        const r = input
          ? await runTool(call.function.name, input, ctx)
          : { content: "The tool arguments were not valid JSON. Call the tool again with valid JSON." };
        conv.messages.push({ role: "tool", tool_call_id: call.id, content: r.content });
      }
      continue;
    }

    const text = toWhatsApp(message.content ?? "");
    if (text) conv.messages.push({ role: "assistant", content: text });
    return text;
  }

  console.warn("[whatsapp] too many tool rounds", conv.waId);
  return "";
}

/** Answers one batch of messages from the same customer. */
async function handleBatch(batch: IncomingMessage[]): Promise<void> {
  const { waId, name } = batch[batch.length - 1];
  let conv = await loadConversation(waId);
  if (Date.now() - Date.parse(conv.updatedAt) > STALE_MS) {
    conv = { ...conv, messages: [], pausedUntil: undefined };
  }
  if (name) conv.name = name;

  const paused = conv.pausedUntil && Date.parse(conv.pausedUntil) > Date.now();
  const wasPaused = Boolean(conv.pausedUntil) && !paused;

  const lines = [`[Received: ${karachiTime(batch[batch.length - 1].receivedAt)}]`];
  if (wasPaused) {
    lines.push("[A T&T team member handled this chat for a while; their replies are not shown here.]");
    conv.pausedUntil = undefined;
  }
  lines.push(...batch.map((m) => m.text));
  conv.messages = trimHistory(conv.messages);
  conv.messages.push({ role: "user", content: lines.join("\n") });

  if (paused || !whatsappConfig.enabled()) {
    // The team is answering (or the bot is switched off): keep the history, don't reply.
    await saveConversation(conv);
    return;
  }

  await markReadWithTyping(batch[batch.length - 1].id).catch((err) =>
    console.warn("[whatsapp] could not mark as read", err)
  );

  let handedOff = false;
  let reply = "";
  try {
    reply = await respond(conv, () => {
      handedOff = true;
    });
  } catch (err) {
    console.error("[whatsapp] model request failed", waId, err);
  }

  if (!reply) {
    reply = SORRY;
    handedOff = true;
    // Record the apology so the next turn knows what the customer was told.
    conv.messages.push({ role: "assistant", content: SORRY });
  }
  if (handedOff) {
    conv.pausedUntil = new Date(Date.now() + whatsappConfig.handoffPauseHours() * 3_600_000).toISOString();
  }
  await saveConversation(conv);

  await sendText(waId, reply);
}

/* ───────────── per-customer queue ───────────── */

const pending = new Map<string, IncomingMessage[]>();
const running = new Map<string, Promise<void>>();

/** Recently seen message ids: Meta may deliver the same webhook twice. */
const seen = new Set<string>();
function firstTime(id: string): boolean {
  if (seen.has(id)) return false;
  seen.add(id);
  if (seen.size > 2000) seen.delete(seen.values().next().value!);
  return true;
}

/**
 * Queues a customer message and resolves once it has been answered (or
 * queued behind a reply already being written for the same customer).
 */
export function handleIncoming(message: IncomingMessage): Promise<void> {
  if (!firstTime(message.id)) return Promise.resolve();
  const queue = pending.get(message.waId) ?? [];
  queue.push(message);
  pending.set(message.waId, queue);

  const active = running.get(message.waId);
  if (active) return active;

  const run = (async () => {
    try {
      for (let batch = pending.get(message.waId); batch?.length; batch = pending.get(message.waId)) {
        pending.set(message.waId, []);
        try {
          await handleBatch(batch);
        } catch (err) {
          console.error("[whatsapp] failed to answer", message.waId, err);
        }
      }
    } finally {
      pending.delete(message.waId);
      running.delete(message.waId);
    }
  })();
  running.set(message.waId, run);
  return run;
}
