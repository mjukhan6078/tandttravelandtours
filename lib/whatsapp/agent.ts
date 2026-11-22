import { AnthropicBedrockMantle } from "@anthropic-ai/bedrock-sdk";
import Anthropic, { BetaFallbackState, betaRefusalFallbackMiddleware } from "@anthropic-ai/sdk";
import { markReadWithTyping, sendText, type IncomingMessage } from "./cloud-api";
import { whatsappConfig } from "./config";
import { systemPrompt } from "./knowledge";
import { loadConversation, saveConversation, type Conversation } from "./store";
import { TOOLS, runTool } from "./tools";

/**
 * The WhatsApp auto-responder: Claude in Amazon Bedrock, with the site's data
 * in the system prompt and two tools (quotes, handover to the team).
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

let client: AnthropicBedrockMantle | null = null;

function getClient(): AnthropicBedrockMantle {
  if (client) return client;
  const fallback = whatsappConfig.fallbackModel();
  client = new AnthropicBedrockMantle({
    awsRegion: whatsappConfig.awsRegion(),
    // If the main model declines a message (a safety false positive), retry it on the fallback model.
    middleware: fallback ? [betaRefusalFallbackMiddleware([{ model: fallback }])] : [],
  });
  return client;
}

/** Keeps later turns on the fallback model once it has taken over a chat. */
const fallbackStates = new Map<string, BetaFallbackState>();

function fallbackStateFor(waId: string): BetaFallbackState {
  let state = fallbackStates.get(waId);
  if (!state) {
    state = new BetaFallbackState();
    fallbackStates.set(waId, state);
  }
  return state;
}

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

/**
 * Drops old turns once a chat gets long. The kept part starts at a customer
 * message, and every earlier thinking block is removed: Claude only accepts a
 * replayed thinking block when everything before it is unchanged.
 */
function trimHistory(messages: Anthropic.Beta.BetaMessageParam[]): Anthropic.Beta.BetaMessageParam[] {
  if (messages.length <= MAX_MESSAGES) return messages;
  const isCustomerTurn = (m: Anthropic.Beta.BetaMessageParam) =>
    m.role === "user" &&
    (typeof m.content === "string" || m.content.every((b) => b.type === "text"));
  let start = messages.length - KEEP_MESSAGES;
  while (start < messages.length && !isCustomerTurn(messages[start])) start++;
  if (start >= messages.length) return [];
  return messages.slice(start).map((m) =>
    m.role === "assistant" && Array.isArray(m.content)
      ? { ...m, content: m.content.filter((b) => b.type !== "thinking" && b.type !== "redacted_thinking") }
      : m
  );
}

function textOf(content: Anthropic.Beta.BetaContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n\n")
    .trim();
}

/** Runs Claude over the conversation until it has a reply for the customer. */
async function respond(conv: Conversation, onHandoff: () => void): Promise<string> {
  const ctx = { waId: conv.waId, profileName: conv.name, onHandoff };

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const response = await getClient().beta.messages.create(
      {
        model: whatsappConfig.model(),
        max_tokens: 16000,
        // Caches the system prompt and the chat so far; each new turn reads it back cheaply.
        cache_control: { type: "ephemeral" },
        system: systemPrompt(),
        tools: TOOLS,
        messages: conv.messages,
        output_config: { effort: "medium" },
      },
      { fallbackState: fallbackStateFor(conv.waId) }
    );

    // Store the whole reply, thinking blocks included, so the next request replays it unchanged.
    conv.messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "refusal") {
      // Every model in the chain declined. Drop the partial reply; the caller hands over.
      console.warn("[whatsapp] model declined", conv.waId, response.stop_details);
      conv.messages.pop();
      return "";
    }

    if (response.stop_reason === "pause_turn") continue;

    if (response.stop_reason === "tool_use") {
      const calls = response.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
      const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
      for (const call of calls) {
        const r = await runTool(call.name, call.input, ctx);
        results.push({ type: "tool_result", tool_use_id: call.id, content: r.content, is_error: r.isError });
      }
      conv.messages.push({ role: "user", content: results });
      continue;
    }

    if (response.content.some((b) => b.type === "tool_use")) {
      // Cut off mid tool call (max_tokens): an unanswered tool_use would break the next request.
      conv.messages.pop();
      return "";
    }
    return textOf(response.content);
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
    fallbackStates.delete(waId);
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
  conv.messages.push({ role: "user", content: [{ type: "text", text: lines.join("\n") }] });

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
    console.error("[whatsapp] Claude request failed", waId, err);
  }

  if (!reply) {
    reply = SORRY;
    handedOff = true;
    // Record the apology so the next turn knows what the customer was told.
    conv.messages.push({ role: "assistant", content: [{ type: "text", text: SORRY }] });
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
