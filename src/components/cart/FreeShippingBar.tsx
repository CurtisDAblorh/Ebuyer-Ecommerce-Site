import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import { FREE_SHIPPING_THRESHOLD, formatPrice } from "@/lib/pricing";

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  return (
    <Box sx={{ p: 2, borderRadius: 3, bgcolor: "action.hover" }}>
      <Typography
        variant="body2"
        sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, fontWeight: 600 }}
        aria-live="polite"
      >
        <LocalShippingOutlined fontSize="small" />
        {remaining > 0 ? (
          <span>
            You&apos;re <strong>{formatPrice(remaining)}</strong> away from free delivery
          </span>
        ) : (
          <span>You&apos;ve unlocked free delivery 🎉</span>
        )}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={remaining > 0 ? "primary" : "success"}
        aria-label="Progress to free delivery"
        sx={{ height: 8, borderRadius: 999 }}
      />
    </Box>
  );
}
