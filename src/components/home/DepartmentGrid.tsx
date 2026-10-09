"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import ArrowOutward from "@mui/icons-material/ArrowOutward";
import { DEPARTMENTS, PRODUCTS } from "@/lib/catalog";
import { useAppDispatch } from "@/store/hooks";
import { setFilters } from "@/store/filtersSlice";

// Bento layout: the first tile spans two rows on large screens.
const SPANS = ["lg:row-span-2", "", "", "lg:col-span-2", "", ""];

export function DepartmentGrid() {
  const dispatch = useAppDispatch();
  return (
    <section className="container-page mt-20" aria-label="Shop by department">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold tracking-tight">
          Shop by <span className="font-accent">department</span>
        </h2>
        <Link href="/shop/" className="text-sm font-semibold underline-offset-4 hover:underline">
          View all
        </Link>
      </div>
      <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {DEPARTMENTS.map((d, i) => {
          const count = PRODUCTS.filter((p) => d.categories.includes(p.category)).length;
          return (
            <Link
              key={d.id}
              href={`/shop/?department=${d.id}`}
              onClick={() => dispatch(setFilters({ departments: [d.id] }))}
              data-testid={`department-${d.id}`}
              className={`group relative overflow-hidden rounded-3xl p-5 ${SPANS[i]}`}
              style={{ background: `linear-gradient(160deg, ${d.accent}26, ${d.accent}0d)` }}
            >
              <div className="relative z-10">
                <h3 className="text-lg font-extrabold sm:text-xl">{d.label}</h3>
                <p className="text-sm text-muted">{count} products</p>
              </div>
              <img
                src={d.image}
                alt=""
                loading="lazy"
                className="absolute right-[-6%] bottom-[-6%] h-[78%] w-auto object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
              />
              <span className="absolute bottom-4 left-5 z-10 grid size-10 place-items-center rounded-full bg-[#141414] text-white transition-transform group-hover:rotate-45 dark:bg-white dark:text-[#141414]">
                <ArrowOutward fontSize="small" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
