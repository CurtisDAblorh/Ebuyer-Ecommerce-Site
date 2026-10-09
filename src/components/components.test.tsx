import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";
import { PRODUCTS, salePrice } from "@/lib/catalog";
import { formatPrice } from "@/lib/pricing";
import { addItem } from "@/store/cartSlice";
import { setCartOpen } from "@/store/uiSlice";
import { ProductCard } from "./product/ProductCard";
import { QuantityStepper } from "./product/QuantityStepper";
import { CartDrawer } from "./cart/CartDrawer";
import { RatingBars } from "./charts/RatingBars";
import { CardPreview } from "./checkout/CardPreview";

const product = PRODUCTS.find((p) => p.stock > 10)!;

describe("ProductCard", () => {
  it("shows price, discount and adds to the bag", async () => {
    const { store } = renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByText(product.title)).toBeInTheDocument();
    expect(screen.getAllByTestId("price")[0]).toHaveTextContent(formatPrice(salePrice(product)));
    await userEvent.click(screen.getByRole("button", { name: `Add ${product.title} to bag` }));
    expect(store.getState().cart.items).toEqual([{ id: product.id, qty: 1 }]);
    expect(store.getState().ui.toast?.message).toMatch(/Added/);
  });

  it("toggles the wishlist and opens quick view", async () => {
    const { store } = renderWithProviders(<ProductCard product={product} />);
    await userEvent.click(
      screen.getByRole("button", { name: `Save ${product.title} to wishlist` }),
    );
    expect(store.getState().shopper.wishlist).toContain(product.id);
    await userEvent.click(screen.getByRole("button", { name: `Quick view ${product.title}` }));
    expect(store.getState().ui.quickViewId).toBe(product.id);
  });
});

describe("QuantityStepper", () => {
  it("respects min and max", async () => {
    const onChange = jest.fn();
    const { rerender } = renderWithProviders(
      <QuantityStepper value={1} onChange={onChange} max={2} />,
    );
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(onChange).toHaveBeenCalledWith(2);
    rerender(<QuantityStepper value={2} onChange={onChange} max={2} />);
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  });
});

describe("CartDrawer", () => {
  it("shows lines, applies a promo, and supports undo on remove", async () => {
    const { store } = renderWithProviders(<CartDrawer />);
    act(() => {
      store.dispatch(addItem({ id: product.id, qty: 2 }));
      store.dispatch(setCartOpen(true));
    });

    const drawer = await screen.findByRole("presentation");
    expect(within(drawer).getAllByTestId("cart-line")).toHaveLength(1);

    await userEvent.type(within(drawer).getByLabelText("Promo code"), "EBUYER10");
    await userEvent.click(within(drawer).getByRole("button", { name: "Apply" }));
    expect(within(drawer).getByText("EBUYER10 applied")).toBeInTheDocument();
    expect(within(drawer).getByText("Promo discount")).toBeInTheDocument();

    await userEvent.click(within(drawer).getByRole("button", { name: `Remove ${product.title}` }));
    expect(store.getState().cart.items).toHaveLength(0);
    expect(within(drawer).getByText(`Removed ${product.title}`)).toBeInTheDocument();
    await userEvent.click(within(drawer).getByRole("button", { name: "Undo" }));
    expect(store.getState().cart.items).toEqual([{ id: product.id, qty: 2 }]);
  });

  it("shows an empty state", async () => {
    const { store } = renderWithProviders(<CartDrawer />);
    act(() => {
      store.dispatch(setCartOpen(true));
    });
    expect(await screen.findByText("Your bag is empty")).toBeInTheDocument();
  });
});

describe("RatingBars", () => {
  it("filters by star rating on click", async () => {
    const onSelect = jest.fn();
    renderWithProviders(
      <RatingBars
        data={[
          { stars: 5, count: 3 },
          { stars: 4, count: 1 },
        ]}
        selected={null}
        onSelect={onSelect}
      />,
    );
    await userEvent.click(screen.getByTestId("rating-row-4"));
    expect(onSelect).toHaveBeenCalledWith(4);
  });
});

describe("CardPreview", () => {
  it("formats the number and shows the brand", () => {
    renderWithProviders(
      <CardPreview name="Ada" number="4242424242424242" expiry="12/29" cvc="" flipped={false} />,
    );
    const card = screen.getByTestId("card-preview");
    expect(card).toHaveTextContent("4242 4242 4242 4242");
    expect(card).toHaveTextContent(/visa/i);
  });
});
