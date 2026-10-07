export const FREE_SHIPPING_THRESHOLD = 75;

export type DeliveryOption = {
  id: "standard" | "express" | "nextday";
  label: string;
  days: string;
  price: number;
};

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: "standard", label: "Standard", days: "3–5 working days", price: 4.99 },
  { id: "express", label: "Express", days: "1–2 working days", price: 9.99 },
  { id: "nextday", label: "Next day", days: "Order by 8pm", price: 14.99 },
];

export type Promo = {
  code: string;
  label: string;
  percent?: number;
  freeShipping?: boolean;
  minSpend?: number;
};

export const PROMOS: Promo[] = [
  { code: "EBUYER10", label: "10% off your order", percent: 10 },
  { code: "WELCOME20", label: "20% off orders over £100", percent: 20, minSpend: 100 },
  { code: "FREESHIP", label: "Free delivery", freeShipping: true },
];

export function findPromo(code: string) {
  return PROMOS.find((p) => p.code === code.trim().toUpperCase());
}

export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  savings: number;
  promoError?: string;
};

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Order totals. `listTotal` is the pre-sale price sum, used to show savings.
 * Standard delivery is free over the threshold; faster options are always charged.
 */
export function computeTotals({
  subtotal,
  listTotal,
  promoCode,
  delivery = "standard",
}: {
  subtotal: number;
  listTotal: number;
  promoCode?: string | null;
  delivery?: DeliveryOption["id"];
}): Totals {
  const promo = promoCode ? findPromo(promoCode) : undefined;
  let promoError: string | undefined;
  let discount = 0;
  let freeShipping = false;

  if (promoCode && !promo) promoError = "That code isn't valid.";
  else if (promo?.minSpend && subtotal < promo.minSpend)
    promoError = `Spend £${promo.minSpend} to use ${promo.code}.`;
  else if (promo) {
    discount = promo.percent ? round((subtotal * promo.percent) / 100) : 0;
    freeShipping = Boolean(promo.freeShipping);
  }

  const option = DELIVERY_OPTIONS.find((o) => o.id === delivery)!;
  const qualifiesFree =
    delivery === "standard" && (subtotal >= FREE_SHIPPING_THRESHOLD || freeShipping);
  const shipping = subtotal === 0 || qualifiesFree ? 0 : option.price;

  return {
    subtotal: round(subtotal),
    discount,
    shipping,
    total: round(subtotal - discount + shipping),
    savings: round(listTotal - subtotal + discount),
    promoError,
  };
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
