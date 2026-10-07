import {
  DEFAULT_FILTERS,
  PRODUCTS,
  applyFilters,
  categoryLabel,
  departmentOf,
  filterWithoutPrice,
  relatedProducts,
  salePrice,
} from "./catalog";
import { FREE_SHIPPING_THRESHOLD, computeTotals, findPromo, formatPrice } from "./pricing";
import {
  cardBrand,
  expiryInFuture,
  formatCardNumber,
  formatExpiry,
  luhn,
  paymentSchema,
  shippingSchema,
} from "./checkout";
import { priceHistory, priceStats, ratingDistribution } from "./insights";
import { departmentSpend, monthlySpend } from "./spending";
import { sampleOrders } from "./sampleOrders";

describe("catalog", () => {
  it("computes sale prices to the penny", () => {
    expect(salePrice({ price: 100, discountPercentage: 12.5 })).toBe(87.5);
    expect(salePrice({ price: 9.99, discountPercentage: 0 })).toBe(9.99);
  });

  it("labels categories", () => {
    expect(categoryLabel("mens-watches")).toBe("Men's Watches");
    expect(categoryLabel("home-decoration")).toBe("Home Decoration");
  });

  it("maps every product to a department", () => {
    expect(PRODUCTS.every((p) => departmentOf(p.category))).toBe(true);
  });

  it("filters by query, department, rating, stock and price", () => {
    const phones = applyFilters(PRODUCTS, { ...DEFAULT_FILTERS, query: "iphone" });
    expect(phones.length).toBeGreaterThan(0);
    expect(phones.every((p) => /iphone/i.test(p.title + p.tags.join(" ")))).toBe(true);

    const tech = applyFilters(PRODUCTS, {
      ...DEFAULT_FILTERS,
      departments: ["tech"],
      minRating: 4,
    });
    expect(tech.every((p) => departmentOf(p.category)?.id === "tech" && p.rating >= 4)).toBe(true);

    const cheap = applyFilters(PRODUCTS, { ...DEFAULT_FILTERS, price: [0, 20] });
    expect(cheap.every((p) => salePrice(p) <= 20)).toBe(true);
    expect(filterWithoutPrice(PRODUCTS, { ...DEFAULT_FILTERS, price: [0, 20] }).length).toBe(
      PRODUCTS.length,
    );
  });

  it("sorts by price", () => {
    const asc = applyFilters(PRODUCTS, { ...DEFAULT_FILTERS, sort: "price-asc" }).map(salePrice);
    expect(asc).toEqual([...asc].sort((x, y) => x - y));
  });

  it("finds related products from the same department", () => {
    const p = PRODUCTS[0];
    const related = relatedProducts(p);
    expect(related).not.toContainEqual(p);
    expect(
      related.every((r) => departmentOf(r.category)?.id === departmentOf(p.category)?.id),
    ).toBe(true);
  });
});

describe("pricing", () => {
  it("gives free standard delivery over the threshold", () => {
    expect(computeTotals({ subtotal: FREE_SHIPPING_THRESHOLD, listTotal: 80 }).shipping).toBe(0);
    expect(computeTotals({ subtotal: 20, listTotal: 20 }).shipping).toBe(4.99);
    expect(computeTotals({ subtotal: 200, listTotal: 200, delivery: "nextday" }).shipping).toBe(
      14.99,
    );
  });

  it("applies percentage and free-shipping promos", () => {
    const t = computeTotals({ subtotal: 50, listTotal: 60, promoCode: "ebuyer10" });
    expect(t).toMatchObject({ discount: 5, shipping: 4.99, total: 49.99, savings: 15 });
    expect(computeTotals({ subtotal: 20, listTotal: 20, promoCode: "FREESHIP" }).shipping).toBe(0);
  });

  it("rejects unknown codes and enforces minimum spend", () => {
    expect(computeTotals({ subtotal: 50, listTotal: 50, promoCode: "NOPE" }).promoError).toMatch(
      /valid/,
    );
    const t = computeTotals({ subtotal: 50, listTotal: 50, promoCode: "WELCOME20" });
    expect(t.promoError).toMatch(/Spend £100/);
    expect(t.discount).toBe(0);
    expect(findPromo("welcome20")?.percent).toBe(20);
  });

  it("formats GBP", () => {
    expect(formatPrice(1234.5)).toBe("£1,234.50");
  });
});

