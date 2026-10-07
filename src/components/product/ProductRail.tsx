"use client";

import { useRef } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

/** Horizontally scrolling, snap-aligned product carousel with arrow controls. */
export function ProductRail({
  title,
  products,
  action,
}: {
  title: string;
  products: Product[];
  action?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  if (!products.length) return null;

  return (
    <Box component="section" aria-label={title} sx={{ mt: 8 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          mb: 2.5,
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h2" sx={{ fontSize: { xs: 26, md: 34 } }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {action}
          <IconButton
            aria-label={`Scroll ${title} left`}
            onClick={() => scroll(-1)}
            sx={{ border: 1, borderColor: "divider" }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            aria-label={`Scroll ${title} right`}
            onClick={() => scroll(1)}
            sx={{ border: 1, borderColor: "divider" }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>
      <div
        ref={ref}
        className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4"
      >
        {products.map((p) => (
          <div key={p.id} className="w-[min(70vw,260px)] shrink-0 snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </Box>
  );
}
