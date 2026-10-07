import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import Box from "@mui/material/Box";
import { PRODUCTS, salePrice } from "@/lib/catalog";
import { priceHistory, ratingDistribution } from "@/lib/insights";
import { departmentSpend, monthlySpend } from "@/lib/spending";
import { sampleOrders } from "@/lib/sampleOrders";
import { PriceHistogram } from "./PriceHistogram";
import { PriceHistoryChart } from "./PriceHistoryChart";
import { RatingBars } from "./RatingBars";
import { DepartmentDonut, MonthlySpendChart } from "./SpendingCharts";

const NOW = new Date(2026, 9, 1);
const orders = sampleOrders(NOW.getTime());

const meta: Meta = { title: "Charts/D3" };
export default meta;

function HistogramDemo() {
  const [range, setRange] = useState<[number, number] | null>(null);
  return (
    <Box sx={{ maxWidth: 320 }}>
      <PriceHistogram prices={PRODUCTS.map(salePrice)} value={range} onChange={setRange} />
    </Box>
  );
}

export const PriceBrush: StoryObj = {
  render: () => <HistogramDemo />,
  parameters: {
    docs: {
      description: { story: "Drag across the chart to select a price range; click to clear." },
    },
  },
};

export const PriceHistory: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 720 }}>
      <PriceHistoryChart data={priceHistory(PRODUCTS[4], NOW)} />
    </Box>
  ),
};

function RatingsDemo() {
  const [stars, setStars] = useState<number | null>(null);
  const reviews = PRODUCTS.flatMap((p) => p.reviews).slice(0, 60);
  return (
    <Box sx={{ maxWidth: 360 }}>
      <RatingBars data={ratingDistribution(reviews)} selected={stars} onSelect={setStars} />
    </Box>
  );
}

export const Ratings: StoryObj = { render: () => <RatingsDemo /> };

export const MonthlySpend: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 720 }}>
      <MonthlySpendChart data={monthlySpend(orders, NOW)} />
    </Box>
  ),
};

export const SpendByDepartment: StoryObj = {
  render: () => <DepartmentDonut data={departmentSpend(orders)} />,
};
