"use client";

import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import AutorenewOutlined from "@mui/icons-material/AutorenewOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import SupportAgentOutlined from "@mui/icons-material/SupportAgentOutlined";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { PRODUCTS } from "@/lib/catalog";

const brands = [...new Set(PRODUCTS.map((p) => p.brand).filter(Boolean))].slice(0, 24) as string[];

export function BrandMarquee() {
  return (
    <section
      className="mt-20 overflow-hidden border-y border-line py-6"
      aria-label="Featured brands"
    >
      <div className="flex w-max animate-marquee gap-14 hover:[animation-play-state:paused]">
        {[...brands, ...brands].map((b, i) => (
          <span
            key={i}
            aria-hidden={i >= brands.length}
            className="text-2xl font-extrabold tracking-tight whitespace-nowrap text-muted opacity-70"
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

const PERKS = [
  { icon: LocalShippingOutlined, title: "Free delivery", text: "On every order over £75" },
  { icon: AutorenewOutlined, title: "30-day returns", text: "Changed your mind? No problem" },
  { icon: LockOutlined, title: "Secure checkout", text: "Encrypted, PCI-ready flow" },
  { icon: SupportAgentOutlined, title: "Real support", text: "Humans, 7 days a week" },
];

export function Perks() {
  return (
    <section
      className="container-page mt-20 grid grid-cols-2 gap-4 lg:grid-cols-4"
      aria-label="Why shop with us"
    >
      {PERKS.map(({ icon: Icon, title, text }) => (
        <div
          key={title}
          className="rounded-3xl border border-line bg-surface p-6 transition hover:-translate-y-1"
        >
          <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-lime text-[#141414]">
            <Icon />
          </span>
          <h3 className="font-bold">{title}</h3>
          <p className="text-sm text-muted">{text}</p>
        </div>
      ))}
    </section>
  );
}

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="container-page mt-20" aria-label="Newsletter">
      <div className="relative overflow-hidden rounded-[2rem] bg-lime px-6 py-14 text-center text-[#141414] sm:px-12">
        <div
          aria-hidden
          className="absolute -top-20 -left-20 size-64 rounded-full bg-white/40 blur-2xl"
        />
        <h2 className="relative text-[clamp(1.75rem,4vw,3rem)] font-extrabold tracking-tight">
          Get <span className="font-accent">10% off</span> your first order
        </h2>
        <p className="relative mx-auto mt-2 max-w-md">
          Join the list for early access to drops and member-only deals.
        </p>
        {done ? (
          <p
            className="relative mt-8 flex items-center justify-center gap-2 text-lg font-bold"
            role="status"
          >
            <CheckCircle /> You&apos;re in! Use code EBUYER10 at checkout.
          </p>
        ) : (
          <form
            className="relative mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:items-start"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address");
              setDone(true);
            }}
          >
            <TextField
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              type="email"
              placeholder="you@example.com"
              aria-label="Email address"
              error={Boolean(error)}
              helperText={error}
              slotProps={{
                input: { sx: { bgcolor: "#fff", borderRadius: 999, color: "#141414" } },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "#141414",
                color: "#fff",
                height: 40,
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: "#000" },
              }}
            >
              Sign me up
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
