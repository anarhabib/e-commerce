import { z } from "zod";

export const productCategories = ["PADDLES", "CONSOLE", "TRIM"] as const;
export const productCollections = ["INTERIOR", "EXTERIOR"] as const;
export const imageUrlSchema = z
  .string()
  .max(2048)
  .refine((value) => {
    if (
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("\\")
    )
      return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Use a local asset path or HTTP(S) image URL");
const productFields = {
  imageUrls: z
    .array(imageUrlSchema)
    .max(12)
    .refine(
      (urls) => new Set(urls).size === urls.length,
      "Remove duplicate images",
    ),
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and dashes",
    ),
  description: z.string().trim().min(1),
  sku: z.string().trim().min(1).max(50),
  category: z.enum(productCategories),
  collection: z.enum(productCollections),
  priceCents: z.number().int().positive().max(10000000),
  stock: z.number().int().min(0).max(2147483647),
  active: z.boolean(),
  currency: z.literal("USD"),
  photoIndex: z.number().int().min(0).max(3).nullable(),
  isSample: z.boolean(),
  patterns: z.array(z.enum(["Woven", "Forged"])).min(1),
  finishes: z.array(z.enum(["Gloss", "Satin", "Matte"])).min(1),
  imageUrl: z
    .string()
    .refine((value) => {
      if (value.startsWith("/") && !value.startsWith("//")) return true;
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, "Use a local asset path or HTTP(S) image URL")
    .nullable(),
  make: z.string().trim().min(1).nullable(),
  model: z.string().trim().min(1).nullable(),
  yearFrom: z.number().int().min(1900).max(2100).nullable(),
  yearTo: z.number().int().min(1900).max(2100).nullable(),
};
function validYearRange(data: {
  yearFrom?: number | null;
  yearTo?: number | null;
}) {
  return (
    data.yearFrom == null || data.yearTo == null || data.yearFrom <= data.yearTo
  );
}
const yearRangeError = {
  message: "Starting year must not exceed ending year",
  path: ["yearTo"],
};

// PATCH must also validate the resulting record, including fields not in the request.
export const fitmentRangeSchema = z
  .object({
    yearFrom: productFields.yearFrom.optional(),
    yearTo: productFields.yearTo.optional(),
  })
  .refine(validYearRange, yearRangeError);

export const createProductSchema = z
  .strictObject({
    name: productFields.name,
    slug: productFields.slug,
    description: productFields.description,
    sku: productFields.sku,
    category: productFields.category,
    collection: productFields.collection.default("INTERIOR"),
    priceCents: productFields.priceCents,
    stock: productFields.stock.default(0),
    active: productFields.active.default(true),
    currency: productFields.currency.default("USD"),
    photoIndex: productFields.photoIndex.optional(),
    isSample: productFields.isSample.default(false),
    patterns: productFields.patterns.default(["Woven", "Forged"]),
    finishes: productFields.finishes.default(["Gloss", "Satin", "Matte"]),
    imageUrl: productFields.imageUrl.optional(),
    imageUrls: productFields.imageUrls.optional(),
    make: productFields.make.optional(),
    model: productFields.model.optional(),
    yearFrom: productFields.yearFrom.optional(),
    yearTo: productFields.yearTo.optional(),
  })
  .refine(validYearRange, yearRangeError);

export const updateProductSchema = z
  .strictObject(productFields)
  .partial()
  .refine(validYearRange, yearRangeError)
  .refine((data) => Object.keys(data).length > 0, {
    message: "Send at least one field to update",
  });

const toArray = (value: unknown) =>
  value === undefined ? undefined : Array.isArray(value) ? value : [value];
export const listProductsQuerySchema = z.object({
  collection: z.enum(productCollections).optional(),
  category: z.preprocess(
    toArray,
    z.array(z.enum(productCategories)).optional(),
  ),
  make: z.string().trim().min(1).optional(),
  model: z.string().trim().min(1).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  search: z.string().trim().min(1).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const facetsQuerySchema = listProductsQuerySchema.pick({
  collection: true,
  make: true,
  model: true,
  year: true,
  search: true,
});
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type FacetsQuery = z.infer<typeof facetsQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
