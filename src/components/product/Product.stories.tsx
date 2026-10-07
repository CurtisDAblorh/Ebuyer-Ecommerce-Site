import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import Box from "@mui/material/Box";
import { PRODUCTS } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { QuantityStepper } from "./QuantityStepper";
import { Price } from "./Price";

const discounted = [...PRODUCTS].sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
const lowStock = PRODUCTS.find((p) => p.stock > 0 && p.stock < 10) ?? PRODUCTS[1];

const meta: Meta<typeof ProductCard> = {
  title: "Product/ProductCard",
  component: ProductCard,
  args: { product: PRODUCTS[0] },
  render: (args) => (
    <Box sx={{ maxWidth: 300 }}>
      <ProductCard {...args} />
    </Box>
  ),
};
export default meta;

type Story = StoryObj<typeof ProductCard>;

export const Default: Story = {};
export const OnSale: Story = { args: { product: discounted } };
export const LowStock: Story = { args: { product: lowStock } };

export const AddToBag: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: `Add ${PRODUCTS[0].title} to bag` }));
    await expect(
      canvas.getByRole("button", { name: `Add ${PRODUCTS[0].title} to bag` }),
    ).toHaveTextContent("Added");
  },
};

export const Grid: Story = {
  render: () => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 2.5,
      }}
    >
      {PRODUCTS.slice(0, 8).map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </Box>
  ),
};

function StepperDemo() {
  const [qty, setQty] = useState(1);
  return <QuantityStepper value={qty} onChange={setQty} max={5} />;
}

export const Stepper: StoryObj<typeof QuantityStepper> = { render: () => <StepperDemo /> };

export const Prices: StoryObj<typeof Price> = {
  render: () => (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Price product={{ price: 49.99, discountPercentage: 0 }} />
      <Price product={{ price: 49.99, discountPercentage: 20 }} />
      <Price product={{ price: 1299, discountPercentage: 12.5 }} size="lg" />
    </Box>
  ),
};
