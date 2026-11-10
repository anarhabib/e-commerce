import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin, signIn } from "./auth.js";
import { priceSchema, requestSchema, statuses } from "./schema.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../products/schema.js";
import { productService } from "../products/service.js";
import { sealOwnerOrderSummary } from "./realtime.js";

export const adminRoutes: FastifyPluginAsync = async (app) => {
  // Global login budget also bounds memory/CPU when all requests arrive via Next.
  let windowStart = Date.now();
  let attempts = 0;
  app.post("/auth/admin/login", async (request, reply) => {
    if (Date.now() - windowStart > 60_000) {
      windowStart = Date.now();
      attempts = 0;
    }
    if (++attempts > 10)
      return reply
        .header("Retry-After", "60")
        .status(429)
        .send({ error: "Too many attempts. Try again in one minute." });
    const body = z
      .strictObject({
        email: z.email().max(254),
        password: z.string().min(1).max(256),
      })
      .parse(request.body);
    const token = signIn(body.email, body.password);
    if (!token)
      return reply.status(401).send({
        error: "Invalid credentials or owner access is not configured",
      });
    return reply.header("Cache-Control", "no-store").send({ token });
  });
  app.register(
    async (admin) => {
      admin.addHook("onRequest", requireAdmin);
      admin.addHook("onSend", async (_request, reply) => {
        reply.header("Cache-Control", "no-store");
      });
      admin.get("/session", async () => ({ email: process.env.ADMIN_EMAIL }));
      admin.get("/part-types", async () => ({
        partTypes: await prisma.partType.findMany({
          orderBy: { name: "asc" },
          select: { code: true, name: true },
        }),
      }));
      admin.post("/live-orders", async () => sealOwnerOrderSummary());
      admin.get("/overview", async () => {
        const [orders, pending, products, recent] = await prisma.$transaction([
          prisma.orderRequest.count(),
          prisma.orderRequest.count({ where: { status: "requested" } }),
          prisma.product.count({ where: { active: true } }),
          prisma.orderRequest.findMany({
            orderBy: { createdAt: "desc" },
            take: 4,
          }),
        ]);
        return { orders, pending, products, recent };
      });
      admin.get("/products", async (request) => {
        const q = z
          .object({
            search: z.string().trim().max(200).default(""),
            page: z.coerce.number().int().min(1).default(1),
            limit: z.coerce.number().int().min(1).max(100).default(20),
          })
          .parse(request.query);
        const where = q.search
          ? {
              OR: ["name", "sku", "make", "model"].map((field) => ({
                [field]: { contains: q.search, mode: "insensitive" as const },
              })),
            }
          : {};
        const [products, total] = await prisma.$transaction([
          prisma.product.findMany({
            include: { partType: { select: { name: true } } },
            where,
            orderBy: [{ createdAt: "desc" }, { id: "asc" }],
            skip: (q.page - 1) * q.limit,
            take: q.limit,
          }),
          prisma.product.count({ where }),
        ]);
        return {
          products,
          total,
          page: q.page,
          limit: q.limit,
          totalPages: Math.ceil(total / q.limit),
        };
      });
      // Admin forms send decimal text; conversion to integer cents happens here.
      function productInput(body: unknown) {
        const { price, ...fields } = z
          .object({ price: priceSchema })
          .passthrough()
          .parse(body);
        return { ...fields, priceCents: price };
      }
      admin.post("/products", async (request, reply) =>
        reply
          .status(201)
          .send(
            await productService.createProduct(
              createProductSchema.parse(productInput(request.body)),
            ),
          ),
      );
      admin.patch<{ Params: { id: string } }>(
        "/products/:id",
        async (request) =>
          productService.updateProduct(
            request.params.id,
            updateProductSchema.parse(productInput(request.body)),
          ),
      );
      admin.delete<{ Params: { id: string } }>(
        "/products/:id",
        async (request, reply) => {
          await productService.deleteProduct(request.params.id);
          return reply.status(204).send();
        },
      );
      admin.get("/orders", async (request) => {
        const q = z
          .object({
            status: z.enum(statuses).optional(),
            page: z.coerce.number().int().min(1).default(1),
          })
          .parse(request.query);
        const where = q.status ? { status: q.status } : {};
        const [orders, total] = await prisma.$transaction([
          prisma.orderRequest.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (q.page - 1) * 20,
            take: 20,
          }),
          prisma.orderRequest.count({ where }),
        ]);
        return {
          orders,
          total,
          page: q.page,
          totalPages: Math.ceil(total / 20),
        };
      });
      admin.get<{ Params: { id: string } }>(
        "/orders/:id",
        async (request, reply) => {
          const order = await prisma.orderRequest.findUnique({
            where: { id: request.params.id },
          });
          return (
            order || reply.status(404).send({ error: "Request not found" })
          );
        },
      );
      admin.patch<{ Params: { id: string } }>(
        "/orders/:id",
        async (request) => {
          const data = z
            .strictObject({ status: z.enum(statuses) })
            .parse(request.body);
          return prisma.orderRequest.update({
            where: { id: request.params.id },
            data,
          });
        },
      );
      // Owner intake supports phone/email requests without inventing customer accounts.
      admin.post("/orders", async (request, reply) => {
        const input = requestSchema.parse(request.body);
        const existing = await prisma.orderRequest.findUnique({
          where: { id: input.id },
        });
        if (existing) return existing;
        const products = await prisma.product.findMany({
          where: {
            id: { in: input.items.map((i) => i.productId) },
            active: true,
          },
        });
        const quantities = new Map<string, number>();
        for (const item of input.items)
          quantities.set(
            item.productId,
            (quantities.get(item.productId) || 0) + item.quantity,
          );
        for (const [id, quantity] of quantities) {
          const product = products.find((p) => p.id === id);
          if (!product || quantity > product.stock)
            return reply.status(400).send({
              error:
                "Product unavailable or requested quantity exceeds current stock",
            });
        }
        const items = [];
        for (const item of input.items) {
          const product = products.find((p) => p.id === item.productId)!;
          if (
            !product.patterns.includes(item.pattern) ||
            !product.finishes.includes(item.finish)
          )
            return reply
              .status(400)
              .send({ error: "Selected product option is unavailable" });
          items.push({
            ...item,
            name: product.name,
            make: product.make,
            model: product.model,
            yearFrom: product.yearFrom,
            yearTo: product.yearTo,
            unitCents: product.priceCents,
          });
        }
        const totalCents = items.reduce(
          (total, item) => total + item.unitCents * item.quantity,
          0,
        );
        if (!Number.isSafeInteger(totalCents) || totalCents > 2147483647)
          return reply
            .status(400)
            .send({ error: "Request total is too large" });
        // Upsert makes simultaneous retries with the same UUID create only one request.
        return reply.status(201).send(
          await prisma.orderRequest.upsert({
            where: { id: input.id },
            update: {},
            create: {
              id: input.id,
              customer: input.customer,
              items,
              totalCents,
            },
          }),
        );
      });
    },
    { prefix: "/admin" },
  );
};
