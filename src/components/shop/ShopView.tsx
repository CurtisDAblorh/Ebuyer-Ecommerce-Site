"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Fade from "@mui/material/Fade";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import SearchOff from "@mui/icons-material/SearchOff";
import Link from "next/link";
import { DEPARTMENTS, type SortKey } from "@/lib/catalog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetFilters, setFilters, setSort } from "@/store/filtersSlice";
import { useGetProductsQuery } from "@/store/catalogApi";
import { ProductCard } from "@/components/product/ProductCard";
import { FiltersPanel } from "./FiltersPanel";
import { ActiveFilters } from "./ActiveFilters";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "discount", label: "Biggest discount" },
];

export function ShopView() {
  const dispatch = useAppDispatch();
  const params = useSearchParams();
  const filters = useAppSelector((s) => s.filters);
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const { data, isFetching } = useGetProductsQuery({ filters, page });

  // Seed filters from the URL when arriving from a link (department tiles, search).
  const q = params.get("q");
  const department = params.get("department");
  useEffect(() => {
    if (q || department)
      dispatch(setFilters({ query: q ?? "", departments: department ? [department] : [] }));
  }, [q, department, dispatch]);

  // Any filter change returns to the first page.
  const [prevFilters, setPrevFilters] = useState(filters);
  if (prevFilters !== filters) {
    setPrevFilters(filters);
    setPage(1);
  }

  const heading =
    filters.departments.length === 1
      ? DEPARTMENTS.find((d) => d.id === filters.departments[0])?.label
      : filters.query
        ? `Results for “${filters.query}”`
        : "Shop all";

  return (
    <div className="container-page py-8">
      <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 2 }}>
        <Link href="/">Home</Link>
        <Typography color="text.primary">Shop</Typography>
      </Breadcrumbs>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <div>
          <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 32, md: 44 } }}>
            {heading}
          </Typography>
          <Typography
            sx={{ color: "text.secondary", mt: 0.5 }}
            aria-live="polite"
            data-testid="result-count"
          >
            {data ? `${data.total} products` : "Loading…"}
          </Typography>
        </div>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            startIcon={<TuneOutlined />}
            variant="outlined"
            onClick={() => setDrawer(true)}
            sx={{ display: { lg: "none" } }}
          >
            Filters
          </Button>
          <Select
            size="small"
            value={filters.sort}
            onChange={(e) => dispatch(setSort(e.target.value as SortKey))}
            inputProps={{ "aria-label": "Sort products" }}
            sx={{ borderRadius: 999, minWidth: 190 }}
          >
            {SORTS.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "260px 1fr" }, gap: 4 }}>
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            position: "sticky",
            top: 96,
            alignSelf: "start",
            maxHeight: "calc(100vh - 120px)",
            overflowY: "auto",
            pr: 1,
          }}
          className="hide-scrollbar"
        >
          <FiltersPanel />
        </Box>

        <Box>
          <Box sx={{ mb: 2 }}>
            <ActiveFilters />
          </Box>
          {data && data.total === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <SearchOff sx={{ fontSize: 48, color: "text.secondary" }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                No products match those filters
              </Typography>
              <Button sx={{ mt: 2 }} variant="contained" onClick={() => dispatch(resetFilters())}>
                Clear filters
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: { xs: 1.5, sm: 2.5 },
                opacity: isFetching ? 0.6 : 1,
                transition: "opacity .2s",
              }}
              aria-busy={isFetching}
            >
              {!data
                ? Array.from({ length: 6 }, (_, i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      sx={{ aspectRatio: "3/4", height: "auto", borderRadius: 3.5 }}
                    />
                  ))
                : data.items.map((p, i) => (
                    <Fade in key={p.id} style={{ transitionDelay: `${i * 30}ms` }}>
                      <div>
                        <ProductCard product={p} priority={i < 3} />
                      </div>
                    </Fade>
                  ))}
            </Box>
          )}
          {data && data.pageCount > 1 && (
            <Pagination
              count={data.pageCount}
              page={data.page}
              onChange={(_e, p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              shape="rounded"
              sx={{ mt: 5, display: "flex", justifyContent: "center" }}
            />
          )}
        </Box>
      </Box>

      <Drawer
        anchor="left"
        open={drawer}
        onClose={() => setDrawer(false)}
        slotProps={{ paper: { sx: { width: 320, p: 2.5 } } }}
      >
        <FiltersPanel />
        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setDrawer(false)}>
          Show {data?.total ?? ""} results
        </Button>
      </Drawer>
    </div>
  );
}
