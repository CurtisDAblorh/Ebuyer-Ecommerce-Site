"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@/theme/theme";
import { loadPersisted, makeStore, savePersisted, type AppStore, type RootState } from "@/store";
import { hydrateCart } from "@/store/cartSlice";
import { hydrateShopper } from "@/store/shopperSlice";
import { sampleOrders } from "@/lib/sampleOrders";

export function StoreProvider({
  children,
  preloadedState,
  skipHydration = false,
}: {
  children: ReactNode;
  preloadedState?: Partial<RootState>;
  skipHydration?: boolean;
}) {
  const [store] = useState<AppStore>(() => makeStore(preloadedState));

  // Load persisted state after mount so the static HTML matches the first client render.
  useEffect(() => {
    if (skipHydration) return;
    const saved = loadPersisted();
    if (saved) {
      store.dispatch(hydrateCart(saved.cart));
      store.dispatch(hydrateShopper(saved.shopper));
    } else {
      store.dispatch(hydrateShopper({ orders: sampleOrders(Date.now()) }));
    }
    const flush = () => store.getState().shopper.hydrated && savePersisted(store.getState());
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [store, skipHydration]);

  return <Provider store={store}>{children}</Provider>;
}

export function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    // enableCssLayer puts MUI styles in `@layer mui`, so Tailwind utilities can override them.
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme} defaultMode="system">
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
