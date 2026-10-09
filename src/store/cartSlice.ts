import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const MAX_QTY = 10;

export type CartItem = { id: number; qty: number };

export type CartState = { items: CartItem[]; promoCode: string | null };

export const initialCartState: CartState = { items: [], promoCode: null };

const cartSlice = createSlice({
  name: "cart",
  initialState: initialCartState,
  reducers: {
    addItem(state, action: PayloadAction<{ id: number; qty?: number; stock?: number }>) {
      const { id, qty = 1, stock = MAX_QTY } = action.payload;
      const limit = Math.min(MAX_QTY, stock);
      const existing = state.items.find((i) => i.id === id);
      if (existing) existing.qty = Math.min(limit, existing.qty + qty);
      else state.items.unshift({ id, qty: Math.min(limit, qty) });
    },
    setQty(state, action: PayloadAction<{ id: number; qty: number }>) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (!item) return;
      if (action.payload.qty <= 0)
        state.items = state.items.filter((i) => i.id !== action.payload.id);
      else item.qty = Math.min(MAX_QTY, action.payload.qty);
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    /** Re-inserts an item at its previous position (used by the undo snackbar). */
    restoreItem(state, action: PayloadAction<{ item: CartItem; index: number }>) {
      if (state.items.some((i) => i.id === action.payload.item.id)) return;
      state.items.splice(action.payload.index, 0, action.payload.item);
    },
    applyPromo(state, action: PayloadAction<string | null>) {
      state.promoCode = action.payload ? action.payload.trim().toUpperCase() : null;
    },
    clearCart() {
      return initialCartState;
    },
    hydrateCart(_state, action: PayloadAction<CartState>) {
      return action.payload;
    },
  },
});

export const { addItem, setQty, removeItem, restoreItem, applyPromo, clearCart, hydrateCart } =
  cartSlice.actions;
export default cartSlice.reducer;
