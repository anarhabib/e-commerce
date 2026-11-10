import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type { ListProductsQuery, FacetsQuery } from "./schema.js";

function vehicleWhere(q: FacetsQuery): Prisma.ProductWhereInput {
  const { make, model, year, search, collection } = q;
  return {
    active: true,
    ...(collection && { collection }),
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
        include: { partType: { select: { name: true } } },
        orderBy:
          query.sort === "newest"
            ? [{ createdAt: "desc" }, { id: "asc" }]
            : query.sort === "price-asc" || query.sort === "price-desc"
              ? [
                  { priceCents: query.sort === "price-asc" ? "asc" : "desc" },
                  { id: "asc" },
                ]
              : [{ sku: "asc" }, { id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
  },

  async getFacets(query: FacetsQuery) {
    const [categories, vehicles, makes, partTypes] = await Promise.all([
      prisma.product.groupBy({
        by: ["category"],
        where: vehicleWhere(query),
        _count: { _all: true },
      }),
      prisma.product.findMany({
        where: {
          ...vehicleWhere({ collection: query.collection }),
          make: { not: null },
          model: { not: null },
        },
        select: { make: true, model: true, yearFrom: true, yearTo: true },
        distinct: ["make", "model", "yearFrom", "yearTo"],
      }),
      prisma.product.findMany({
        where: {
          ...vehicleWhere({ collection: query.collection }),
          make: { not: null },
        },
        select: { make: true },
        distinct: ["make"],
        orderBy: { make: "asc" },
      }),
      prisma.partType.findMany({ select: { code: true, name: true } }),
    ]);

    return {
      makes: makes.flatMap((v) => (v.make ? [v.make] : [])),
      categories: categories.map((c) => ({
        value: c.category,
        label:
          partTypes.find((type) => type.code === c.category)?.name ??
          c.category,
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
};
