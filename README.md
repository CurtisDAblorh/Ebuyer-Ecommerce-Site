# Ebuyer

A modern storefront: browse 150+ products, filter with an interactive price histogram,
check price history before you buy, and run through a complete checkout with live
card validation. A spending dashboard tracks your orders.

**Live demo:** https://curtisdablorh.github.io/Ebuyer-Ecommerce-Site/ ·
**Storybook:** https://curtisdablorh.github.io/Ebuyer-Ecommerce-Site/storybook/

> This is a rebuild of the original React + Vite + CommerceJS version of Ebuyer, which is
> still available in this repository's history.

## Features

- **Shop** – department and category filters, rating and stock filters, sorting, pagination and active-filter chips. Filter state lives in Redux and the catalog is served through RTK Query.
- **D3 price brush** – drag across a log-scale histogram of prices to set a price range.
- **Product pages** – zoom-on-hover gallery, 90-day price-history chart with crosshair, a clickable rating breakdown that filters reviews, and related and recently viewed rails. All 157 product pages are statically generated.
- **Bag** – slide-out drawer with quantity steppers, inline undo on remove, a free-delivery progress bar, promo codes (`EBUYER10`, `WELCOME20`, `FREESHIP`) and a fly-to-bag animation.
- **Checkout** – four-step MUI stepper with react-hook-form + zod validation (UK postcodes, Luhn card check, expiry), a live 3D card preview that flips for the CVC, delivery options and a confetti confirmation.
- **Orders & insights** – D3 stacked monthly spend and department donut charts plus order history.
- **Everything else** – instant search with autocomplete, quick-view dialog, wishlist, deal-of-the-day countdown, light and dark themes, persistence to `localStorage` and a responsive layout.

## Tech stack

| Area      | Tools                                                                                        |
| --------- | -------------------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, static export), React 19, TypeScript                                 |
| UI        | [MUI v9](https://mui.com) with CSS-variable colour schemes, Tailwind CSS v4 (via CSS layers) |
| State     | Redux Toolkit, RTK Query, listener middleware for persistence                                |
| Forms     | react-hook-form, zod                                                                         |
| Data viz  | D3 v7                                                                                        |
| Testing   | Jest + React Testing Library (unit), Playwright (e2e, desktop and mobile)                    |
| Tooling   | Storybook 10, ESLint, Prettier, Husky + lint-staged                                          |
| CI/CD     | GitHub Actions: lint, typecheck, test, e2e, then deploy to GitHub Pages                      |

Product data is a snapshot of [DummyJSON](https://dummyjson.com) in `src/data/products.json`.
Price history and sample orders are generated deterministically for the demo. No payments are
taken; use the test card `4242 4242 4242 4242`.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command                              | Description                                   |
| ------------------------------------ | --------------------------------------------- |
| `npm run build`                      | Static export to `out/`                       |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript                           |
| `npm test` / `npm run test:coverage` | Jest unit tests                               |
| `npm run e2e`                        | Playwright tests against the production build |
| `npm run storybook`                  | Component library on port 6006                |

Husky runs lint-staged on commit and typecheck plus unit tests on push.

## Project structure

```
src/
  app/            routes: home, shop, product/[id], checkout, wishlist, orders
  components/
    cart/         drawer, line items, order summary, free-delivery bar
    charts/       D3 histogram brush, price history, ratings, spending
    checkout/     stepper flow and card preview
    home/         hero, departments, deal of the day, marquee, newsletter
    layout/       header, search, footer, toasts
    product/      card, gallery, quick view, rails
    shop/         filters panel and shop view
  lib/            catalog, pricing, checkout validation, insights, spending
  store/          Redux slices, RTK Query catalog API, persistence
  theme/          MUI theme
e2e/              Playwright specs
```
