"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import confetti from "canvas-confetti";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircle from "@mui/icons-material/CheckCircle";
import LockOutlined from "@mui/icons-material/LockOutlined";
import {
  TEST_CARD,
  formatCardNumber,
  formatExpiry,
  paymentSchema,
  shippingSchema,
  type PaymentValues,
  type ShippingValues,
} from "@/lib/checkout";
import { DELIVERY_OPTIONS, formatPrice, type DeliveryOption } from "@/lib/pricing";
import { selectCartLines, selectCartTotals, useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCart } from "@/store/cartSlice";
import { placeOrder, type Order } from "@/store/shopperSlice";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { CardPreview } from "./CardPreview";

const STEPS = ["Details", "Delivery", "Payment", "Review"];

export function CheckoutView() {
  const dispatch = useAppDispatch();
  const lines = useAppSelector(selectCartLines);
  const [step, setStep] = useState(0);
  const [delivery, setDelivery] = useState<DeliveryOption["id"]>("standard");
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [cvcFocused, setCvcFocused] = useState(false);
  const totals = useAppSelector((s) => selectCartTotals(s, delivery));

  const shipping = useForm<ShippingValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: "",
      email: "",
      line1: "",
      city: "",
      postcode: "",
      country: "United Kingdom",
    },
    mode: "onTouched",
  });
  const payment = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { cardName: "", cardNumber: "", expiry: "", cvc: "" },
    mode: "onTouched",
  });
  const card = useWatch({ control: payment.control });

  const next = () => {
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitOrder = async () => {
    setPlacing(true);
    // Simulated payment authorisation.
    await new Promise((r) => setTimeout(r, 1200));
    const action = dispatch(
      placeOrder({
        lines: lines.map((l) => ({
          id: l.product.id,
          qty: l.qty,
          unitPrice: l.unitPrice,
          category: l.product.category,
        })),
        totals,
        delivery,
        address: shipping.getValues(),
      }),
    );
    dispatch(clearCart());
    setOrder(action.payload);
    setPlacing(false);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#d7ff3e", "#ff5a36", "#141414", "#6366f1"],
      });
    }
  };

  if (order) {
    return (
      <div className="container-page max-w-2xl py-16 text-center">
        <CheckCircle sx={{ fontSize: 72, color: "success.main" }} />
        <Typography variant="h3" component="h1" sx={{ mt: 2 }}>
          Order confirmed
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 1 }}>
          Thanks, {order.address.fullName.split(" ")[0]}! Your order{" "}
          <strong data-testid="order-id">{order.id}</strong> is on its way. No payment was taken —
          this is a demo store.
        </Typography>
        <Card sx={{ mt: 4, p: 3, textAlign: "left" }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Delivering to</Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {order.address.line1}, {order.address.city} {order.address.postcode.toUpperCase()}
          </Typography>
          <Typography sx={{ fontWeight: 700, mt: 2 }}>
            Total paid: {formatPrice(order.totals.total)}
          </Typography>
        </Card>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "center", mt: 4 }}>
          <Button component={Link} href="/orders/" variant="contained">
            View orders & insights
          </Button>
          <Button component={Link} href="/shop/" variant="outlined">
            Keep shopping
          </Button>
        </Stack>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="container-page max-w-xl py-24 text-center">
        <Typography variant="h4" component="h1">
          Your bag is empty
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 1, mb: 3 }}>
          Add something to your bag to check out.
        </Typography>
        <Button component={Link} href="/shop/" variant="contained">
          Browse the shop
        </Button>
      </div>
    );
  }

  const field = (
    form: typeof shipping,
    name: keyof ShippingValues,
    label: string,
    props: object = {},
  ) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field: f, fieldState }) => (
        <TextField
          {...f}
          label={label}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
          {...props}
        />
      )}
    />
  );

  return (
    <div className="container-page py-8">
      <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 32, md: 44 }, mb: 1 }}>
        Checkout
      </Typography>
      <Typography
        sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5, mb: 4 }}
      >
        <LockOutlined fontSize="small" /> Secure demo checkout — no real payment is taken
      </Typography>

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 5 }}>
        {STEPS.map((label, i) => (
          <Step key={label} completed={i < step}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" },
          gap: 5,
          alignItems: "start",
        }}
      >
        <Card sx={{ p: { xs: 2.5, sm: 4 } }}>
          {step === 0 && (
            <Box
              component="form"
              noValidate
              onSubmit={shipping.handleSubmit(next)}
              aria-label="Shipping details"
            >
              <Typography variant="h6" sx={{ mb: 3 }}>
                Where should we send it?
              </Typography>
              <Box
                sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}
              >
                {field(shipping, "fullName", "Full name", { autoComplete: "name" })}
                {field(shipping, "email", "Email", { type: "email", autoComplete: "email" })}
                <Box sx={{ gridColumn: { sm: "span 2" } }}>
                  {field(shipping, "line1", "Street address", { autoComplete: "address-line1" })}
                </Box>
                {field(shipping, "city", "Town / city", { autoComplete: "address-level2" })}
                {field(shipping, "postcode", "Postcode", { autoComplete: "postal-code" })}
                <Box sx={{ gridColumn: { sm: "span 2" } }}>
                  {field(shipping, "country", "Country", {
                    select: true,
                    children: ["United Kingdom"].map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    )),
                  })}
                </Box>
              </Box>
              <Button type="submit" variant="contained" size="large" sx={{ mt: 4 }}>
                Continue to delivery
              </Button>
            </Box>
          )}

          {step === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Choose a delivery speed
              </Typography>
              <RadioGroup
                value={delivery}
                onChange={(e) => setDelivery(e.target.value as DeliveryOption["id"])}
                aria-label="Delivery option"
              >
                <Stack spacing={1.5}>
                  {DELIVERY_OPTIONS.map((o) => {
                    const free = o.id === "standard" && totals.subtotal >= 75;
                    return (
                      <Card
                        key={o.id}
                        variant="outlined"
                        sx={{
                          px: 2,
                          py: 1,
                          borderWidth: 2,
                          borderColor: delivery === o.id ? "text.primary" : "divider",
                          transition: "border-color .2s",
                        }}
                      >
                        <FormControlLabel
                          value={o.id}
                          control={<Radio />}
                          sx={{ width: "100%", m: 0 }}
                          slotProps={{ typography: { sx: { flex: 1 } } }}
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                            >
                              <span>
                                <strong>{o.label}</strong>
                                <Typography
                                  component="span"
                                  sx={{ color: "text.secondary", display: "block", fontSize: 14 }}
                                >
                                  {o.days}
                                </Typography>
                              </span>
                              <strong>{free ? "Free" : formatPrice(o.price)}</strong>
                            </Box>
                          }
                        />
                      </Card>
                    );
                  })}
                </Stack>
              </RadioGroup>
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button onClick={() => setStep(0)}>Back</Button>
                <Button variant="contained" size="large" onClick={next}>
                  Continue to payment
                </Button>
              </Stack>
            </Box>
          )}

          {step === 2 && (
            <Box
              component="form"
              noValidate
              onSubmit={payment.handleSubmit(next)}
              aria-label="Payment details"
            >
              <Typography variant="h6" sx={{ mb: 3 }}>
                Payment
              </Typography>
              <CardPreview
                name={card.cardName ?? ""}
                number={card.cardNumber ?? ""}
                expiry={card.expiry ?? ""}
                cvc={card.cvc ?? ""}
                flipped={cvcFocused}
              />
              <Alert severity="info" sx={{ my: 3, borderRadius: 3 }}>
                Use the test card <strong>{TEST_CARD}</strong> with any future date and CVC.
              </Alert>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box sx={{ gridColumn: "span 2" }}>
                  <Controller
                    name="cardNumber"
                    control={payment.control}
                    render={({ field: f, fieldState }) => (
                      <TextField
                        {...f}
                        onChange={(e) => f.onChange(formatCardNumber(e.target.value))}
                        label="Card number"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Box>
                <Box sx={{ gridColumn: "span 2" }}>
                  <Controller
                    name="cardName"
                    control={payment.control}
                    render={({ field: f, fieldState }) => (
                      <TextField
                        {...f}
                        label="Name on card"
                        autoComplete="cc-name"
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Box>
                <Controller
                  name="expiry"
                  control={payment.control}
                  render={({ field: f, fieldState }) => (
                    <TextField
                      {...f}
                      onChange={(e) => f.onChange(formatExpiry(e.target.value))}
                      label="Expiry (MM/YY)"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="cvc"
                  control={payment.control}
                  render={({ field: f, fieldState }) => (
                    <TextField
                      {...f}
                      onChange={(e) => f.onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      onFocus={() => setCvcFocused(true)}
                      onBlur={() => {
                        setCvcFocused(false);
                        f.onBlur();
                      }}
                      label="CVC"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Box>
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" variant="contained" size="large">
                  Review order
                </Button>
              </Stack>
            </Box>
          )}

          {step === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Review your order
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                  gap: 2,
                  mb: 3,
                }}
              >
                {[
                  {
                    title: "Ship to",
                    body: `${shipping.getValues("fullName")}\n${shipping.getValues("line1")}\n${shipping.getValues("city")} ${shipping.getValues("postcode").toUpperCase()}`,
                    step: 0,
                  },
                  {
                    title: "Delivery",
                    body: DELIVERY_OPTIONS.find((o) => o.id === delivery)!.label,
                    step: 1,
                  },
                  {
                    title: "Payment",
                    body: `Card ending ${(card.cardNumber ?? "").replace(/\D/g, "").slice(-4)}`,
                    step: 2,
                  },
                ].map((b) => (
                  <Box key={b.title} sx={{ p: 2, borderRadius: 3, bgcolor: "action.hover" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography sx={{ fontWeight: 700 }}>{b.title}</Typography>
                      <Button
                        size="small"
                        onClick={() => setStep(b.step)}
                        sx={{ minWidth: 0, p: 0 }}
                      >
                        Edit
                      </Button>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", whiteSpace: "pre-line" }}
                    >
                      {b.body}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Stack direction="row" spacing={2}>
                <Button onClick={() => setStep(2)}>Back</Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={submitOrder}
                  disabled={placing}
                  startIcon={
                    placing ? <CircularProgress size={18} color="inherit" /> : <LockOutlined />
                  }
                >
                  {placing ? "Placing order…" : `Place order · ${formatPrice(totals.total)}`}
                </Button>
              </Stack>
            </Box>
          )}
        </Card>

        <Card sx={{ p: 3, position: { md: "sticky" }, top: 96 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Order summary
          </Typography>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {lines.map((l) => (
              <Box key={l.product.id} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Box sx={{ position: "relative" }}>
                  <img
                    src={l.product.thumbnail}
                    alt=""
                    className="size-14 rounded-lg bg-black/5 object-contain dark:bg-white/5"
                  />
                  <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-[#141414] text-[11px] font-bold text-white">
                    {l.qty}
                  </span>
                </Box>
                <Typography sx={{ flex: 1, fontSize: 14 }} className="line-clamp-2">
                  {l.product.title}
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                  {formatPrice(l.lineTotal)}
                </Typography>
              </Box>
            ))}
          </Stack>
          <OrderSummary totals={totals} />
        </Card>
      </Box>
    </div>
  );
}
