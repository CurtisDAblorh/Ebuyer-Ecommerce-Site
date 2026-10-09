"use client";

import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { DEPARTMENTS, categoryLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/pricing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setInStockOnly,
  setMinRating,
  setPriceRange,
  setQuery,
  toggleCategory,
  toggleDepartment,
} from "@/store/filtersSlice";

export function ActiveFilters() {
  const dispatch = useAppDispatch();
  const f = useAppSelector((s) => s.filters);
  const chips = [
    f.query && { key: "q", label: `“${f.query}”`, clear: () => dispatch(setQuery("")) },
    ...f.departments.map((d) => ({
      key: d,
      label: DEPARTMENTS.find((x) => x.id === d)?.label ?? d,
      clear: () => dispatch(toggleDepartment(d)),
    })),
    ...f.categories.map((c) => ({
      key: c,
      label: categoryLabel(c),
      clear: () => dispatch(toggleCategory(c)),
    })),
    f.price && {
      key: "price",
      label: `${formatPrice(f.price[0])}–${formatPrice(f.price[1])}`,
      clear: () => dispatch(setPriceRange(null)),
    },
    f.minRating > 0 && {
      key: "rating",
      label: `${f.minRating}★ & up`,
      clear: () => dispatch(setMinRating(0)),
    },
    f.inStockOnly && {
      key: "stock",
      label: "In stock",
      clear: () => dispatch(setInStockOnly(false)),
    },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  if (!chips.length) return null;
  return (
    <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1 }} aria-label="Active filters">
      {chips.map((c) => (
        <Chip key={c.key} label={c.label} onDelete={c.clear} />
      ))}
    </Stack>
  );
}
