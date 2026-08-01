import { readFileSync } from "fs";
import { resolve } from "path";
import { parseTicketPdf } from "../lib/dashboard/ticket-pdf";

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: npm run ticket:parse -- <ticket.pdf>");
    process.exit(1);
  }

  const abs = resolve(file);
  const buffer = readFileSync(abs);
  const parsed = await parseTicketPdf(buffer, abs);
  console.log(JSON.stringify(parsed, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
