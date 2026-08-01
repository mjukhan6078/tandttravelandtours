import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import {
  CreateBucketCommand,
  HeadBucketCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.local"));

const endpoint = process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000";
const accessKey = process.env.MINIO_ACCESS_KEY || "minioadmin";
const secretKey = process.env.MINIO_SECRET_KEY || "minioadmin";
const region = process.env.MINIO_REGION || "us-east-1";
const bucket = process.env.MINIO_BUCKET || "tandt-travel";

const client = new S3Client({
  region,
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});

async function bucketExists() {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    return true;
  } catch (error) {
    const status = error?.$metadata?.httpStatusCode;
    const name = error?.name || "";
    // 404 / NotFound => does not exist; 403 may mean exists but no access
    if (status === 404 || name === "NotFound" || name === "NoSuchBucket") {
      return false;
    }
    if (status === 301 || status === 400) {
      return false;
    }
    throw error;
  }
}

async function main() {
  console.log(`MinIO endpoint: ${endpoint}`);
  console.log(`Checking bucket: ${bucket}`);

  const exists = await bucketExists();
  if (exists) {
    console.log(`Bucket "${bucket}" already exists.`);
    return;
  }

  console.log(`Bucket "${bucket}" not found. Creating...`);
  await client.send(new CreateBucketCommand({ Bucket: bucket }));
  console.log(`Bucket "${bucket}" created.`);
}

main().catch((error) => {
  console.error("Failed to ensure MinIO bucket:");
  console.error(error?.message || error);
  process.exit(1);
});
