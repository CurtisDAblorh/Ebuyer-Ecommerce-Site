import { combineReducers, configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import cart from "./cartSlice";
import shopper from "./shopperSlice";
import filters from "./filtersSlice";
import ui from "./uiSlice";
import { catalogApi } from "./catalogApi";

const rootReducer = combineReducers({
  cart,
  shopper,
  filters,
  ui,
  [catalogApi.reducerPath]: catalogApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const KEY = "ebuyer.state.v1";

export type PersistedState = Pick<RootState, "cart"> & {
  shopper: Omit<RootState["shopper"], "hydrated">;
};

export function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

export function savePersisted(state: RootState) {
  const { wishlist, recentlyViewed, orders } = state.shopper;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ cart: state.cart, shopper: { wishlist, recentlyViewed, orders } }),
    );
  } catch {
    // Storage can be unavailable (private mode, quota). The session still works in memory.
  }
}

export function makeStore(preloadedState?: Partial<RootState>) {
  const listener = createListenerMiddleware();
  let timer: ReturnType<typeof setTimeout> | undefined;
  listener.startListening({
    predicate: (_a, current, previous) =>
      (current as RootState).cart !== (previous as RootState).cart ||
      (current as RootState).shopper !== (previous as RootState).shopper,
    effect: (_a, api) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const state = api.getState() as RootState;
        if (state.shopper.hydrated) savePersisted(state);
      }, 200);
    },
  });

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) =>
      getDefault().prepend(listener.middleware).concat(catalogApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
