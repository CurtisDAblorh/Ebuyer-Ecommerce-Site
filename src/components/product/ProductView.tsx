"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import AutorenewOutlined from "@mui/icons-material/AutorenewOutlined";
import VerifiedUserOutlined from "@mui/icons-material/VerifiedUserOutlined";
import TrendingDown from "@mui/icons-material/TrendingDown";
import {
  PRODUCTS_BY_ID,
  categoryLabel,
  departmentOf,
  relatedProducts,
  type Product,
} from "@/lib/catalog";
import { priceHistory, priceStats, ratingDistribution } from "@/lib/insights";
import { formatPrice } from "@/lib/pricing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { viewProduct } from "@/store/shopperSlice";
import { useMounted } from "@/hooks/useMounted";
import { PriceHistoryChart } from "@/components/charts/PriceHistoryChart";
import { RatingBars } from "@/components/charts/RatingBars";
import { Gallery } from "./Gallery";
import { Price } from "./Price";
import { QuantityStepper } from "./QuantityStepper";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";
import { ProductRail } from "./ProductRail";

export function ProductView({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const mounted = useMounted();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState(0);
  const [stars, setStars] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const recentIds = useAppSelector((s) => s.shopper.recentlyViewed);

  useEffect(() => {
    dispatch(viewProduct(product.id));
  }, [dispatch, product.id]);

  const dept = departmentOf(product.category);
  const related = useMemo(() => relatedProducts(product), [product]);
  const recent = useMemo(
    () =>
      recentIds
        .filter((id) => id !== product.id)
        .map((id) => PRODUCTS_BY_ID.get(id))
        .filter((p): p is Product => Boolean(p)),
    [recentIds, product.id],
  );
  const distribution = useMemo(() => ratingDistribution(product.reviews), [product.reviews]);
  // History depends on "today", so only compute it on the client.
  const history = useMemo(
    () => (mounted ? priceHistory(product, new Date()) : []),
    [mounted, product],
  );
  const stats = history.length ? priceStats(history) : null;
  const reviews = stars
    ? product.reviews.filter((r) => Math.round(r.rating) === stars)
    : product.reviews;

  return (
    <div className="container-page py-8">
      <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 3 }}>
        <Link href="/">Home</Link>
        {dept && <Link href={`/shop/?department=${dept.id}`}>{dept.label}</Link>}
        <Typography color="text.primary" noWrap sx={{ maxWidth: 240 }}>
          {product.title}
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" },
          gap: { xs: 4, md: 8 },
        }}
      >
        <Gallery
          images={product.images.length ? product.images : [product.thumbnail]}
          title={product.title}
          imageRef={imageRef}
        />

        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1}>
            <Chip size="small" label={categoryLabel(product.category)} variant="outlined" />
            {product.discountPercentage >= 10 && (
              <Chip
                size="small"
                color="secondary"
                label={`Save ${Math.round(product.discountPercentage)}%`}
              />
            )}
          </Stack>
          <div>
            {product.brand && (
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", letterSpacing: ".12em" }}
              >
                {product.brand}
              </Typography>
            )}
            <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 30, md: 42 } }}>
              {product.title}
            </Typography>
          </div>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Rating value={product.rating} precision={0.1} readOnly />
            <Button size="small" onClick={() => setTab(1)} sx={{ color: "text.secondary", px: 1 }}>
              {product.rating.toFixed(1)} · {product.reviews.length} reviews
            </Button>
          </Box>
          <Price product={product} size="lg" />
          {stats?.isLowest && (
            <Alert icon={<TrendingDown />} severity="success" sx={{ borderRadius: 3 }}>
              Lowest price in 90 days
            </Alert>
          )}
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
            {product.description}
          </Typography>
          <Typography
            sx={{ fontWeight: 600, color: product.stock < 10 ? "secondary.main" : "success.main" }}
          >
            {product.stock === 0
              ? "Out of stock"
              : product.stock < 10
                ? `Only ${product.stock} left — order soon`
                : "In stock, ready to ship"}
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <QuantityStepper
              value={qty}
              onChange={setQty}
              max={Math.max(1, Math.min(10, product.stock))}
            />
            <AddToCartButton
              product={product}
              qty={qty}
              imageRef={imageRef}
              size="large"
              sx={{ flex: 1, py: 1.5 }}
            />
            <WishlistButton id={product.id} title={product.title} />
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5, pt: 1 }}>
            {[
              { icon: LocalShippingOutlined, text: product.shippingInformation },
              { icon: AutorenewOutlined, text: product.returnPolicy },
              { icon: VerifiedUserOutlined, text: product.warrantyInformation },
            ].map(({ icon: Icon, text }) => (
              <Box
                key={text}
                sx={{ p: 1.5, borderRadius: 3, bgcolor: "action.hover", textAlign: "center" }}
              >
                <Icon fontSize="small" />
                <Typography variant="caption" component="p" sx={{ mt: 0.5, lineHeight: 1.3 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>

      <Box sx={{ mt: 8 }}>
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          aria-label="Product information"
          variant="scrollable"
        >
          <Tab label="Price history" id="tab-0" aria-controls="panel-0" />
          <Tab label={`Reviews (${product.reviews.length})`} id="tab-1" aria-controls="panel-1" />
          <Tab label="Specifications" id="tab-2" aria-controls="panel-2" />
        </Tabs>
        <Divider />

        <Box role="tabpanel" hidden={tab !== 0} id="panel-0" aria-labelledby="tab-0" sx={{ py: 4 }}>
          {tab === 0 && stats && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 3fr" },
                gap: 4,
                alignItems: "center",
              }}
            >
              <Stack spacing={2}>
                {[
                  { label: "Current", value: stats.current },
                  { label: "90-day low", value: stats.low },
                  { label: "90-day high", value: stats.high },
                  { label: "Average", value: stats.avg },
                ].map((s) => (
                  <Box
                    key={s.label}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: 1,
                      borderColor: "divider",
                      pb: 1,
                    }}
                  >
                    <Typography sx={{ color: "text.secondary" }}>{s.label}</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{formatPrice(s.value)}</Typography>
                  </Box>
                ))}
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Simulated history for demo purposes.
                </Typography>
              </Stack>
              <PriceHistoryChart data={history} />
            </Box>
          )}
        </Box>

        <Box role="tabpanel" hidden={tab !== 1} id="panel-1" aria-labelledby="tab-1" sx={{ py: 4 }}>
          {tab === 1 && (
            <Box
              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" }, gap: 5 }}
            >
              <div>
                <Typography sx={{ fontSize: 56, fontWeight: 800, lineHeight: 1 }}>
                  {product.rating.toFixed(1)}
                </Typography>
                <Rating value={product.rating} precision={0.1} readOnly />
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  Based on {product.reviews.length} reviews · click a bar to filter
                </Typography>
                <RatingBars data={distribution} selected={stars} onSelect={setStars} />
              </div>
              <Stack spacing={3} divider={<Divider flexItem />} aria-live="polite">
                {reviews.length === 0 && (
                  <Typography sx={{ color: "text.secondary" }}>
                    No {stars}-star reviews yet.
                  </Typography>
                )}
                {reviews.map((r, i) => (
                  <Box key={i} data-testid="review" sx={{ display: "flex", gap: 2 }}>
                    <Avatar sx={{ bgcolor: dept?.accent }}>{r.reviewerName[0]}</Avatar>
                    <div>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontWeight: 700 }}>{r.reviewerName}</Typography>
                        <Rating value={r.rating} readOnly size="small" />
                      </Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {new Date(r.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Typography>
                      <Typography sx={{ mt: 0.5 }}>{r.comment}</Typography>
                    </div>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Box>

        <Box role="tabpanel" hidden={tab !== 2} id="panel-2" aria-labelledby="tab-2" sx={{ py: 4 }}>
          {tab === 2 && (
            <Box
              component="dl"
              sx={{
                display: "grid",
                gridTemplateColumns: "max-content 1fr",
                columnGap: 4,
                rowGap: 1.5,
                m: 0,
              }}
            >
              {[
                ["Brand", product.brand ?? "—"],
                ["Category", categoryLabel(product.category)],
                ["SKU", product.sku],
                ["Weight", `${product.weight} kg`],
                ["Warranty", product.warrantyInformation],
                ["Tags", product.tags.join(", ")],
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: "contents" }}>
                  <Typography component="dt" sx={{ color: "text.secondary" }}>
                    {k}
                  </Typography>
                  <Typography component="dd" sx={{ m: 0, fontWeight: 600 }}>
                    {v}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <ProductRail title="You might also like" products={related} />
      {mounted && <ProductRail title="Recently viewed" products={recent} />}
    </div>
  );
}
