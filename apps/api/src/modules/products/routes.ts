import type { FastifyPluginAsync } from "fastify";
import { productController } from "./controller.js";
import { requireAdmin } from "../admin/auth.js";

export const productRoutes: FastifyPluginAsync = async (app) => {
  app.get("/products", productController.listProducts);
  app.get("/products/filters", productController.getFacets);
  app.get<{ Params: { id: string } }>(
    "/products/:id",
    productController.getProductById,
  );
  app.delete<{ Params: { id: string } }>(
    "/products/:id",
    { onRequest: requireAdmin },
    productController.deleteProduct,
  );
  app.post(
    "/products",
    { onRequest: requireAdmin },
    productController.createProduct,
  );
  app.patch<{ Params: { id: string } }>(
    "/products/:id",
    { onRequest: requireAdmin },
    productController.updateProduct,
  );
};
