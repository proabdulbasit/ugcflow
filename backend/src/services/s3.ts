import { randomUUID } from 'crypto';
import path from 'path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { UploadPurpose } from '../config/uploads.js';

let s3Client: S3Client | null = null;

function getBucketConfig() {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_S3_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error('AWS S3 is not configured. Set AWS_S3_BUCKET_NAME, AWS_S3_REGION, AWS_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY.');
  }

  return { bucket, region, accessKeyId, secretAccessKey };
}

export function getS3Client() {
  if (s3Client) return s3Client;
  const { region, accessKeyId, secretAccessKey } = getBucketConfig();
  s3Client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
  return s3Client;
}

export function buildObjectKey(
  purpose: UploadPurpose,
  filename: string,
  owner: { userId?: string; uploadSessionId?: string }
) {
  const ext = path.extname(filename).toLowerCase() || '';
  const safeName = `${Date.now()}-${randomUUID()}${ext}`;
  const folder =
    owner.userId != null
      ? `creators/${owner.userId}/${purpose}`
      : `creators/pending/${owner.uploadSessionId}/${purpose}`;
  return `${folder}/${safeName}`;
}

export function publicObjectUrl(key: string) {
  const { bucket, region } = getBucketConfig();
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURI(key).replace(/%2F/g, '/')}`;
}

export async function uploadBufferToS3(
  buffer: Buffer,
  key: string,
  contentType: string
) {
  const { bucket } = getBucketConfig();
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return publicObjectUrl(key);
}

export async function createPresignedUploadUrl(key: string, contentType: string) {
  const { bucket } = getBucketConfig();
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });
  return { uploadUrl, publicUrl: publicObjectUrl(key), key };
}
