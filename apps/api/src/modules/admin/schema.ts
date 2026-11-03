import { z } from "zod";

export const statuses = [
  "requested",
  "in_review",
  "quoted",
  "in_production",
  "shipped",
  "cancelled",
] as const;
export const customerSchema = z.strictObject({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  phone: z.string().trim().max(60).default(""),
  address: z.string().trim().max(300).default(""),
  city: z.string().trim().max(100).default(""),
  region: z.string().trim().max(100).default(""),
  postal: z.string().trim().max(30).default(""),
  country: z.string().trim().max(100).default(""),
  note: z.string().trim().max(2000).default(""),
});
export const requestSchema = z.strictObject({
  id: z.uuid(),
  customer: customerSchema,
  items: z
    .array(
      z.strictObject({
        productId: z.string().min(1).max(100),
        pattern: z.enum(["Woven", "Forged"]),
        finish: z.enum(["Gloss", "Satin", "Matte"]),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .min(1)
    .max(50),
});
export const priceSchema = z
  .string()
  .regex(
    /^\d{1,6}(\.\d{1,2})?$/,
    "Use a USD price with at most two decimal places",
  )
  .transform((value) => {
    const [dollars, cents = ""] = value.split(".");
    return Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
  })
  .pipe(z.number().int().min(1).max(10000000));
