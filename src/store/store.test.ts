import cart, {
  addItem,
  applyPromo,
  clearCart,
  initialCartState,
  removeItem,
  restoreItem,
  setQty,
  MAX_QTY,
} from "./cartSlice";
import shopper, {
  initialShopperState,
  placeOrder,
  toggleWishlist,
  viewProduct,
} from "./shopperSlice";
import filters, { resetFilters, setFilters, toggleDepartment } from "./filtersSlice";
import { makeStore } from "./index";
import { selectCartCount, selectCartLines, selectCartTotals } from "./hooks";
import { DEFAULT_FILTERS, PRODUCTS, salePrice } from "@/lib/catalog";
import { computeTotals } from "@/lib/pricing";

const [a, b] = PRODUCTS;

describe("cartSlice", () => {
  it("adds new items to the top and merges duplicates", () => {
    let s = cart(initialCartState, addItem({ id: a.id }));
    s = cart(s, addItem({ id: b.id, qty: 2 }));
    s = cart(s, addItem({ id: a.id, qty: 3 }));
    expect(s.items).toEqual([
      { id: b.id, qty: 2 },
      { id: a.id, qty: 4 },
    ]);
  });

  it("caps quantity by stock and the per-item maximum", () => {
    expect(cart(initialCartState, addItem({ id: a.id, qty: 50 })).items[0].qty).toBe(MAX_QTY);
    expect(cart(initialCartState, addItem({ id: a.id, qty: 5, stock: 2 })).items[0].qty).toBe(2);
  });

  it("removes an item when its quantity reaches zero", () => {
    const s = cart(cart(initialCartState, addItem({ id: a.id })), setQty({ id: a.id, qty: 0 }));
    expect(s.items).toHaveLength(0);
  });

  it("restores a removed item at its original position", () => {
    let s = cart(initialCartState, addItem({ id: a.id }));
    s = cart(s, addItem({ id: b.id }));
    const removed = s.items[1];
    s = cart(s, removeItem(removed.id));
    s = cart(s, restoreItem({ item: removed, index: 1 }));
    expect(s.items.map((i) => i.id)).toEqual([b.id, a.id]);
  });

  it("normalises promo codes and clears", () => {
    const s = cart(initialCartState, applyPromo(" ebuyer10 "));
    expect(s.promoCode).toBe("EBUYER10");
    expect(cart(s, clearCart())).toEqual(initialCartState);
  });
});

describe("shopperSlice", () => {
  it("toggles wishlist items", () => {
    const s = shopper(initialShopperState, toggleWishlist(5));
    expect(s.wishlist).toEqual([5]);
    expect(shopper(s, toggleWishlist(5)).wishlist).toEqual([]);
  });

  it("keeps recently viewed unique, newest first, capped at 12", () => {
    let s = initialShopperState;
    for (let i = 1; i <= 14; i++) s = shopper(s, viewProduct(i));
    s = shopper(s, viewProduct(5));
    expect(s.recentlyViewed[0]).toBe(5);
    expect(s.recentlyViewed).toHaveLength(12);
    expect(new Set(s.recentlyViewed).size).toBe(12);
  });

  it("places orders with a generated id", () => {
    const s = shopper(
      initialShopperState,
      placeOrder({
        lines: [{ id: a.id, qty: 1, unitPrice: 10, category: a.category }],
        totals: computeTotals({ subtotal: 10, listTotal: 10 }),
        delivery: "standard",
        address: {
          fullName: "A",
          email: "a@b.co",
          line1: "1 St",
          city: "X",
          postcode: "E1 6AN",
          country: "United Kingdom",
        },
      }),
    );
    expect(s.orders[0].id).toMatch(/^EB-[A-Z0-9_-]{6}$/);
  });
});

describe("filtersSlice", () => {
  it("toggles departments and resets", () => {
    let s = filters(DEFAULT_FILTERS, toggleDepartment("tech"));
    expect(s.departments).toEqual(["tech"]);
    s = filters(s, toggleDepartment("tech"));
    expect(s.departments).toEqual([]);
    expect(filters(filters(s, setFilters({ query: "phone" })), resetFilters())).toEqual(
      DEFAULT_FILTERS,
    );
  });
});

describe("cart selectors", () => {
  it("derives lines, count and totals", () => {
    const store = makeStore();
    store.dispatch(addItem({ id: a.id, qty: 2 }));
    store.dispatch(addItem({ id: b.id }));
    const state = store.getState();
    const lines = selectCartLines(state);
    expect(lines).toHaveLength(2);
    expect(selectCartCount(state)).toBe(3);
    const expected = salePrice(a) * 2 + salePrice(b);
    expect(selectCartTotals(state).subtotal).toBeCloseTo(expected, 2);
  });
});
