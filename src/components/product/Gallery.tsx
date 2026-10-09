"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, type Ref } from "react";
import Box from "@mui/material/Box";

/** Product gallery with thumbnail strip and hover-to-zoom that follows the cursor. */
export function Gallery({
  images,
  title,
  imageRef,
}: {
  images: string[];
  title: string;
  imageRef?: Ref<HTMLImageElement>;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "72px 1fr" }, gap: 2 }}>
      <Box
        role="tablist"
        aria-label="Product images"
        sx={{
          display: "flex",
          flexDirection: { xs: "row", sm: "column" },
          gap: 1,
          order: { xs: 2, sm: 1 },
          overflowX: "auto",
        }}
        className="hide-scrollbar"
      >
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Image ${i + 1} of ${images.length}`}
            onClick={() => setActive(i)}
            className={`size-[72px] shrink-0 overflow-hidden rounded-xl border-2 bg-black/5 transition dark:bg-white/5 ${i === active ? "border-current" : "border-transparent opacity-60 hover:opacity-100"}`}
          >
            <img src={src} alt="" className="h-full w-full object-contain p-1" />
          </button>
        ))}
      </Box>
      <Box
        sx={{
          order: { xs: 1, sm: 2 },
          position: "relative",
          aspectRatio: "1",
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "action.hover",
          cursor: zoom ? "zoom-out" : "zoom-in",
        }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
          });
        }}
        onPointerLeave={() => setZoom(null)}
      >
        <img
          ref={imageRef}
          src={images[active]}
          alt={title}
          className="absolute inset-0 h-full w-full object-contain p-8 transition-transform duration-200 ease-out"
          style={
            zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined
          }
        />
      </Box>
    </Box>
  );
}
