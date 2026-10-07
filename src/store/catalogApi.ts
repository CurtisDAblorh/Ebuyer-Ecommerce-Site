import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { PRODUCTS, PRODUCTS_BY_ID, applyFilters, type Filters, type Product } from "@/lib/catalog";

/**
 * Catalog API. Backed by the bundled product snapshot with a small simulated
 * latency, so loading states are real and the data source can be swapped for a
 * live REST endpoint without touching components.
 */
const LATENCY_MS = process.env.NODE_ENV === "test" ? 0 : 180;
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS));

export type ProductPage = { items: Product[]; total: number; page: number; pageCount: number };

export const PAGE_SIZE = 12;

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  baseQuery: fakeBaseQuery<{ message: string }>(),
  endpoints: (build) => ({
    getProducts: build.query<ProductPage, { filters: Filters; page: number }>({
      async queryFn({ filters, page }) {
        await delay();
        const all = applyFilters(PRODUCTS, filters);
        const pageCount = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
        const current = Math.min(page, pageCount);
        return {
          data: {
            items: all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
            total: all.length,
            page: current,
            pageCount,
          },
        };
      },
    }),
    getProduct: build.query<Product, number>({
      async queryFn(id) {
        await delay();
        const product = PRODUCTS_BY_ID.get(id);
        return product ? { data: product } : { error: { message: "Product not found" } };
      },
    }),
  }),
});

export const { useGetProductsQuery, useGetProductQuery } = catalogApi;
