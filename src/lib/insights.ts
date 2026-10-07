import type { Product, Review } from "./catalog";

/** Deterministic PRNG so generated data is stable across builds and renders. */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type PricePoint = { date: Date; price: number };

/**
 * A plausible 90-day price history ending at today's sale price: a slow random
 * walk with occasional flash-sale dips. The catalog has no real history, so this
 * is generated from the product id.
 */
export function priceHistory(
  product: Pick<Product, "id" | "price" | "discountPercentage">,
  end: Date,
  days = 90,
): PricePoint[] {
  const rand = mulberry32(product.id * 7919);
  const current = product.price * (1 - product.discountPercentage / 100);
  const points: PricePoint[] = [];
  let price = product.price * (0.95 + rand() * 0.1);
  for (let i = days; i >= 0; i--) {
    price += (rand() - 0.5) * product.price * 0.02;
    price = Math.min(product.price * 1.08, Math.max(product.price * 0.7, price));
    const sale = rand() < 0.04 ? 0.82 : 1;
    const date = new Date(end);
    date.setDate(end.getDate() - i);
    points.push({ date, price: Math.round((i === 0 ? current : price * sale) * 100) / 100 });
  }
  return points;
}

export function ratingDistribution(reviews: Review[]): { stars: number; count: number }[] {
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => Math.round(r.rating) === stars).length,
  }));
}

export function priceStats(points: PricePoint[]) {
  const prices = points.map((p) => p.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const current = prices.at(-1) ?? 0;
  return { low, high, avg, current, isLowest: current <= low + 0.01 };
}
