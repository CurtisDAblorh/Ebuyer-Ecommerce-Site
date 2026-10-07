import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Toast = {
  id: number;
  message: string;
  severity?: "success" | "info";
};

export type UiState = {
  cartOpen: boolean;
  quickViewId: number | null;
  toast: Toast | null;
  /** Bumped on add-to-cart so the header badge can animate. */
  cartPulse: number;
};

const initialState: UiState = { cartOpen: false, quickViewId: null, toast: null, cartPulse: 0 };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.cartOpen = action.payload;
    },
    openQuickView(state, action: PayloadAction<number | null>) {
      state.quickViewId = action.payload;
    },
    showToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toast = action.payload;
      },
      prepare(toast: Omit<Toast, "id">) {
        return { payload: { ...toast, id: Date.now() } };
      },
    },
    dismissToast(state) {
      state.toast = null;
    },
    pulseCart(state) {
      state.cartPulse += 1;
    },
  },
});

export const { setCartOpen, openQuickView, showToast, dismissToast, pulseCart } = uiSlice.actions;
export default uiSlice.reducer;
