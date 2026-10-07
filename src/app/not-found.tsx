import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="font-accent text-8xl text-coral">404</p>
      <h1 className="mt-2 text-3xl font-extrabold">This page is out of stock</h1>
      <p className="mt-2 text-muted">We couldn&apos;t find what you were looking for.</p>
      <Link
        href="/shop/"
        className="mt-8 inline-block rounded-full bg-[#141414] px-6 py-3 font-semibold text-white dark:bg-white dark:text-[#141414]"
      >
        Back to the shop
      </Link>
    </div>
  );
}
