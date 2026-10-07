import type { Order } from "@/store/shopperSlice";
import { DEPARTMENTS, PRODUCTS, salePrice } from "./catalog";
import { computeTotals } from "./pricing";
import { mulberry32 } from "./insights";

/**
 * A few months of example orders so the orders dashboard isn't empty on first
 * visit. Everyday-priced items, rotated across departments and spread over time.
 */
export function sampleOrders(now: number, count = 10): Order[] {
  const rand = mulberry32(42);
  const day = 86_400_000;
  const pools = DEPARTMENTS.map((d) =>
    PRODUCTS.filter((p) => d.categories.includes(p.category) && salePrice(p) < 180),
  );

  return Array.from({ length: count }, (_, i) => {
    const lines = Array.from({ length: 1 + Math.floor(rand() * 3) }, (_l, j) => {
      const pool = pools[(i + j * 2) % pools.length];
      const p = pool[Math.floor(rand() * pool.length)];
      return { product: p, qty: 1 + Math.floor(rand() * 2) };
    });
    const subtotal = lines.reduce((s, l) => s + salePrice(l.product) * l.qty, 0);
    const listTotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    return {
      id: `EB-S${(1000 + i * 137).toString(36).toUpperCase()}`,
      // Roughly two orders a month over the last five months.
      createdAt: now - Math.floor((i * 15 + 3 + rand() * 8) * day),
      lines: lines.map((l) => ({
        id: l.product.id,
        qty: l.qty,
        unitPrice: salePrice(l.product),
        category: l.product.category,
      })),
      totals: computeTotals({ subtotal, listTotal }),
      delivery: "standard",
      address: {
        fullName: "Sample Shopper",
        email: "sample@example.com",
        line1: "1 Example Street",
        city: "London",
        postcode: "E1 6AN",
        country: "United Kingdom",
      },
      sample: true,
    } satisfies Order;
  });
}
