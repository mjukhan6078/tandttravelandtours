import { promises as fs } from "fs";
import path from "path";
import type { InquiryRecord } from "./types";

export type { InquiryType, InquiryRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "inquiries.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]\n", "utf8");
  }
}

export async function appendInquiry(
  input: Omit<InquiryRecord, "id" | "createdAt">
): Promise<InquiryRecord> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const list = JSON.parse(raw || "[]") as InquiryRecord[];
  const record: InquiryRecord = {
    ...input,
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  list.push(record);
  await fs.writeFile(DATA_FILE, `${JSON.stringify(list, null, 2)}\n`, "utf8");
  return record;
}
