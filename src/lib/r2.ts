import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = () => process.env.R2_BUCKET_NAME!;

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function getPresignedPutUrl(
  key: string,
  contentType: string,
  expiresInSec = 600
): Promise<string> {
  return getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: BUCKET(),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: expiresInSec }
  );
}

export async function getObjectFromR2(key: string): Promise<Buffer> {
  const res = await r2.send(
    new GetObjectCommand({ Bucket: BUCKET(), Key: key })
  );
  const stream = res.Body as unknown as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET(), Key: key }));
}

// ─── Приватний бакет ───
// Записи розмов з клієнтами — адвокатська таємниця. Основний бакет публічний
// (R2_PUBLIC_URL), тож аудіо живе в окремому бакеті без публічного доступу;
// слухати й віддавати його назовні можна лише через підписані посилання.

const PRIVATE_BUCKET = () => {
  const name = process.env.R2_PRIVATE_BUCKET_NAME;
  if (!name) throw new Error("R2_PRIVATE_BUCKET_NAME не задано");
  return name;
};

export function privateBucketConfigured(): boolean {
  return !!process.env.R2_PRIVATE_BUCKET_NAME;
}

export async function putPrivate(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: PRIVATE_BUCKET(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function presignedPutPrivate(
  key: string,
  contentType: string,
  expiresInSec = 900
): Promise<string> {
  return getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: PRIVATE_BUCKET(), Key: key, ContentType: contentType }),
    { expiresIn: expiresInSec }
  );
}

export async function presignedGetPrivate(
  key: string,
  expiresInSec = 600
): Promise<string> {
  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: PRIVATE_BUCKET(), Key: key }),
    { expiresIn: expiresInSec }
  );
}

/** Розмір об'єкта в байтах або null, якщо його немає. */
export async function headPrivate(key: string): Promise<number | null> {
  try {
    const res = await r2.send(new HeadObjectCommand({ Bucket: PRIVATE_BUCKET(), Key: key }));
    return res.ContentLength ?? 0;
  } catch (e) {
    const status = (e as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status === 404) return null;
    throw e;
  }
}

export async function deletePrivate(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: PRIVATE_BUCKET(), Key: key }));
}
