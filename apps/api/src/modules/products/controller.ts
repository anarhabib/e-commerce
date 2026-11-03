import type { FastifyReply, FastifyRequest } from "fastify";
import { productService } from "./service.js";
import {
  createProductSchema,
  facetsQuerySchema,
  listProductsQuerySchema,
  updateProductSchema,
} from "./schema.js";

type ProductIdParams = {
  id: string;
};

export const productController = {
  async listProducts(request: FastifyRequest) {
    const query = listProductsQuerySchema.parse(request.query);
    return productService.listProducts(query);
  },

  async getFacets(request: FastifyRequest) {
    const query = facetsQuerySchema.parse(request.query);
    return productService.getFacets(query);
  },

  async getProductById(
    request: FastifyRequest<{ Params: ProductIdParams }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const product = await productService.getProductById(id);
    if (!product.active)
      return reply.status(404).send({ error: "Product not found" });
    return product;
  },

  async deleteProduct(
    request: FastifyRequest<{ Params: ProductIdParams }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    await productService.deleteProduct(id);
    return reply.status(204).send();
  },

  async createProduct(request: FastifyRequest, reply: FastifyReply) {
    const data = createProductSchema.parse(request.body);
    const product = await productService.createProduct(data);
    return reply.status(201).send(product);
  },

  async updateProduct(
    request: FastifyRequest<{ Params: ProductIdParams }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const data = updateProductSchema.parse(request.body);
    const product = await productService.updateProduct(id, data);
    return reply.send(product);
  },
};
