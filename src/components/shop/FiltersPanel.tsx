"use client";

import { useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import Rating from "@mui/material/Rating";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { DEPARTMENTS, PRODUCTS, categoryLabel, filterWithoutPrice, salePrice } from "@/lib/catalog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetFilters,
  setInStockOnly,
  setMinRating,
  setPriceRange,
  toggleCategory,
  toggleDepartment,
} from "@/store/filtersSlice";
import { PriceHistogram } from "@/components/charts/PriceHistogram";

function Section({
  title,
  children,
  defaultExpanded = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        bgcolor: "transparent",
        "&::before": { display: "none" },
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0 }}>{children}</AccordionDetails>
    </Accordion>
  );
}

export function FiltersPanel() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  const prices = useMemo(() => filterWithoutPrice(PRODUCTS, filters).map(salePrice), [filters]);
  const counts = useMemo(() => {
    const c = new Map<string, number>();
    PRODUCTS.forEach((p) => c.set(p.category, (c.get(p.category) ?? 0) + 1));
    return c;
  }, []);
  const onPrice = useCallback(
    (range: [number, number] | null) => dispatch(setPriceRange(range)),
    [dispatch],
  );

  return (
    <Box component="aside" aria-label="Filters">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6" component="h2">
          Filters
        </Typography>
        <Button size="small" onClick={() => dispatch(resetFilters())}>
          Clear all
        </Button>
      </Box>

      <Section title="Price">
        <PriceHistogram prices={prices} value={filters.price} onChange={onPrice} />
      </Section>

      <Section title="Department">
        <FormGroup>
          {DEPARTMENTS.map((d) => (
            <Box key={d.id}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={filters.departments.includes(d.id)}
                    onChange={() => dispatch(toggleDepartment(d.id))}
                  />
                }
                label={d.label}
              />
              {filters.departments.includes(d.id) && d.categories.length > 1 && (
                <FormGroup sx={{ pl: 3.5 }}>
                  {d.categories.map((c) => (
                    <FormControlLabel
                      key={c}
                      control={
                        <Checkbox
                          size="small"
                          checked={filters.categories.includes(c)}
                          onChange={() => dispatch(toggleCategory(c))}
                        />
                      }
                      label={
                        <span className="text-sm">
                          {categoryLabel(c)}{" "}
                          <span className="text-muted">({counts.get(c) ?? 0})</span>
                        </span>
                      }
                    />
                  ))}
                </FormGroup>
              )}
            </Box>
          ))}
        </FormGroup>
      </Section>

      <Section title="Rating">
        <ToggleButtonGroup
          exclusive
          orientation="vertical"
          fullWidth
          size="small"
          value={filters.minRating}
          onChange={(_e, v) => dispatch(setMinRating(v ?? 0))}
          aria-label="Minimum rating"
        >
          {[4.5, 4, 3].map((r) => (
            <ToggleButton
              key={r}
              value={r}
              sx={{
                justifyContent: "flex-start",
                gap: 1,
                border: "none",
                borderRadius: "10px !important",
              }}
            >
              <Rating value={r} precision={0.5} readOnly size="small" /> {r}+
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Section>

      <Section title="Availability">
        <FormControlLabel
          control={
            <Switch
              checked={filters.inStockOnly}
              onChange={(e) => dispatch(setInStockOnly(e.target.checked))}
            />
          }
          label="In stock only"
        />
      </Section>
    </Box>
  );
}
