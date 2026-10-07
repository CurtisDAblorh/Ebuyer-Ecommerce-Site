"use client";

import Link from "next/link";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import { PRODUCTS_BY_ID, type Product } from "@/lib/catalog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/cartSlice";
import { pulseCart, showToast } from "@/store/uiSlice";
import { ProductCard } from "@/components/product/ProductCard";

export function WishlistView() {
  const dispatch = useAppDispatch();
  const ids = useAppSelector((s) => s.shopper.wishlist);
  const products = ids.map((id) => PRODUCTS_BY_ID.get(id)).filter((p): p is Product => Boolean(p));

  return (
    <div className="container-page py-10">
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mb: 4,
        }}
      >
        <div>
          <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 32, md: 44 } }}>
            Wishlist
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>{products.length} saved items</Typography>
        </div>
        {products.length > 0 && (
          <Button
            variant="contained"
            onClick={() => {
              products.forEach((p) => dispatch(addItem({ id: p.id, stock: p.stock })));
              dispatch(pulseCart());
              dispatch(showToast({ message: `Added ${products.length} items to your bag` }));
            }}
          >
            Add all to bag
          </Button>
        )}
      </Box>
      {products.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <FavoriteBorder sx={{ fontSize: 56, color: "text.secondary" }} />
          <Typography variant="h6" sx={{ mt: 1 }}>
            Nothing saved yet
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 3 }}>
            Tap the heart on any product to save it for later.
          </Typography>
          <Button component={Link} href="/shop/" variant="contained">
            Discover products
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(3,1fr)", lg: "repeat(4,1fr)" },
            gap: 2.5,
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Box>
      )}
    </div>
  );
}
