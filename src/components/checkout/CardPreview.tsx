import Box from "@mui/material/Box";
import { cardBrand, formatCardNumber } from "@/lib/checkout";

const GRADIENTS = {
  visa: "linear-gradient(135deg,#1e3a8a,#3b82f6 60%,#06b6d4)",
  mastercard: "linear-gradient(135deg,#111827,#7c2d12 55%,#f97316)",
  amex: "linear-gradient(135deg,#065f46,#10b981 60%,#a7f3d0)",
  unknown: "linear-gradient(135deg,#18181b,#3f3f46 60%,#71717a)",
};

/** Live card preview that flips to show the CVC while that field is focused. */
export function CardPreview({
  name,
  number,
  expiry,
  cvc,
  flipped,
}: {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
  flipped: boolean;
}) {
  const brand = cardBrand(number);
  const face = {
    position: "absolute",
    inset: 0,
    borderRadius: 4,
    p: 3,
    color: "#fff",
    backfaceVisibility: "hidden",
    background: GRADIENTS[brand],
    boxShadow: "0 30px 60px -25px rgba(0,0,0,.6)",
    transition: "background .4s",
  } as const;

  return (
    <Box
      sx={{ perspective: 1200, width: "100%", maxWidth: 360, aspectRatio: "1.586", mx: "auto" }}
      aria-hidden
      data-testid="card-preview"
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform .7s cubic-bezier(.3,1.3,.6,1)",
          transform: flipped ? "rotateY(180deg)" : "none",
        }}
      >
        <Box
          sx={{
            ...face,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box
              sx={{
                width: 44,
                height: 32,
                borderRadius: 1.5,
                background: "linear-gradient(135deg,#fde68a,#d97706)",
              }}
            />
            <span className="text-lg font-extrabold tracking-wide uppercase italic opacity-90">
              {brand === "unknown" ? "card" : brand}
            </span>
          </Box>
          <span className="font-mono text-xl tracking-[0.15em] sm:text-2xl">
            {formatCardNumber(number) || "•••• •••• •••• ••••"}
          </span>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              textTransform: "uppercase",
            }}
          >
            <span className="truncate pr-4">{name || "Your name"}</span>
            <span>{expiry || "MM/YY"}</span>
          </Box>
        </Box>
        <Box sx={{ ...face, transform: "rotateY(180deg)", p: 0, overflow: "hidden" }}>
          <Box sx={{ height: 44, bgcolor: "#111", mt: 3 }} />
          <Box
            sx={{
              mx: 3,
              mt: 2,
              height: 36,
              bgcolor: "rgba(255,255,255,.9)",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: 1.5,
              color: "#111",
              fontFamily: "monospace",
              fontWeight: 700,
            }}
          >
            {cvc || "•••"}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
