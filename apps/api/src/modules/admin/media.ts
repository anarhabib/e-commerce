import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "./auth.js";
import { randomUUID } from "node:crypto";
import { objectStorage } from "../../lib/object-storage.js";

export const mediaRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/admin/images",
    { onRequest: requireAdmin, bodyLimit: 7 * 1024 * 1024 },
    async (request, reply) => {
      const { data } = z
        .strictObject({
          data: z
            .string()
            .max(7 * 1024 * 1024)
            .regex(/^[A-Za-z0-9+/]+={0,2}$/),
        })
        .parse(request.body);
      const bytes = Buffer.from(data, "base64");
      if (bytes.length > 5 * 1024 * 1024)
        return reply
          .status(413)
          .send({ error: "Images must be 5 MB or smaller" });
      const hex = bytes.subarray(0, 12).toString("hex");
      const contentType = hex.startsWith("89504e470d0a1a0a")
        ? "image/png"
        : hex.startsWith("ffd8ff")
          ? "image/jpeg"
          : bytes.toString("ascii", 0, 4) === "RIFF" &&
              bytes.toString("ascii", 8, 12) === "WEBP"
            ? "image/webp"
            : null;
      if (!contentType)
        return reply
          .status(400)
          .send({ error: "Choose a JPEG, PNG or WebP image" });
      const storage = objectStorage();
      const id = randomUUID();
      const objectKey = storage ? `product-images/${id}` : null;
      if (storage && objectKey)
        await storage.upload(objectKey, bytes, contentType);
      let asset;
      try {
        asset = await prisma.mediaAsset.create({
          data: {
            id,
            contentType,
            ...(objectKey ? { objectKey } : { data: bytes }),
          },
          select: { id: true },
        });
      } catch (error) {
        if (storage && objectKey)
          await storage.remove(objectKey).catch(() => {});
        throw error;
      }
      return reply.status(201).send({ url: `/media/${asset.id}` });
    },
  );
  app.get<{ Params: { id: string } }>("/media/:id", async (request, reply) => {
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: request.params.id },
    });
    if (!asset) return reply.status(404).send({ error: "Image not found" });
    const storage = asset.objectKey ? objectStorage() : undefined;
    if (asset.objectKey && !storage)
      return reply.status(503).send({ error: "Image storage is unavailable" });
    const bytes =
      asset.objectKey && storage
        ? await storage.download(asset.objectKey)
        : asset.data
          ? Buffer.from(asset.data)
          : null;
    if (!bytes) return reply.status(404).send({ error: "Image not found" });
    return reply
      .header("X-Content-Type-Options", "nosniff")
      .header("Cache-Control", "public, max-age=31536000, immutable")
      .type(asset.contentType)
      .send(bytes);
  });
};
