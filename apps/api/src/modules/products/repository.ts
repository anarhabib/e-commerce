import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type {
  CreateProductInput,
  UpdateProductInput,
  ListProductsQuery,
  FacetsQuery,
} from "./schema.js";

function vehicleWhere(q: FacetsQuery): Prisma.ProductWhereInput {
  const { make, model, year, search } = q;
  return {
    active: true,
    ...(make && { make: { equals: make, mode: "insensitive" } }),
    ...(model && { model: { equals: model, mode: "insensitive" } }),
    ...(year && { yearFrom: { lte: year }, yearTo: { gte: year } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    }),
  };
}

export const productRepository = {
  findMany(query: ListProductsQuery) {
    const { category, page, limit } = query;

    const where: Prisma.ProductWhereInput = {
      ...vehicleWhere(query),
      ...(category && category.length > 0 && { category: { in: category } }),
    };

    return prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: { sku: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
  },

  async getFacets(query: FacetsQuery) {
    const [categories, vehicles] = await Promise.all([
      prisma.product.groupBy({
        by: ["category"],
        where: vehicleWhere(query),
        _count: { _all: true },
      }),
      prisma.product.findMany({
        where: { active: true, make: { not: null }, model: { not: null } },
        select: { make: true, model: true, yearFrom: true, yearTo: true },
        distinct: ["make", "model", "yearFrom", "yearTo"],
      }),
    ]);

    return {
      categories: categories.map((c) => ({
        value: c.category,
        count: c._count._all,
      })),
      vehicles: vehicles.flatMap((v) =>
        v.make && v.model
          ? [
              {
                make: v.make,
                model: v.model,
                yearFrom: v.yearFrom,
                yearTo: v.yearTo,
              },
            ]
          : [],
      ),
    };
  },

  findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  },

  deleteById(id: string) {
    return prisma.product.delete({ where: { id } });
  },

  create(data: CreateProductInput) {
    return prisma.product.create({ data });
  },

  update(id: string, data: UpdateProductInput) {
    return prisma.product.update({ where: { id }, data });
  },
};
