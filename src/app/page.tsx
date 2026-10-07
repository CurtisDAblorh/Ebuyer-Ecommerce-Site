import Link from "next/link";
import { PRODUCTS, DEPARTMENTS } from "@/lib/catalog";
import { Hero } from "@/components/home/Hero";
import { DepartmentGrid } from "@/components/home/DepartmentGrid";
import { DealOfTheDay } from "@/components/home/DealOfTheDay";
import { BrandMarquee, Newsletter, Perks } from "@/components/home/Extras";
import { ProductRail } from "@/components/product/ProductRail";

const trending = [...PRODUCTS]
  .sort((a, b) => b.rating * b.reviews.length - a.rating * a.reviews.length)
  .slice(0, 12);
const tech = DEPARTMENTS.find((d) => d.id === "tech")!;
const techPicks = PRODUCTS.filter((p) => tech.categories.includes(p.category))
  .sort((a, b) => b.discountPercentage - a.discountPercentage)
  .slice(0, 12);

export default function HomePage() {
  return (
    <>
      <Hero />
      <DepartmentGrid />
      <div className="container-page">
        <ProductRail
          title="Trending now"
          products={trending}
          action={
            <Link
              href="/shop/"
              className="mr-2 hidden text-sm font-semibold hover:underline sm:inline"
            >
              Shop all
            </Link>
          }
        />
      </div>
      <DealOfTheDay />
      <div className="container-page">
        <ProductRail title="Tech on sale" products={techPicks} />
      </div>
      <BrandMarquee />
      <Perks />
      <Newsletter />
    </>
  );
}
