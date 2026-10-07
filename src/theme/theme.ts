"use client";

import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    highlight: Palette["primary"];
  }
  interface PaletteOptions {
    highlight?: PaletteOptions["primary"];
  }
}

/**
 * Ebuyer theme. CSS variables with a `.dark` class selector so MUI and Tailwind's
 * `dark:` variant switch together, and no flash on load.
 */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#141414", contrastText: "#ffffff" },
        secondary: { main: "#ff5a36", contrastText: "#ffffff" },
        highlight: { main: "#d7ff3e", contrastText: "#141414" },
        success: { main: "#15803d" },
        background: { default: "#f7f6f3", paper: "#ffffff" },
        text: { primary: "#141414", secondary: "#5c5c5c" },
        divider: "rgba(20,20,20,0.08)",
      },
    },
    dark: {
      palette: {
        primary: { main: "#f5f5f4", contrastText: "#141414" },
        secondary: { main: "#ff6b4a", contrastText: "#141414" },
        highlight: { main: "#d7ff3e", contrastText: "#141414" },
        success: { main: "#4ade80" },
        background: { default: "#0d0d0f", paper: "#17171a" },
        text: { primary: "#f5f5f4", secondary: "#a3a3a3" },
        divider: "rgba(255,255,255,0.08)",
      },
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    h1: { fontWeight: 800, letterSpacing: "-0.03em" },
    h2: { fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 999, paddingInline: 20 } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({ border: `1px solid ${theme.vars?.palette.divider}` }),
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    // Non-interactive so tooltips never block neighbouring controls.
    MuiTooltip: { defaultProps: { arrow: true, disableInteractive: true } },
    MuiTextField: { defaultProps: { variant: "outlined", size: "small", fullWidth: true } },
  },
});
