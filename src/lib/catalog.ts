import raw from "@/data/products.json";

export type Review = { rating: number; comment: string; date: string; reviewerName: string };

export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string | null;
  tags: string[];
  sku: string;
  weight: number;
  warrantyInformation: string;
  shippingInformation: string;
  returnPolicy: string;
  thumbnail: string;
  images: string[];
  reviews: Review[];
};

/** Snapshot of the DummyJSON catalog (https://dummyjson.com), trimmed to the fields we use. */
export const PRODUCTS = raw as Product[];

export const PRODUCTS_BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));

export type Department = {
  id: string;
  label: string;
  categories: string[];
  image: string;
  accent: string;
};

export const DEPARTMENTS: Department[] = [
  {
    id: "tech",
    label: "Tech",
    categories: ["laptops", "smartphones", "tablets", "mobile-accessories"],
    image: "",
    accent: "#6366f1",
  },
  {
    id: "fashion",
    label: "Fashion",
    categories: [
      "mens-shirts",
      "mens-shoes",
      "tops",
      "womens-dresses",
      "womens-shoes",
      "womens-bags",
      "sunglasses",
    ],
    image: "",
    accent: "#ec4899",
  },
  {
    id: "watches",
    label: "Watches & Jewellery",
    categories: ["mens-watches", "womens-watches", "womens-jewellery"],
    image: "",
    accent: "#f59e0b",
  },
  {
    id: "beauty",
    label: "Beauty",
    categories: ["beauty", "fragrances", "skin-care"],
    image: "",
    accent: "#f43f5e",
  },
  {
    id: "home",
    label: "Home & Kitchen",
    categories: ["furniture", "home-decoration", "kitchen-accessories"],
    image: "",
    accent: "#10b981",
  },
  {
    id: "sports",
    label: "Sports",
    categories: ["sports-accessories"],
    image: "",
    accent: "#0ea5e9",
  },
].map((d) => ({
  ...d,
  // Use the best-rated product in the department as its tile image.
  image:
    [...PRODUCTS]
      .filter((p) => d.categories.includes(p.category))
      .sort((a, b) => b.rating - a.rating)[0]?.thumbnail ?? "",
}));

export const departmentOf = (category: string) =>
  DEPARTMENTS.find((d) => d.categories.includes(category));

export const categoryLabel = (category: string) =>
  category
    .split("-")
    .map((w) =>
      w === "mens" ? "Men's" : w === "womens" ? "Women's" : w[0].toUpperCase() + w.slice(1),
    )
    .join(" ");

export const salePrice = (p: Pick<Product, "price" | "discountPercentage">) =>
  Math.round(p.price * (1 - p.discountPercentage / 100) * 100) / 100;

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "discount";

export type Filters = {
  query: string;
  departments: string[];
  categories: string[];
  price: [number, number] | null;
  minRating: number;
  inStockOnly: boolean;
  sort: SortKey;
};

export const DEFAULT_FILTERS: Filters = {
  query: "",
  departments: [],
  categories: [],
  price: null,
  minRating: 0,
  inStockOnly: false,
  sort: "featured",
};

/** Filters that narrow by everything except price, so the price histogram shows the full spread. */
export function filterWithoutPrice(products: Product[], f: Filters) {
  const q = f.query.trim().toLowerCase();
  const cats = new Set([
    ...f.categories,
    ...f.departments.flatMap((d) => DEPARTMENTS.find((x) => x.id === d)?.categories ?? []),
  ]);
  return products.filter(
    (p) =>
      (!q ||
        [p.title, p.brand ?? "", p.category, ...p.tags].some((s) => s.toLowerCase().includes(q))) &&
      (!cats.size || cats.has(p.category)) &&
      p.rating >= f.minRating &&
      (!f.inStockOnly || p.stock > 0),
  );
}

export function applyFilters(products: Product[], f: Filters) {
  const list = filterWithoutPrice(products, f).filter((p) => {
    if (!f.price) return true;
    const s = salePrice(p);
    return s >= f.price[0] && s <= f.price[1];
  });
  const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
    featured: (a, b) =>
      b.rating * Math.log10(b.reviews.length + 10) - a.rating * Math.log10(a.reviews.length + 10),
    "price-asc": (a, b) => salePrice(a) - salePrice(b),
    "price-desc": (a, b) => salePrice(b) - salePrice(a),
    rating: (a, b) => b.rating - a.rating,
    discount: (a, b) => b.discountPercentage - a.discountPercentage,
  };
  return [...list].sort(sorters[f.sort]);
}

export function relatedProducts(product: Product, limit = 8) {
  const dept = departmentOf(product.category);
  return PRODUCTS.filter(
    (p) =>
      p.id !== product.id &&
      (p.category === product.category || dept?.categories.includes(p.category)),
  )
    .sort(
      (a, b) =>
        Number(b.category === product.category) - Number(a.category === product.category) ||
        b.rating - a.rating,
    )
    .slice(0, limit);
}
