import { promises as fs } from "fs";
import path from "path";
import type { InquiryRecord } from "./types";

export type { InquiryType, InquiryRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "inquiries.json");

/**
 * Writes run one at a time: concurrent read-modify-write cycles would otherwise
 * interleave and corrupt the file, after which every inquiry fails.
 */
let queue: Promise<unknown> = Promise.resolve();

async function readAll(): Promise<InquiryRecord[]> {
  let raw: string;
  try {
    raw = await fs.readFile(DATA_FILE, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  try {
    const list = JSON.parse(raw || "[]");
    if (Array.isArray(list)) return list as InquiryRecord[];
  } catch {
    // fall through
  }
  // Keep the unreadable file for recovery and start a fresh one, so new
  // inquiries are still accepted.
  const backup = path.join(DATA_DIR, `inquiries.corrupt-${Date.now()}.json`);
  await fs.rename(DATA_FILE, backup);
  console.error(`[inquire] ${DATA_FILE} was unreadable; moved it to ${backup}`);
  return [];
}

async function write(input: Omit<InquiryRecord, "id" | "createdAt">): Promise<InquiryRecord> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const list = await readAll();
  const record: InquiryRecord = {
    ...input,
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  list.push(record);
  // Write to a temp file and rename, so a crash mid-write never leaves half a file.
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(list, null, 2)}\n`, "utf8");
  await fs.rename(tmp, DATA_FILE);
  return record;
}

export function appendInquiry(
  input: Omit<InquiryRecord, "id" | "createdAt">
): Promise<InquiryRecord> {
  const run = queue.then(() => write(input));
  queue = run.catch(() => undefined);
  return run;
}
