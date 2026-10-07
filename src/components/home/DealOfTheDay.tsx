"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LinearProgress from "@mui/material/LinearProgress";
import Rating from "@mui/material/Rating";
import { PRODUCTS, salePrice } from "@/lib/catalog";
import { formatPrice } from "@/lib/pricing";
import { useMounted } from "@/hooks/useMounted";
import { AddToCartButton } from "@/components/product/AddToCartButton";

const deal = [...PRODUCTS]
  .filter((p) => p.rating >= 4 && p.stock > 0)
  .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];

function untilMidnight(now: Date) {
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60];
}

export function DealOfTheDay() {
  const mounted = useMounted();
  const [now, setNow] = useState(() => new Date(0));
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const [h, m, s] = mounted && now.getTime() > 0 ? untilMidnight(now) : [0, 0, 0];
  const claimed = 62;

  return (
    <section className="container-page mt-20" aria-label="Deal of the day">
      <div className="grid overflow-hidden rounded-[2rem] bg-[#141414] text-white md:grid-cols-2">
        <div className="flex flex-col justify-center gap-5 p-8 sm:p-12">
          <p className="w-fit rounded-full bg-lime px-3 py-1 text-xs font-bold tracking-wider text-[#141414] uppercase">
            Deal of the day
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{deal.title}</h2>
          <div className="flex items-center gap-2 text-white/70">
            <Rating
              value={deal.rating}
              precision={0.1}
              readOnly
              size="small"
              sx={{ color: "#d7ff3e" }}
            />
            {deal.rating.toFixed(1)}
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold">{formatPrice(salePrice(deal))}</span>
            <span className="text-lg text-white/50 line-through">{formatPrice(deal.price)}</span>
            <span className="rounded-full bg-coral px-2.5 py-0.5 text-sm font-bold">
              -{Math.round(deal.discountPercentage)}%
            </span>
          </div>
          <div className="flex gap-3" role="timer" aria-label="Time left on this deal">
            {[
              [h, "hrs"],
              [m, "min"],
              [s, "sec"],
            ].map(([v, label]) => (
              <div
                key={label}
                className="min-w-[72px] rounded-2xl bg-white/10 px-3 py-2 text-center"
              >
                <div className="font-mono text-3xl font-bold tabular-nums">
                  {String(v).padStart(2, "0")}
                </div>
                <div className="text-xs text-white/60 uppercase">{label}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm text-white/70">
              <span>{claimed}% claimed</span>
              <span>{deal.stock} left</span>
            </div>
            <LinearProgress
              variant="determinate"
              value={claimed}
              sx={{
                height: 8,
                borderRadius: 99,
                bgcolor: "rgba(255,255,255,.12)",
                "& .MuiLinearProgress-bar": { bgcolor: "#d7ff3e" },
              }}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <AddToCartButton
              product={deal}
              imageRef={imgRef}
              size="large"
              sx={{ bgcolor: "#d7ff3e", color: "#141414", "&:hover": { bgcolor: "#c6f02b" } }}
            >
              Grab the deal
            </AddToCartButton>
            <Link
              href={`/product/${deal.id}/`}
              className="grid place-items-center rounded-full border border-white/30 px-6 font-semibold transition hover:bg-white/10"
            >
              Details
            </Link>
          </div>
        </div>
        <div className="relative grid min-h-[320px] place-items-center bg-gradient-to-br from-coral/30 to-lime/20 p-10">
          <div className="absolute size-[70%] rounded-full bg-white/10" />
          <img
            ref={imgRef}
            src={deal.thumbnail}
            alt={deal.title}
            className="relative max-h-[380px] w-auto animate-float object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
