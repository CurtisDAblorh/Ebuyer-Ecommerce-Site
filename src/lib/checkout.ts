import { z } from "zod";

/** Luhn checksum used by all major card networks. */
export function luhn(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 12) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export type CardBrand = "visa" | "mastercard" | "amex" | "unknown";

export function cardBrand(cardNumber: string): CardBrand {
  const n = cardNumber.replace(/\D/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return "unknown";
}

/** Groups digits for display: 4-4-4-4, or 4-6-5 for Amex. */
export function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  if (cardBrand(digits) === "amex")
    return digits.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_m, a, b, c) =>
      [a, b, c].filter(Boolean).join(" "),
    );
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function expiryInFuture(value: string, now = new Date()) {
  const m = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  return new Date(year, month, 1) > new Date(now.getFullYear(), now.getMonth(), 1);
}

const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export const shippingSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.email("Enter a valid email address"),
  line1: z.string().trim().min(3, "Enter your street address"),
  city: z.string().trim().min(2, "Enter your town or city"),
  postcode: z.string().trim().regex(UK_POSTCODE, "Enter a valid UK postcode"),
  country: z.string().min(1),
});

export const paymentSchema = z.object({
  cardName: z.string().trim().min(2, "Enter the name on your card"),
  cardNumber: z.string().refine(luhn, "Enter a valid card number"),
  expiry: z.string().refine((v) => expiryInFuture(v), "Enter a future expiry date (MM/YY)"),
  cvc: z.string().regex(/^\d{3,4}$/, "3 or 4 digits"),
});

export type ShippingValues = z.infer<typeof shippingSchema>;
export type PaymentValues = z.infer<typeof paymentSchema>;

/** Stripe's public test card, shown as a hint in the payment step. */
export const TEST_CARD = "4242 4242 4242 4242";
