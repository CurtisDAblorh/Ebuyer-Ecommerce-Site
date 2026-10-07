import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS, PRODUCTS_BY_ID } from "@/lib/catalog";
import { ProductView } from "@/components/product/ProductView";

// Every product page is generated at build time for the static export.
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: PageProps<"/product/[id]">): Promise<Metadata> {
  const product = PRODUCTS_BY_ID.get(Number((await params).id));
  return product ? { title: product.title, description: product.description } : {};
}

export default async function ProductPage({ params }: PageProps<"/product/[id]">) {
  const product = PRODUCTS_BY_ID.get(Number((await params).id));
  if (!product) notFound();
  return <ProductView product={product} />;
}
