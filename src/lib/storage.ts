import { randomUUID } from "crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_PDF_TYPES = new Set(["application/pdf"]);

export type UploadContext = "property" | "lead";

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );
}

function getS3Client(): S3Client {
  if (!isStorageConfigured()) {
    throw new Error("Storage R2/S3 não configurado. Verifique as variáveis S3_* no .env");
  }

  return new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
}

export function getPublicObjectUrl(key: string): string {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, "");
  if (base) return `${base}/${key}`;
  return `${process.env.S3_ENDPOINT?.replace(/\/$/, "")}/${process.env.S3_BUCKET}/${key}`;
}

function assertAllowedUpload(file: File, allowPdf: boolean): string {
  const contentType = file.type || "application/octet-stream";
  const isImage = ALLOWED_IMAGE_TYPES.has(contentType);
  const isPdf = allowPdf && ALLOWED_PDF_TYPES.has(contentType);

  if (!isImage && !isPdf) {
    throw new Error("Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou PDF.");
  }

  const maxBytes = isPdf ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    throw new Error(`Arquivo muito grande. Máximo: ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  }

  return contentType;
}

export async function uploadFile(
  file: File,
  context: UploadContext,
  entityId: string,
  options?: { allowPdf?: boolean },
): Promise<{ key: string; url: string; contentType: string; size: number }> {
  const contentType = assertAllowedUpload(file, options?.allowPdf ?? false);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const maxBytes =
    ALLOWED_PDF_TYPES.has(contentType) && (options?.allowPdf ?? false)
      ? MAX_PDF_BYTES
      : MAX_IMAGE_BYTES;
  if (buffer.length > maxBytes) {
    throw new Error(`Arquivo muito grande. Máximo: ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const key = `${context}/${entityId}/${randomUUID()}.${ext}`;

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
    }),
  );

  return {
    key,
    url: getPublicObjectUrl(key),
    contentType,
    size: buffer.length,
  };
}

export async function deleteFileByUrl(url: string): Promise<void> {
  if (!isStorageConfigured()) return;

  const publicBase = process.env.S3_PUBLIC_URL?.replace(/\/$/, "");
  let key: string | null = null;

  if (publicBase && url.startsWith(publicBase)) {
    key = url.slice(publicBase.length + 1);
  } else {
    const bucket = process.env.S3_BUCKET;
    const marker = `/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx !== -1) key = url.slice(idx + marker.length);
  }

  if (!key) return;

  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
    }),
  );
}

export function inferMediaType(contentType: string): "IMAGE" | "PDF" {
  return contentType === "application/pdf" ? "PDF" : "IMAGE";
}
