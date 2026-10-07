"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Skeleton from "@mui/material/Skeleton";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import SavingsOutlined from "@mui/icons-material/SavingsOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import { PRODUCTS_BY_ID } from "@/lib/catalog";
import { DELIVERY_OPTIONS, formatPrice } from "@/lib/pricing";
import { departmentSpend, monthlySpend } from "@/lib/spending";
import { useAppSelector } from "@/store/hooks";
import { useMounted } from "@/hooks/useMounted";
import { MonthlySpendChart, DepartmentDonut } from "@/components/charts/SpendingCharts";

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ReceiptLongOutlined;
  label: string;
  value: string;
}) {
  return (
    <Card sx={{ p: 2.5, display: "flex", gap: 2, alignItems: "center" }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 3,
          display: "grid",
          placeItems: "center",
          bgcolor: "highlight.main",
          color: "highlight.contrastText",
        }}
      >
        <Icon />
      </Box>
      <div>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: ".08em" }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: 22 }}>{value}</Typography>
      </div>
    </Card>
  );
}

export function OrdersView() {
  const mounted = useMounted();
  const orders = useAppSelector((s) => s.shopper.orders);
  const hydrated = useAppSelector((s) => s.shopper.hydrated);
  const [now] = useState(() => new Date());
  const months = useMemo(() => monthlySpend(orders, now), [orders, now]);
  const depts = useMemo(() => departmentSpend(orders), [orders]);

  const spent = orders.reduce((s, o) => s + o.totals.total, 0);
  const saved = orders.reduce((s, o) => s + o.totals.savings, 0);
  const items = orders.reduce((s, o) => s + o.lines.reduce((n, l) => n + l.qty, 0), 0);

  if (!mounted || !hydrated) {
    return (
      <div className="container-page grid gap-4 py-10">
        <Skeleton variant="rounded" height={56} width={280} />
        <Skeleton variant="rounded" height={96} />
        <Skeleton variant="rounded" height={300} />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 32, md: 44 } }}>
        Orders & insights
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 4 }}>
        Your spending at a glance.{" "}
        {orders.some((o) => o.sample) && "Sample orders are included so the charts have data."}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(4,1fr)" },
          gap: 2,
        }}
      >
        <Stat icon={ReceiptLongOutlined} label="Orders" value={String(orders.length)} />
        <Stat icon={ShoppingBagOutlined} label="Total spent" value={formatPrice(spent)} />
        <Stat icon={SavingsOutlined} label="Saved" value={formatPrice(saved)} />
        <Stat icon={Inventory2Outlined} label="Items" value={String(items)} />
      </Box>

      <Box
        sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 2, mt: 2 }}
      >
        <Card sx={{ p: 3 }}>
          <Typography variant="h6">Monthly spend</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Last six months, by department. Hover a month for the breakdown.
          </Typography>
          <MonthlySpendChart data={months} />
        </Card>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Where it goes
          </Typography>
          <DepartmentDonut data={depts} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2, justifyContent: "center" }}>
            {depts.map((d) => (
              <Chip
                key={d.department}
                size="small"
                variant="outlined"
                label={`${d.label} · ${formatPrice(d.total)}`}
              />
            ))}
          </Box>
        </Card>
      </Box>

      <Typography variant="h5" component="h2" sx={{ mt: 6, mb: 2 }}>
        Order history
      </Typography>
      {orders.map((o) => (
        <Accordion
          key={o.id}
          disableGutters
          sx={{
            mb: 1.5,
            borderRadius: "14px !important",
            border: 1,
            borderColor: "divider",
            "&::before": { display: "none" },
          }}
          elevation={0}
          data-testid="order"
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: { xs: 1, sm: 4 },
                alignItems: "center",
                width: "100%",
                pr: 2,
              }}
            >
              <Typography sx={{ fontWeight: 700, minWidth: 110 }}>{o.id}</Typography>
              <Typography sx={{ color: "text.secondary", minWidth: 120 }}>
                {new Date(o.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Typography>
              <Box sx={{ display: "flex", ml: { sm: "auto" } }}>
                {o.lines.slice(0, 3).map((l) => (
                  <img
                    key={l.id}
                    src={PRODUCTS_BY_ID.get(l.id)?.thumbnail}
                    alt=""
                    className="-ml-2 size-9 rounded-full border-2 border-surface bg-white object-contain first:ml-0"
                  />
                ))}
              </Box>
              <Chip
                size="small"
                label={o.sample ? "Delivered" : "Processing"}
                color={o.sample ? "default" : "success"}
              />
              <Typography sx={{ fontWeight: 700 }}>{formatPrice(o.totals.total)}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {o.lines.map((l) => {
              const p = PRODUCTS_BY_ID.get(l.id);
              return (
                <Box
                  key={l.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.75,
                    borderTop: 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography>
                    {l.qty} × {p?.title ?? "Product"}
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {formatPrice(l.unitPrice * l.qty)}
                  </Typography>
                </Box>
              );
            })}
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              {DELIVERY_OPTIONS.find((d) => d.id === o.delivery)?.label} delivery to{" "}
              {o.address.city}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
