import { readFileSync } from "fs";
import { resolve } from "path";
import { parsePaymentReceiptPdf } from "../lib/dashboard/payment-receipt-pdf";

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: npm run payment:parse -- <receipt.pdf>");
    process.exit(1);
  }

  const abs = resolve(file);
  const buffer = readFileSync(abs);
  const parsed = await parsePaymentReceiptPdf(buffer);
  console.log(JSON.stringify(parsed, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
