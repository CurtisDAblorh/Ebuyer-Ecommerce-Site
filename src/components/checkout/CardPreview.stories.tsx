import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardPreview } from "./CardPreview";

const meta: Meta<typeof CardPreview> = {
  title: "Checkout/CardPreview",
  component: CardPreview,
  args: {
    name: "Ada Lovelace",
    number: "4242424242424242",
    expiry: "12/29",
    cvc: "123",
    flipped: false,
  },
};
export default meta;

type Story = StoryObj<typeof CardPreview>;

export const Visa: Story = {};
export const Mastercard: Story = { args: { number: "5555555555554444" } };
export const Amex: Story = { args: { number: "378282246310005" } };
export const Empty: Story = { args: { name: "", number: "", expiry: "", cvc: "" } };
export const ShowingCvc: Story = { args: { flipped: true } };
