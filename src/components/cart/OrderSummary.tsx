"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LocalOfferOutlined from "@mui/icons-material/LocalOfferOutlined";
import { formatPrice, PROMOS, type Totals } from "@/lib/pricing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { applyPromo } from "@/store/cartSlice";

function Row({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
      <Typography
        sx={{
          color: strong ? "text.primary" : "text.secondary",
          fontWeight: strong ? 800 : 500,
          fontSize: strong ? 18 : 15,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: strong ? 800 : 600,
          fontSize: strong ? 18 : 15,
          color: accent ? "success.main" : undefined,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export function OrderSummary({
  totals,
  showPromo = true,
}: {
  totals: Totals;
  showPromo?: boolean;
}) {
  const dispatch = useAppDispatch();
  const promoCode = useAppSelector((s) => s.cart.promoCode);
  const [code, setCode] = useState("");

  return (
    <Box>
      {showPromo && (
        <Box sx={{ mb: 2 }}>
          {promoCode && !totals.promoError ? (
            <Chip
              icon={<LocalOfferOutlined />}
              label={`${promoCode} applied`}
              color="success"
              variant="outlined"
              onDelete={() => dispatch(applyPromo(null))}
            />
          ) : (
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim()) dispatch(applyPromo(code));
              }}
              sx={{ display: "flex", gap: 1 }}
            >
              <TextField
                label="Promo code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={Boolean(promoCode && totals.promoError)}
                helperText={
                  promoCode && totals.promoError ? totals.promoError : `Try ${PROMOS[0].code}`
                }
              />
              <Button type="submit" variant="outlined" sx={{ height: 40 }}>
                Apply
              </Button>
            </Box>
          )}
        </Box>
      )}
      <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
      {totals.discount > 0 && (
        <Row label="Promo discount" value={`−${formatPrice(totals.discount)}`} accent />
      )}
      <Row label="Delivery" value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)} />
      <Divider sx={{ my: 1 }} />
      <Row label="Total" value={formatPrice(totals.total)} strong />
      {totals.savings > 0.5 && (
        <Typography variant="body2" sx={{ color: "success.main", fontWeight: 600, mt: 0.5 }}>
          You&apos;re saving {formatPrice(totals.savings)}
        </Typography>
      )}
    </Box>
  );
}
