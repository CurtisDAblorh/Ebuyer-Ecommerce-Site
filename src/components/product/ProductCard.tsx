"use client";

/* eslint-disable @next/next/no-img-element -- static export with remote CDN images */
import { useRef } from "react";
import Link from "next/link";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { categoryLabel, type Product } from "@/lib/catalog";
import { useAppDispatch } from "@/store/hooks";
import { openQuickView } from "@/store/uiSlice";
import { Price } from "./Price";
import { WishlistButton } from "./WishlistButton";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const dispatch = useAppDispatch();
  const imgRef = useRef<HTMLImageElement>(null);
  const hoverImage = product.images.find((src) => src !== product.thumbnail);
  const lowStock = product.stock > 0 && product.stock < 10;

  return (
    <Card
      data-testid="product-card"
      className="group h-full"
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        transition: "transform .3s ease, box-shadow .3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 20px 40px -20px rgba(0,0,0,.35)",
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={`/product/${product.id}/`}
        sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <Box className="relative aspect-square overflow-hidden" sx={{ bgcolor: "action.hover" }}>
          <img
            ref={imgRef}
            src={product.thumbnail}
            alt={product.title}
            loading={priority ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full object-contain p-4 transition-all duration-500 group-hover:scale-105"
          />
          {hoverImage && (
            <img
              src={hoverImage}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              display: "flex",
              gap: 0.75,
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            {product.discountPercentage >= 10 && (
              <Chip
                size="small"
                color="secondary"
                label={`-${Math.round(product.discountPercentage)}%`}
              />
            )}
            {lowStock && (
              <Chip
                size="small"
                label={`Only ${product.stock} left`}
                sx={{ bgcolor: "highlight.main", color: "highlight.contrastText" }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: ".08em" }}
          >
            {product.brand ?? categoryLabel(product.category)}
          </Typography>
          <Typography sx={{ fontWeight: 600, lineHeight: 1.3 }} className="line-clamp-2">
            {product.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Rating value={product.rating} precision={0.1} size="small" readOnly />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              ({product.reviews.length})
            </Typography>
          </Box>
          <Box sx={{ mt: "auto", pt: 1 }}>
            <Price product={product} />
          </Box>
        </Box>
      </CardActionArea>

      <Box className="absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 sm:translate-x-2 sm:opacity-0 sm:group-focus-within:translate-x-0 sm:group-focus-within:opacity-100 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
        <WishlistButton id={product.id} title={product.title} size="small" />
        <Tooltip title="Quick view" placement="left">
          <IconButton
            size="small"
            aria-label={`Quick view ${product.title}`}
            onClick={() => dispatch(openQuickView(product.id))}
            sx={{
              bgcolor: "background.paper",
              boxShadow: 1,
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <VisibilityOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ px: 2, pb: 2 }}>
        <AddToCartButton
          product={product}
          imageRef={imgRef}
          fullWidth
          size="small"
          variant="outlined"
        />
      </Box>
    </Card>
  );
}
