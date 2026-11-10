import { productRepository } from "./repository.js";
import { NotFoundError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { randomUUID } from "node:crypto";
import type { Prisma } from "../../generated/prisma/client.js";

async function saveWithPartType<T>(
  save: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  try {
    return await prisma.$transaction(save);
  } catch (error) {
    const conflict = error as {
      code?: string;
      meta?: { modelName?: string; target?: unknown };
    };
    // A concurrent product save may have just created the same normalized type.
    // Retry the rolled-back transaction to return the friendly duplicate error.
    if (
      conflict.code === "P2002" &&
      (conflict.meta?.modelName === "PartType" ||
        String(conflict.meta?.target).includes("nameKey"))
    )
      return prisma.$transaction(save);
    throw error;
  }
}

async function resolvePartType(
  tx: Prisma.TransactionClient,
  category: string | undefined,
  name?: string,
) {
  if (name) {
    const nameKey = name.toLowerCase();
    const prefix =
      name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
        .toUpperCase() || "PART";
    if (await tx.partType.findUnique({ where: { nameKey } }))
      throw Object.assign(
        new Error(
          "This part type already exists. Select it from the Part type dropdown.",
        ),
        { statusCode: 409 },
      );
    const type = await tx.partType.create({
      data: {
        code: `${prefix.slice(0, 80)}_${randomUUID().slice(0, 8).toUpperCase()}`,
        name,
        nameKey,
      },
    });
    return type.code;
  }
  const type = category
    ? await tx.partType.findUnique({ where: { code: category } })
    : null;
  if (!type)
    throw Object.assign(
      new Error("Choose an existing part type or enter a new name"),
      { statusCode: 400 },
    );
  return type.code;
}
import {
  fitmentRangeSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "./schema.js";
import type { FacetsQuery, ListProductsQuery } from "./schema.js";

export const productService = {
  async listProducts(query: ListProductsQuery) {
    const [products, total] = await productRepository.findMany(query);
    return {
      products,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  },

  getFacets(query: FacetsQuery) {
    return productRepository.getFacets(query);
  },

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Product not found`);
    }
    return product;
  },

  async deleteProduct(id: string) {
    await productService.getProductById(id);
    await productRepository.deleteById(id);
  },

  async createProduct(data: CreateProductInput) {
    const imageUrls = data.imageUrls ?? (data.imageUrl ? [data.imageUrl] : []);
    const { partTypeName, ...fields } = data;
    return saveWithPartType(async (tx) => {
      const category = await resolvePartType(tx, data.category, partTypeName);
      return tx.product.create({
        data: {
          ...fields,
          category,
          imageUrls,
          imageUrl: imageUrls[0] ?? null,
        },
      });
    });
  },

  async updateProduct(id: string, data: UpdateProductInput) {
    const existing = await productService.getProductById(id);
    fitmentRangeSchema.parse({ ...existing, ...data });
    const gallery =
      data.imageUrls ??
      (data.imageUrl !== undefined
        ? data.imageUrl
          ? [data.imageUrl]
          : []
        : undefined);
    const { partTypeName, ...fields } = data;
    return saveWithPartType(async (tx) => {
      const category = await resolvePartType(
        tx,
        data.category ?? existing.category,
        partTypeName,
      );
      return tx.product.update({
        where: { id },
        data: {
          ...fields,
          category,
          ...(gallery !== undefined
            ? { imageUrls: gallery, imageUrl: gallery[0] ?? null }
            : {}),
        },
      });
    });
  },
};
