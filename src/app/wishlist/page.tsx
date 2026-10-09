import type { Metadata } from "next";
import { WishlistView } from "@/components/orders/WishlistView";

export const metadata: Metadata = { title: "Wishlist" };

export default function Page() {
  return <WishlistView />;
}
