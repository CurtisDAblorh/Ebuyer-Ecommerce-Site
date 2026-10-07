"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Search from "@mui/icons-material/Search";
import { PRODUCTS, categoryLabel, salePrice, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/pricing";
import { useAppDispatch } from "@/store/hooks";
import { setFilters } from "@/store/filtersSlice";

/** Header search with instant product suggestions. Enter searches the shop. */
export function SearchBox({
  autoFocus = false,
  onDone,
}: {
  autoFocus?: boolean;
  onDone?: () => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [input, setInput] = useState("");

  const searchShop = (q: string) => {
    dispatch(setFilters({ query: q }));
    router.push(`/shop/?q=${encodeURIComponent(q)}`);
    onDone?.();
  };

  return (
    <Autocomplete<Product, false, false, true>
      freeSolo
      // Uncontrolled selection: picking a suggestion navigates, then the box resets.
      value={null}
      blurOnSelect
      options={PRODUCTS}
      inputValue={input}
      onInputChange={(_e, v) => setInput(v)}
      getOptionLabel={(o) => (typeof o === "string" ? o : o.title)}
      filterOptions={(options, { inputValue }) => {
        const q = inputValue.trim().toLowerCase();
        if (!q) return [];
        return options
          .filter((p) =>
            [p.title, p.brand ?? "", p.category].some((s) => s.toLowerCase().includes(q)),
          )
          .slice(0, 6);
      }}
      onChange={(_e, value) => {
        if (!value) return;
        if (typeof value === "string") searchShop(value);
        else {
          router.push(`/product/${value.id}/`);
          setInput("");
          onDone?.();
        }
      }}
      renderOption={({ key, ...props }, p) => (
        <Box
          component="li"
          key={key}
          {...props}
          sx={{ display: "flex", gap: 1.5, alignItems: "center" }}
        >
          <img src={p.thumbnail} alt="" className="size-10 rounded-md bg-black/5 object-contain" />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontWeight: 600, fontSize: 14 }}>
              {p.title}
            </Typography>
            <Typography noWrap variant="caption" sx={{ color: "text.secondary" }}>
              {categoryLabel(p.category)}
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
            {formatPrice(salePrice(p))}
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus={autoFocus}
          placeholder="Search products, brands…"
          aria-label="Search products"
          slotProps={{
            ...params.slotProps,
            htmlInput: { ...params.slotProps.htmlInput, type: "search" },
            input: {
              ...params.slotProps.input,
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              sx: { borderRadius: 999, bgcolor: "action.hover", "& fieldset": { border: "none" } },
            },
          }}
        />
      )}
      sx={{ width: "100%" }}
    />
  );
}
