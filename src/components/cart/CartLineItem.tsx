"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import DeleteOutline from "@mui/icons-material/DeleteOutlineOutlined";
import { formatPrice } from "@/lib/pricing";
import { useAppDispatch, type CartLine } from "@/store/hooks";
import { setQty } from "@/store/cartSlice";
import { QuantityStepper } from "@/components/product/QuantityStepper";

export function CartLineItem({
  line,
  onNavigate,
  onRemove,
}: {
  line: CartLine;
  onNavigate?: () => void;
  onRemove: () => void;
}) {
  const dispatch = useAppDispatch();
  const { product, qty, lineTotal } = line;

  return (
    <Box
      component="li"
      data-testid="cart-line"
      sx={{ display: "flex", gap: 2, py: 2, borderBottom: 1, borderColor: "divider" }}
    >
      <Link href={`/product/${product.id}/`} onClick={onNavigate} className="shrink-0">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="size-20 rounded-xl bg-black/5 object-contain p-1 dark:bg-white/5"
        />
      </Link>
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Typography
            component={Link}
            href={`/product/${product.id}/`}
            onClick={onNavigate}
            sx={{ fontWeight: 600, lineHeight: 1.3 }}
            className="line-clamp-2 hover:underline"
          >
            {product.title}
          </Typography>
          <Typography sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
            {formatPrice(lineTotal)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <QuantityStepper
            size="small"
            value={qty}
            max={Math.min(10, product.stock)}
            onChange={(v) => dispatch(setQty({ id: product.id, qty: v }))}
            label={`Quantity of ${product.title}`}
          />
          <IconButton aria-label={`Remove ${product.title}`} onClick={onRemove} size="small">
            <DeleteOutline fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
