import Fastify from "fastify";
import { prisma } from "./lib/prisma.js";
import { productRoutes } from "./modules/products/routes.js";
import { NotFoundError } from "./lib/errors.js";
import { ZodError } from "zod";
import { adminRoutes } from "./modules/admin/routes.js";
import { mediaRoutes } from "./modules/admin/media.js";
import { closeObjectStorage } from "./lib/object-storage.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  // Render uses this lightweight route to check whether the API process is up.
  // It intentionally does not query PostgreSQL, so health checks do not wake Neon.
  app.get("/health", async () => ({ status: "ok" }));

  app.setErrorHandler((error, request, reply) => {
    // 1. Our own "not found" errors
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ error: error.message });
    }

    // 2. Prisma: "record not found" (delete/update of a missing row)
    if ((error as { code?: string }).code === "P2025") {
      return reply.status(404).send({ error: "Not found" });
    }

    // 3. Zod validation errors
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "Validation failed",
        details: error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }

    if ((error as { code?: string }).code === "P2002") {
      return reply
        .status(409)
        .send({ error: "A product with this SKU or slug already exists" });
    }
    if ((error as { code?: string }).code === "P2003") {
      return reply
        .status(409)
        .send({
          error:
            "The selected part type is in use or does not match the product collection. Refresh and try again.",
        });
    }
    const httpError = error as { statusCode?: number; message?: string };
    if (
      httpError.statusCode &&
      httpError.statusCode >= 400 &&
      httpError.statusCode < 500
    ) {
      return reply
        .status(httpError.statusCode)
        .send({ error: httpError.message });
    }
    // 4. Everything else: log the details, hide them from the client
    request.log.error(error);
    return reply.status(500).send({ error: "Internal server error" });
  });
  app.register(productRoutes);
  app.register(adminRoutes);
  app.register(mediaRoutes);
  app.addHook("onClose", async () => {
    await prisma.$disconnect();
    closeObjectStorage();
  });

  return app;
}
