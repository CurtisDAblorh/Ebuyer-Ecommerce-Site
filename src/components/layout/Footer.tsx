import Link from "next/link";
import { DEPARTMENTS } from "@/lib/catalog";
import { Logo } from "./Logo";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted">
            A portfolio storefront built with Next.js, MUI, Redux Toolkit and D3. Product data from
            DummyJSON. No real orders are placed.
          </p>
        </div>
        <nav aria-label="Departments">
          <h2 className="mb-3 text-sm font-bold">Shop</h2>
          <ul className="space-y-2 text-sm text-muted">
            {DEPARTMENTS.map((d) => (
              <li key={d.id}>
                <Link href={`/shop/?department=${d.id}`} className="hover:text-ink">
                  {d.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Account">
          <h2 className="mb-3 text-sm font-bold">Your account</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href="/orders/" className="hover:text-ink">
                Orders & insights
              </Link>
            </li>
            <li>
              <Link href="/wishlist/" className="hover:text-ink">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/checkout/" className="hover:text-ink">
                Checkout
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Project">
          <h2 className="mb-3 text-sm font-bold">Project</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <a href={`${base}/storybook/`} className="hover:text-ink">
                Component library (Storybook)
              </a>
            </li>
            <li>
              <a
                href="https://github.com/CurtisDAblorh/Ebuyer-Ecommerce-Site"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink"
              >
                Source on GitHub
              </a>
            </li>
            <li>
              <a
                href="https://curtisdablorh.github.io/Curtis_3D_Port_folio/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink"
              >
                Curtis Ablorh · Portfolio
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <p className="container-page pb-10 text-xs text-muted">
        © {new Date().getFullYear()} Ebuyer demo store.
      </p>
    </footer>
  );
}
