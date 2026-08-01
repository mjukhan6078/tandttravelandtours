import {
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const endpoint = process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000";
const accessKey = process.env.MINIO_ACCESS_KEY || "minioadmin";
const secretKey = process.env.MINIO_SECRET_KEY || "minioadmin";
const region = process.env.MINIO_REGION || "us-east-1";

export const MINIO_BUCKET = process.env.MINIO_BUCKET || "tandt-travel";
export const META_KEY = "meta/dashboard.json";

export function objectKeyForDocument(tripId: string, storedName: string) {
  return `uploads/${tripId}/${storedName}`;
}

let client: S3Client | null = null;
let bucketReady: Promise<void> | null = null;

export function getMinioClient() {
  if (!client) {
    client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }
  return client;
}

async function ensureBucket() {
  const s3 = getMinioClient();
  try {
    await s3.send(new HeadBucketCommand({ Bucket: MINIO_BUCKET }));
  } catch {
    try {
      await s3.send(new CreateBucketCommand({ Bucket: MINIO_BUCKET }));
    } catch {
      // Bucket may already exist from a race with minio-init
    }
  }
}

export async function ensureMinioReady() {
  if (!bucketReady) {
    bucketReady = ensureBucket().catch((error) => {
      bucketReady = null;
      throw error;
    });
  }
  await bucketReady;
}

export async function putObject(key: string, body: Buffer | string, contentType?: string) {
  await ensureMinioReady();
  const payload = typeof body === "string" ? Buffer.from(body, "utf8") : body;
  await getMinioClient().send(
    new PutObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: key,
      Body: payload,
      ContentType: contentType || "application/octet-stream",
    })
  );
}

export async function getObjectBuffer(key: string): Promise<Buffer | null> {
  await ensureMinioReady();
  try {
    const result = await getMinioClient().send(
      new GetObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: key,
      })
    );
    if (!result.Body) return null;
    const bytes = await result.Body.transformToByteArray();
    return Buffer.from(bytes);
  } catch (error: unknown) {
    const name = error && typeof error === "object" && "name" in error ? String(error.name) : "";
    if (name === "NoSuchKey" || name === "NotFound") return null;
    throw error;
  }
}

export async function getObjectText(key: string): Promise<string | null> {
  const buffer = await getObjectBuffer(key);
  return buffer ? buffer.toString("utf8") : null;
}

export async function deleteObject(key: string) {
  await ensureMinioReady();
  await getMinioClient().send(
    new DeleteObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: key,
    })
  );
}

export async function deletePrefix(prefix: string) {
  await ensureMinioReady();
  const s3 = getMinioClient();
  let continuationToken: string | undefined;

  do {
    const listed = await s3.send(
      new ListObjectsV2Command({
        Bucket: MINIO_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    const keys = (listed.Contents || [])
      .map((item) => item.Key)
      .filter((key): key is string => Boolean(key));

    if (keys.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: MINIO_BUCKET,
          Delete: {
            Objects: keys.map((Key) => ({ Key })),
          },
        })
      );
    }

    continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
  } while (continuationToken);
}
