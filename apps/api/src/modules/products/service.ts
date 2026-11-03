import { productRepository } from "./repository.js";
import { NotFoundError } from "../../lib/errors.js";
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
    return await productRepository.create(data);
  },

  async updateProduct(id: string, data: UpdateProductInput) {
    const existing = await productService.getProductById(id);
    fitmentRangeSchema.parse({ ...existing, ...data });
    return await productRepository.update(id, data);
  },
};
