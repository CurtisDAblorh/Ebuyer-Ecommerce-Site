import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { Totals, DeliveryOption } from "@/lib/pricing";

export type Address = {
  fullName: string;
  email: string;
  line1: string;
  city: string;
  postcode: string;
  country: string;
};

export type Order = {
  id: string;
  createdAt: number;
  lines: { id: number; qty: number; unitPrice: number; category: string }[];
  totals: Totals;
  delivery: DeliveryOption["id"];
  address: Address;
  sample?: boolean;
};

/** Everything about the shopper that persists: wishlist, orders and recently viewed. */
export type ShopperState = {
  wishlist: number[];
  recentlyViewed: number[];
  orders: Order[];
  hydrated: boolean;
};

export const initialShopperState: ShopperState = {
  wishlist: [],
  recentlyViewed: [],
  orders: [],
  hydrated: false,
};

const shopperSlice = createSlice({
  name: "shopper",
  initialState: initialShopperState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<number>) {
      const id = action.payload;
      state.wishlist = state.wishlist.includes(id)
        ? state.wishlist.filter((x) => x !== id)
        : [id, ...state.wishlist];
    },
    viewProduct(state, action: PayloadAction<number>) {
      state.recentlyViewed = [
        action.payload,
        ...state.recentlyViewed.filter((x) => x !== action.payload),
      ].slice(0, 12);
    },
    placeOrder: {
      reducer(state, action: PayloadAction<Order>) {
        state.orders.unshift(action.payload);
      },
      prepare(order: Omit<Order, "id" | "createdAt">) {
        return {
          payload: { ...order, id: `EB-${nanoid(6).toUpperCase()}`, createdAt: Date.now() },
        };
      },
    },
    hydrateShopper(state, action: PayloadAction<Partial<Omit<ShopperState, "hydrated">>>) {
      Object.assign(state, action.payload, { hydrated: true });
    },
  },
});

export const { toggleWishlist, viewProduct, placeOrder, hydrateShopper } = shopperSlice.actions;
export default shopperSlice.reducer;
