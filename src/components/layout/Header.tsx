"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Menu from "@mui/icons-material/Menu";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import Search from "@mui/icons-material/Search";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { DEPARTMENTS } from "@/lib/catalog";
import { selectCartCount, useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCartOpen } from "@/store/uiSlice";
import { setFilters } from "@/store/filtersSlice";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/shop/", label: "Shop all" },
  ...DEPARTMENTS.slice(0, 4).map((d) => ({
    href: `/shop/?department=${d.id}`,
    label: d.label,
    department: d.id,
  })),
];

export function Header() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const count = useAppSelector(selectCartCount);
  const wishlistCount = useAppSelector((s) => s.shopper.wishlist.length);
  const pulse = useAppSelector((s) => s.ui.cartPulse);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 8 });

  const goDepartment = (department?: string) =>
    dispatch(setFilters(department ? { departments: [department] } : {}));

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        bgcolor: scrolled
          ? "rgba(var(--mui-palette-background-defaultChannel) / 0.8)"
          : "background.default",
        backdropFilter: scrolled ? "saturate(180%) blur(16px)" : "none",
        borderBottom: 1,
        borderColor: scrolled ? "divider" : "transparent",
        transition: "all .3s",
      }}
    >
      <Toolbar
        className="container-page"
        sx={{ gap: 1.5, minHeight: { xs: 64, md: 72 } }}
        disableGutters
      >
        <IconButton
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          sx={{ display: { md: "none" } }}
        >
          <Menu />
        </IconButton>
        <Link href="/" aria-label="Ebuyer home" className="mr-2">
          <Logo />
        </Link>
        <Box
          component="nav"
          aria-label="Main"
          sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}
        >
          {NAV.map((item) => (
            <Button
              key={item.href}
              component={Link}
              href={item.href}
              onClick={() => goDepartment("department" in item ? item.department : undefined)}
              color="inherit"
              sx={{ px: 1.5, fontWeight: 600, opacity: pathname.startsWith("/shop") ? 1 : 0.85 }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
        <Box sx={{ flex: 1, maxWidth: 420, mx: "auto", display: { xs: "none", sm: "block" } }}>
          <SearchBox />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
          <IconButton
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            sx={{ display: { sm: "none" } }}
          >
            <Search />
          </IconButton>
          <ThemeToggle />
          <Tooltip title="Orders">
            <IconButton
              component={Link}
              href="/orders/"
              aria-label="Orders"
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              <ReceiptLongOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Wishlist">
            <IconButton
              component={Link}
              href="/wishlist/"
              aria-label={`Wishlist, ${wishlistCount} items`}
            >
              <Badge badgeContent={wishlistCount} color="secondary">
                <FavoriteBorder />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Bag">
            <IconButton
              id="cart-button"
              aria-label={`Open bag, ${count} items`}
              onClick={() => dispatch(setCartOpen(true))}
            >
              {/* Re-keying on each add replays the CSS pop animation. */}
              <Badge
                key={pulse}
                badgeContent={count}
                color="secondary"
                data-testid="cart-count"
                className={pulse ? "animate-pop" : undefined}
              >
                <ShoppingBagOutlined />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Box sx={{ width: 300, p: 2 }} role="navigation" aria-label="Mobile">
          <Logo />
          <List sx={{ mt: 2 }}>
            {[
              { href: "/shop/", label: "Shop all" },
              ...DEPARTMENTS.map((d) => ({
                href: `/shop/?department=${d.id}`,
                label: d.label,
                department: d.id,
              })),
            ].map((item) => (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                onClick={() => {
                  goDepartment("department" in item ? item.department : undefined);
                  setMenuOpen(false);
                }}
                sx={{ borderRadius: 2 }}
              >
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                />
              </ListItemButton>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItemButton
              component={Link}
              href="/wishlist/"
              onClick={() => setMenuOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              <ListItemText primary="Wishlist" />
            </ListItemButton>
            <ListItemButton
              component={Link}
              href="/orders/"
              onClick={() => setMenuOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              <ListItemText primary="Orders" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Drawer anchor="top" open={searchOpen} onClose={() => setSearchOpen(false)}>
        <Box sx={{ p: 2 }}>
          <SearchBox autoFocus onDone={() => setSearchOpen(false)} />
        </Box>
      </Drawer>
    </AppBar>
  );
}
