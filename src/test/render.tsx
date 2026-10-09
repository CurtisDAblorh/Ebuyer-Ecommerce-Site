import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { theme } from "@/theme/theme";
import { makeStore, type RootState } from "@/store";

/** Renders UI with the MUI theme and a fresh Redux store, returning the store for assertions. */
export function renderWithProviders(ui: ReactElement, preloadedState?: Partial<RootState>) {
  const store = makeStore(preloadedState);
  return {
    store,
    ...render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>{ui}</Provider>
      </ThemeProvider>,
    ),
  };
}
