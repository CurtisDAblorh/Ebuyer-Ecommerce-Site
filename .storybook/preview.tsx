import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { useEffect, type ReactNode } from "react";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider, useColorScheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { theme } from "../src/theme/theme";
import { StoreProvider } from "../src/components/Providers";
import { sampleOrders } from "../src/lib/sampleOrders";
import { initialShopperState } from "../src/store/shopperSlice";
import "../src/app/globals.css";

const sans = Plus_Jakarta_Sans({ variable: "--font-sans", subsets: ["latin"] });
const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

/** Syncs the toolbar theme with MUI's colour scheme (which toggles the `.dark` class on <html>). */
function SchemeSync({ mode, children }: { mode: "light" | "dark"; children: ReactNode }) {
  const { setMode } = useColorScheme();
  useEffect(() => {
    setMode(mode);
    document.documentElement.classList.add(sans.variable, serif.variable);
  }, [mode, setMode]);
  return (
    <Box
      sx={{ bgcolor: "background.default", color: "text.primary", minHeight: "100vh", p: 3 }}
      className="antialiased"
    >
      {children}
    </Box>
  );
}

const withTheme: Decorator = (Story, ctx) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SchemeSync mode={ctx.globals.theme ?? "light"}>
      <Story />
    </SchemeSync>
  </ThemeProvider>
);

const withStore: Decorator = (Story) => (
  <StoreProvider
    skipHydration
    preloadedState={{
      shopper: {
        ...initialShopperState,
        orders: sampleOrders(Date.UTC(2026, 9, 1)),
        hydrated: true,
      },
    }}
  >
    <Story />
  </StoreProvider>
);

const preview: Preview = {
  decorators: [withStore, withTheme],
  globalTypes: {
    theme: {
      description: "Colour scheme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: "todo" },
  },
};

export default preview;
