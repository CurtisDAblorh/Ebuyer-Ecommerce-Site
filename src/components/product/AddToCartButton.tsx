"use client";

import { useState, type RefObject } from "react";
import Button, { type ButtonProps } from "@mui/material/Button";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import Check from "@mui/icons-material/Check";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/cartSlice";
import { pulseCart, showToast } from "@/store/uiSlice";
import { flyToCart } from "@/lib/flyToCart";
import type { Product } from "@/lib/catalog";

type Props = {
  product: Product;
  qty?: number;
  /** Image to animate into the cart. */
  imageRef?: RefObject<HTMLElement | null>;
  onAdded?: () => void;
} & Omit<ButtonProps, "onClick">;

export function AddToCartButton({
  product,
  qty = 1,
  imageRef,
  onAdded,
  children,
  ...props
}: Props) {
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  return (
    <Button
      variant="contained"
      startIcon={added ? <Check /> : <ShoppingBagOutlined />}
      disabled={soldOut}
      aria-label={`Add ${product.title} to bag`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        flyToCart(imageRef?.current ?? null);
        dispatch(addItem({ id: product.id, qty, stock: product.stock }));
        dispatch(pulseCart());
        dispatch(showToast({ message: `Added ${product.title} to your bag`, severity: "success" }));
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
        onAdded?.();
      }}
      {...props}
    >
      {soldOut ? "Sold out" : added ? "Added" : (children ?? "Add to bag")}
    </Button>
  );
}
