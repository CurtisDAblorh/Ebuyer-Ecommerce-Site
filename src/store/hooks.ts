import { useDispatch, useSelector, useStore } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import type { AppDispatch, AppStore, RootState } from "./index";
import { PRODUCTS_BY_ID, salePrice, type Product } from "@/lib/catalog";
import { computeTotals } from "@/lib/pricing";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

export type CartLine = { product: Product; qty: number; unitPrice: number; lineTotal: number };

export const selectCartLines = createSelector(
  [(s: RootState) => s.cart.items],
  (items): CartLine[] =>
    items.flatMap(({ id, qty }) => {
      const product = PRODUCTS_BY_ID.get(id);
      if (!product) return [];
      const unitPrice = salePrice(product);
      return [{ product, qty, unitPrice, lineTotal: Math.round(unitPrice * qty * 100) / 100 }];
    }),
);

export const selectCartCount = (s: RootState) => s.cart.items.reduce((n, i) => n + i.qty, 0);

export const selectCartTotals = createSelector(
  [
    selectCartLines,
    (s: RootState) => s.cart.promoCode,
    (_s: RootState, delivery?: "standard" | "express" | "nextday") => delivery,
  ],
  (lines, promoCode, delivery) =>
    computeTotals({
      subtotal: lines.reduce((sum, l) => sum + l.lineTotal, 0),
      listTotal: lines.reduce((sum, l) => sum + l.product.price * l.qty, 0),
      promoCode,
      delivery,
    }),
);

export const selectInWishlist = (id: number) => (s: RootState) => s.shopper.wishlist.includes(id);
