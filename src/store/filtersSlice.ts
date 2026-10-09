import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_FILTERS, type Filters, type SortKey } from "@/lib/catalog";

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const filtersSlice = createSlice({
  name: "filters",
  initialState: DEFAULT_FILTERS,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    toggleDepartment(state, action: PayloadAction<string>) {
      state.departments = toggle(state.departments, action.payload);
    },
    toggleCategory(state, action: PayloadAction<string>) {
      state.categories = toggle(state.categories, action.payload);
    },
    setPriceRange(state, action: PayloadAction<[number, number] | null>) {
      state.price = action.payload;
    },
    setMinRating(state, action: PayloadAction<number>) {
      state.minRating = action.payload;
    },
    setInStockOnly(state, action: PayloadAction<boolean>) {
      state.inStockOnly = action.payload;
    },
    setSort(state, action: PayloadAction<SortKey>) {
      state.sort = action.payload;
    },
    /** Replaces filters wholesale, e.g. when arriving from a department link. */
    setFilters(_state, action: PayloadAction<Partial<Filters>>) {
      return { ...DEFAULT_FILTERS, ...action.payload };
    },
    resetFilters() {
      return DEFAULT_FILTERS;
    },
  },
});

export const {
  setQuery,
  toggleDepartment,
  toggleCategory,
  setPriceRange,
  setMinRating,
  setInStockOnly,
  setSort,
  setFilters,
  resetFilters,
} = filtersSlice.actions;
export default filtersSlice.reducer;
