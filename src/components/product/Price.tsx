import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { salePrice, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/pricing";

export function Price({
  product,
  size = "md",
}: {
  product: Pick<Product, "price" | "discountPercentage">;
  size?: "md" | "lg";
}) {
  const sale = salePrice(product);
  const discounted = product.discountPercentage >= 1;
  return (
    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
      <Typography
        component="span"
        sx={{ fontWeight: 800, fontSize: size === "lg" ? "2rem" : "1.05rem" }}
        data-testid="price"
      >
        {formatPrice(sale)}
      </Typography>
      {discounted && (
        <Typography
          component="span"
          sx={{
            color: "text.secondary",
            textDecoration: "line-through",
            fontSize: size === "lg" ? "1.1rem" : "0.85rem",
          }}
        >
          {formatPrice(product.price)}
        </Typography>
      )}
    </Box>
  );
}
