import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { StoreProvider, ThemeRegistry } from "@/components/Providers";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { QuickViewDialog } from "@/components/product/QuickViewDialog";
import { GlobalToast } from "@/components/layout/GlobalToast";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ variable: "--font-sans", subsets: ["latin"] });
const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Ebuyer — everything you want, beautifully delivered",
    template: "%s · Ebuyer",
  },
  description: "A modern storefront built with Next.js, MUI, Redux Toolkit and D3.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${serif.variable}`}>
      <body className="antialiased">
        <InitColorSchemeScript attribute="class" />
        <ThemeRegistry>
          <StoreProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[2000] focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:text-[#141414]"
            >
              Skip to content
            </a>
            <AnnouncementBar />
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <CartDrawer />
            <QuickViewDialog />
            <GlobalToast />
          </StoreProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
