import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { computeTotals } from "@/lib/pricing";
import { OrderSummary } from "./OrderSummary";
import { FreeShippingBar } from "./FreeShippingBar";

const meta: Meta<typeof OrderSummary> = {
  title: "Cart/OrderSummary",
  component: OrderSummary,
  render: (args) => (
    <Card sx={{ maxWidth: 400, p: 3 }}>
      <OrderSummary {...args} />
    </Card>
  ),
};
export default meta;

type Story = StoryObj<typeof OrderSummary>;

export const BelowFreeDelivery: Story = {
  args: { totals: computeTotals({ subtotal: 42.5, listTotal: 49.99 }) },
};
export const FreeDelivery: Story = {
  args: { totals: computeTotals({ subtotal: 120, listTotal: 149.99 }) },
};
export const WithPromo: Story = {
  args: {
    totals: computeTotals({ subtotal: 120, listTotal: 140, promoCode: "EBUYER10" }),
    showPromo: false,
  },
};

export const ShippingProgress: StoryObj<typeof FreeShippingBar> = {
  render: () => (
    <Box sx={{ display: "grid", gap: 2, maxWidth: 400 }}>
      <FreeShippingBar subtotal={12} />
      <FreeShippingBar subtotal={55} />
      <FreeShippingBar subtotal={90} />
    </Box>
  ),
};