describe("checkout validation", () => {
  it("validates card numbers with Luhn", () => {
    expect(luhn("4242 4242 4242 4242")).toBe(true);
    expect(luhn("4242 4242 4242 4241")).toBe(false);
    expect(luhn("1234")).toBe(false);
  });

  it("detects brands and formats numbers", () => {
    expect(cardBrand("4242")).toBe("visa");
    expect(cardBrand("5555")).toBe("mastercard");
    expect(cardBrand("3782")).toBe("amex");
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCardNumber("378282246310005")).toBe("3782 822463 10005");
    expect(formatExpiry("1229")).toBe("12/29");
  });

  it("checks expiry dates are in the future", () => {
    const now = new Date(2026, 9, 7);
    expect(expiryInFuture("12/26", now)).toBe(true);
    // Cards are valid through the end of their expiry month.
    expect(expiryInFuture("10/26", now)).toBe(true);
    expect(expiryInFuture("09/26", now)).toBe(false);
    expect(expiryInFuture("13/30", now)).toBe(false);
  });

  it("validates shipping and payment forms", () => {
    expect(
      shippingSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        line1: "1 Street",
        city: "London",
        postcode: "SW1A 1AA",
        country: "United Kingdom",
      }).success,
    ).toBe(true);
    const bad = shippingSchema.safeParse({
      fullName: "A",
      email: "nope",
      line1: "",
      city: "",
      postcode: "123",
      country: "United Kingdom",
    });
    expect(bad.success).toBe(false);
    expect(
      paymentSchema.safeParse({
        cardName: "Ada",
        cardNumber: "4242 4242 4242 4242",
        expiry: "12/39",
        cvc: "123",
      }).success,
    ).toBe(true);
  });
});

describe("insights", () => {
  const product = PRODUCTS[3];
  const end = new Date(2026, 9, 7);

  it("generates deterministic price history ending at the sale price", () => {
    const h = priceHistory(product, end);
    expect(h).toHaveLength(91);
    expect(h).toEqual(priceHistory(product, end));
    expect(h.at(-1)?.price).toBeCloseTo(salePrice(product), 2);
    const stats = priceStats(h);
    expect(stats.low).toBeLessThanOrEqual(stats.avg);
    expect(stats.high).toBeGreaterThanOrEqual(stats.avg);
  });

  it("buckets ratings", () => {
    const d = ratingDistribution([
      { rating: 5, comment: "", date: "", reviewerName: "" },
      { rating: 4.6, comment: "", date: "", reviewerName: "" },
      { rating: 2, comment: "", date: "", reviewerName: "" },
    ]);
    expect(d.find((x) => x.stars === 5)?.count).toBe(2);
    expect(d.find((x) => x.stars === 2)?.count).toBe(1);
  });
});

describe("spending", () => {
  const now = new Date(2026, 9, 7);
  const orders = sampleOrders(now.getTime());

  it("splits monthly spend by department", () => {
    const months = monthlySpend(orders, now);
    expect(months).toHaveLength(6);
    for (const m of months) {
      const sum = Object.values(m.byDepartment).reduce((x, y) => x + y, 0);
      expect(sum).toBeCloseTo(m.total, 1);
    }
  });

  it("ranks departments by spend", () => {
    const d = departmentSpend(orders);
    expect(d.length).toBeGreaterThan(1);
    expect(d.map((x) => x.total)).toEqual([...d.map((x) => x.total)].sort((x, y) => y - x));
  });
});
