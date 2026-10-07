"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { PRODUCTS } from "@/lib/catalog";

const FLOATERS = [
  { id: 79, className: "left-[4%] top-[6%] w-[38%]", r: "-8deg", delay: "0s" },
  { id: 121, className: "right-[2%] top-[0%] w-[34%]", r: "6deg", delay: "-2s" },
  { id: 6, className: "left-[22%] bottom-[2%] w-[36%]", r: "4deg", delay: "-4s" },
  { id: 98, className: "right-[6%] bottom-[12%] w-[28%]", r: "-5deg", delay: "-1s" },
];

export function Hero() {
  const items = FLOATERS.map((f) => ({
    ...f,
    product: PRODUCTS.find((p) => p.id === f.id) ?? PRODUCTS[f.id % PRODUCTS.length],
  }));

  return (
    <div className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 -z-10 size-[40rem] rounded-full bg-lime/40 blur-[120px] dark:bg-lime/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -left-48 -z-10 size-[34rem] rounded-full bg-coral/20 blur-[120px]"
      />
      <section
        className="container-page grid items-center gap-10 pt-10 pb-6 md:grid-cols-[1.1fr_1fr] md:pt-16"
        aria-label="Welcome"
      >
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold">
            <span className="size-2 animate-pulse rounded-full bg-coral" /> New season, new drops
          </p>
          <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] font-extrabold tracking-[-0.04em]">
            Everything you want, <span className="font-accent text-coral">beautifully</span>{" "}
            delivered.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted">
            Tech, fashion, beauty and home essentials from brands you love. Free delivery over £75
            and 30-day returns.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              component={Link}
              href="/shop/"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{ py: 1.5, px: 3.5 }}
            >
              Shop the collection
            </Button>
            <Button
              component={Link}
              href="/shop/?department=tech"
              variant="outlined"
              size="large"
              sx={{ py: 1.5, px: 3.5 }}
            >
              Explore tech
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["#6366f1", "#ec4899", "#f59e0b", "#10b981"].map((c, i) => (
                <span
                  key={c}
                  className="grid size-10 place-items-center rounded-full border-2 border-canvas text-sm font-bold text-white"
                  style={{ background: c }}
                >
                  {"AJMS"[i]}
                </span>
              ))}
            </div>
            <div>
              <Rating value={4.8} precision={0.1} readOnly size="small" />
              <p className="text-sm text-muted">Loved by 12,000+ shoppers</p>
            </div>
          </div>
        </div>

        <div className="relative aspect-square w-full max-w-xl justify-self-center" aria-hidden>
          <div className="absolute inset-[12%] rounded-full border border-dashed border-line" />
          <div className="absolute inset-[26%] rounded-full bg-lime" />
          {items.map(({ product, className, r, delay }) => (
            <Link
              key={product.id}
              href={`/product/${product.id}/`}
              tabIndex={-1}
              className={`absolute animate-float rounded-3xl bg-surface p-3 shadow-[0_30px_60px_-30px_rgba(0,0,0,.5)] transition-transform hover:!scale-105 ${className}`}
              style={{ "--r": r, animationDelay: delay } as React.CSSProperties}
            >
              <img src={product.thumbnail} alt="" className="aspect-square w-full object-contain" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
