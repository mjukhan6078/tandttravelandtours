import { promises as fs } from "fs";
import path from "path";
import type Anthropic from "@anthropic-ai/sdk";

/**
 * One file per customer under .data/whatsapp/, holding the chat history the
 * assistant replays to Claude. The agent handles one customer at a time, so
 * a file never has two writers.
 */

const DIR = path.join(process.cwd(), ".data", "whatsapp");

export type Conversation = {
  waId: string;
  name?: string;
  /** Exactly what was sent to and returned by Claude, so replays stay byte-identical. */
  messages: Anthropic.Beta.BetaMessageParam[];
  /** While set and in the future, the team is handling the chat and the bot stays quiet. */
  pausedUntil?: string;
  createdAt: string;
  updatedAt: string;
};

const fileFor = (waId: string) => path.join(DIR, `${waId.replace(/\D/g, "")}.json`);

export async function loadConversation(waId: string): Promise<Conversation> {
  try {
    const raw = await fs.readFile(fileFor(waId), "utf8");
    const conv = JSON.parse(raw) as Conversation;
    if (Array.isArray(conv.messages)) return conv;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`[whatsapp] unreadable conversation for ${waId}; starting fresh`, err);
    }
  }
  const now = new Date().toISOString();
  return { waId, messages: [], createdAt: now, updatedAt: now };
}

export async function saveConversation(conv: Conversation): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  conv.updatedAt = new Date().toISOString();
  const file = fileFor(conv.waId);
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(conv, null, 2)}\n`, "utf8");
  await fs.rename(tmp, file);
}
