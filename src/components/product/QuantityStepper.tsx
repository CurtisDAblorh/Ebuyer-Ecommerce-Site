"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: "small" | "medium";
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  label = "Quantity",
  size = "medium",
}: Props) {
  return (
    <Box
      role="group"
      aria-label={label}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        border: 1,
        borderColor: "divider",
        borderRadius: 999,
        p: 0.25,
      }}
    >
      <IconButton
        size="small"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Remove fontSize="small" />
      </IconButton>
      <Typography
        aria-live="polite"
        sx={{ minWidth: size === "small" ? 24 : 32, textAlign: "center", fontWeight: 700 }}
        data-testid="qty"
      >
        {value}
      </Typography>
      <IconButton
        size="small"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Add fontSize="small" />
      </IconButton>
    </Box>
  );
}
