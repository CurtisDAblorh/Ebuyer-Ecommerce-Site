"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import Close from "@mui/icons-material/Close";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import {
  selectCartCount,
  selectCartLines,
  selectCartTotals,
  useAppDispatch,
  useAppSelector,
  useAppStore,
} from "@/store/hooks";
import { removeItem, restoreItem, type CartItem } from "@/store/cartSlice";
import { setCartOpen } from "@/store/uiSlice";
import { CartLineItem } from "./CartLineItem";
import { FreeShippingBar } from "./FreeShippingBar";
import { OrderSummary } from "./OrderSummary";

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.cartOpen);
  const lines = useAppSelector(selectCartLines);
  const count = useAppSelector(selectCartCount);
  const totals = useAppSelector((s) => selectCartTotals(s));
  const store = useAppStore();
  const [removed, setRemoved] = useState<{ item: CartItem; index: number; title: string } | null>(
    null,
  );
  const close = () => dispatch(setCartOpen(false));

  // The undo offer expires after a few seconds.
  useEffect(() => {
    if (!removed) return;
    const t = setTimeout(() => setRemoved(null), 6000);
    return () => clearTimeout(t);
  }, [removed]);

  const remove = (id: number, title: string) => {
    const items = store.getState().cart.items;
    const index = items.findIndex((i) => i.id === id);
    dispatch(removeItem(id));
    setRemoved({ item: items[index], index, title });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={close}
      slotProps={{
        paper: { sx: { width: { xs: "100%", sm: 440 }, display: "flex", flexDirection: "column" } },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" component="h2">
          Your bag {count > 0 && <span className="text-muted">({count})</span>}
        </Typography>
        <IconButton aria-label="Close bag" onClick={close}>
          <Close />
        </IconButton>
      </Box>

      <Collapse in={Boolean(removed)} unmountOnExit>
        <Alert
          severity="info"
          sx={{ mx: 2.5, mt: 2, borderRadius: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                if (removed) dispatch(restoreItem(removed));
                setRemoved(null);
              }}
            >
              Undo
            </Button>
          }
        >
          Removed {removed?.title}
        </Alert>
      </Collapse>

      {lines.length === 0 ? (
        <Box sx={{ flex: 1, display: "grid", placeItems: "center", textAlign: "center", p: 4 }}>
          <Box>
            <Box
              sx={{
                mx: "auto",
                mb: 2,
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: "action.hover",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ShoppingBagOutlined fontSize="large" />
            </Box>
            <Typography variant="h6">Your bag is empty</Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              Find something you love.
            </Typography>
            <Button component={Link} href="/shop/" variant="contained" onClick={close}>
              Start shopping
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          <Box sx={{ px: 2.5, pt: 2 }}>
            <FreeShippingBar subtotal={totals.subtotal} />
          </Box>
          <Box
            component="ul"
            sx={{ flex: 1, overflowY: "auto", px: 2.5, m: 0, listStyle: "none" }}
            aria-label="Bag items"
          >
            {lines.map((line) => (
              <CartLineItem
                key={line.product.id}
                line={line}
                onNavigate={close}
                onRemove={() => remove(line.product.id, line.product.title)}
              />
            ))}
          </Box>
          <Box sx={{ p: 2.5, borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
            <OrderSummary totals={totals} />
            <Button
              component={Link}
              href="/checkout/"
              onClick={close}
              variant="contained"
              size="large"
              fullWidth
              sx={{ mt: 2, py: 1.5 }}
            >
              Checkout securely
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
}
