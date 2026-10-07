import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopView } from "@/components/shop/ShopView";

export const metadata: Metadata = { title: "Shop" };

// ShopView reads search params, which need a Suspense boundary in a static export.
export default function ShopPage() {
  return (
    <Suspense>
      <ShopView />
    </Suspense>
  );
}
