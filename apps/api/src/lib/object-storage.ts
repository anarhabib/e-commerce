import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

let client: S3Client | undefined;
export function closeObjectStorage() {
  client?.destroy();
  client = undefined;
}
export function objectStorage() {
  const keys = [
    "AWS_ENDPOINT_URL_S3",
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
  ];
  const configured = keys.filter((key) => process.env[key]);
  if (!configured.length) return undefined;
  if (configured.length !== keys.length)
    throw new Error("Object storage configuration is incomplete");
  client ??= new S3Client({
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  const bucket = process.env.MEDIA_BUCKET || "assets";
  return {
    async upload(key: string, body: Buffer, contentType: string) {
      await client!.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
    },
    async download(key: string) {
      const object = await client!.send(
        new GetObjectCommand({ Bucket: bucket, Key: key }),
      );
      if (!object.Body) throw new Error("Image object is empty");
      return Buffer.from(await object.Body.transformToByteArray());
    },
    async remove(key: string) {
      await client!.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
  };
}
