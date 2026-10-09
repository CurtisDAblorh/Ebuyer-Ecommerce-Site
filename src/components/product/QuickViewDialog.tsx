"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import Link from "next/link";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Close from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { PRODUCTS_BY_ID } from "@/lib/catalog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openQuickView } from "@/store/uiSlice";
import { Price } from "./Price";
import { AddToCartButton } from "./AddToCartButton";
import { QuantityStepper } from "./QuantityStepper";
import { WishlistButton } from "./WishlistButton";

export function QuickViewDialog() {
  const dispatch = useAppDispatch();
  const id = useAppSelector((s) => s.ui.quickViewId);
  const product = id ? PRODUCTS_BY_ID.get(id) : undefined;
  const fullScreen = useMediaQuery(useTheme().breakpoints.down("sm"));
  const close = () => dispatch(openQuickView(null));

  return (
    <Dialog
      open={Boolean(product)}
      onClose={close}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="quick-view-title"
    >
      {product && <QuickViewBody key={product.id} productId={product.id} onClose={close} />}
    </Dialog>
  );
}

function QuickViewBody({ productId, onClose }: { productId: number; onClose: () => void }) {
  const product = PRODUCTS_BY_ID.get(productId)!;
  const [image, setImage] = useState(product.images[0] ?? product.thumbnail);
  const [qty, setQty] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <DialogContent sx={{ p: 0 }}>
      <IconButton
        aria-label="Close quick view"
        onClick={onClose}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
      >
        <Close />
      </IconButton>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
        <Box sx={{ bgcolor: "action.hover", p: 3 }}>
          <img
            ref={imgRef}
            src={image}
            alt={product.title}
            className="aspect-square w-full object-contain"
          />
          <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "center" }}>
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Show image ${i + 1}`}
                onClick={() => setImage(src)}
                className={`size-14 overflow-hidden rounded-lg border-2 bg-white transition ${image === src ? "border-current" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <img src={src} alt="" className="h-full w-full object-contain" />
              </button>
            ))}
          </Stack>
        </Box>
        <Stack spacing={2} sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            {product.brand}
          </Typography>
          <Typography id="quick-view-title" variant="h5" component="h2">
            {product.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Rating value={product.rating} precision={0.1} readOnly size="small" />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {product.rating.toFixed(1)} · {product.reviews.length} reviews
            </Typography>
          </Box>
          <Price product={product} size="lg" />
          <Typography sx={{ color: "text.secondary" }}>{product.description}</Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", pt: 1 }}>
            <QuantityStepper value={qty} onChange={setQty} max={Math.min(10, product.stock)} />
            <AddToCartButton
              product={product}
              qty={qty}
              imageRef={imgRef}
              size="large"
              sx={{ flex: 1 }}
              onAdded={onClose}
            />
            <WishlistButton id={product.id} title={product.title} />
          </Stack>
          <Button
            component={Link}
            href={`/product/${product.id}/`}
            onClick={onClose}
            variant="text"
            sx={{ alignSelf: "flex-start", px: 0 }}
          >
            View full details →
          </Button>
        </Stack>
      </Box>
    </DialogContent>
  );
}
