import { readFileSync } from "fs";
import { resolve } from "path";
import { parseHotelVoucherPdf } from "../lib/dashboard/hotel-voucher-pdf";

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: npm run hotel:parse -- <hotel-voucher.pdf>");
    process.exit(1);
  }

  const abs = resolve(file);
  const buffer = readFileSync(abs);
  const parsed = await parseHotelVoucherPdf(buffer);
  console.log(JSON.stringify(parsed, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
