"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Heart, User, Menu, ArrowRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { useCartStore } from "@/lib/cart-store";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import Image from "next/image";

// Simulated search suggestions database
const SAMPLE_SUGGESTIONS = [
  { name: "BoltCharge 65W GaN Charger", category: "Chargers", price: "$45.00" },
  { name: "ProLink 2m Braided Cable", category: "Cables", price: "$15.00" },
  { name: "SonicWave Buds Pro", category: "Audio", price: "$249.00" },
  { name: "TactileAir Slim Mechanical Keyboard", category: "Keyboards", price: "$189.00" },
  { name: "Horizon Watch Series X", category: "Wearables", price: "$329.00" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  
  // Cart Store Hooks
  const { items, removeItem, updateQuantity, getCartCount, getCartTotal } = useCartStore();
  const [isMounted, setIsMounted] = React.useState(false);

  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // Avoid hydration mismatch
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Search state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<typeof SAMPLE_SUGGESTIONS>([]);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  // Monitor scroll for header styling
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounced search suggestions simulation
  React.useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
      } else {
        const filtered = SAMPLE_SUGGESTIONS.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSuggestions(filtered);
      }
    }, 200); // 200ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const navLinks = [
    { name: "Computer", href: "/shop?category=computer" },
    { name: "Audio", href: "/shop?category=audio" },
    { name: "Gaming", href: "/shop?category=gaming" },
    { name: "Wearables", href: "/shop?category=wearables" },
    { name: "Deals", href: "/shop?filter=deals" },
  ];

  const cartCount = isMounted ? getCartCount() : 0;
  const cartTotal = isMounted ? getCartTotal() : 0;

  const isTransparentActive = isHomepage && !isScrolled;

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 z-40 mx-auto w-[95%] max-w-7xl rounded-custom-xl transition-all duration-300 border",
          isTransparentActive
            ? "bg-transparent border-transparent shadow-none top-8"
            : isScrolled
            ? "glassmorphism border-neutral-200/50 shadow-md translate-y-[-24px] top-6"
            : "bg-white/80 backdrop-blur-sm border-neutral-100 top-8"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile hamburger menu */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className={cn(
                "rounded-custom-md p-2 transition-colors duration-300",
                isTransparentActive
                  ? "text-white hover:bg-white/10"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className={cn(
                "font-display text-xl font-bold tracking-tight flex items-center gap-1.5 focus-visible:outline-none transition-colors duration-300",
                isTransparentActive ? "text-white" : "text-neutral-900"
              )}
            >
              <span className="h-6 w-6 rounded-custom-sm bg-brand-primary flex items-center justify-center text-white text-xs font-black">
                G
              </span>
              <span>GizmoGrid</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex lg:gap-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:underline",
                  isTransparentActive
                    ? "text-white/80 hover:text-white"
                    : "text-neutral-600 hover:text-brand-primary"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Search bar & Icons */}
          <div className="flex items-center gap-4">
            {/* Search Input (Desktop) */}
            <div className="relative hidden md:block w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className={cn("h-4 w-4 transition-colors duration-300", isTransparentActive ? "text-white/60" : "text-neutral-400")} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                placeholder="Search premium gear..."
                className={cn(
                  "w-full h-9 rounded-full border pl-9 pr-4 text-xs focus:outline-none transition-all duration-300",
                  isTransparentActive
                    ? "border-white/25 bg-white/10 text-white placeholder:text-white/60 focus:border-white focus:ring-1 focus:ring-white focus:bg-white/15"
                    : "border-neutral-200/80 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary"
                )}
              />

              {/* Suggestions Dropdown */}
              {isSearchFocused && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 mt-1.5 w-72 rounded-custom-lg border border-neutral-200 bg-white p-2 shadow-lg transition-opacity duration-200 animate-fade-in">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Suggestions
                  </div>
                  {suggestions.length > 0 ? (
                    <div className="mt-1 flex flex-col gap-1">
                      {suggestions.map((item) => (
                        <button
                          key={item.name}
                          className="flex items-center justify-between rounded-custom-md px-2 py-1.5 text-left text-xs hover:bg-neutral-50 transition-colors w-full"
                          onMouseDown={() => {
                            setSearchQuery(item.name);
                          }}
                        >
                          <div>
                            <div className="font-medium text-neutral-900">{item.name}</div>
                            <div className="text-[10px] text-neutral-400">{item.category}</div>
                          </div>
                          <div className="font-semibold text-brand-primary">{item.price}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-2 py-3 text-center text-xs text-neutral-500">
                      No matching products found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Favorite / Account Icons (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/favorites"
                className={cn(
                  "rounded-custom-md p-2 transition-colors duration-300",
                  isTransparentActive
                    ? "text-white/80 hover:bg-white/10 hover:text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
                aria-label="Favorites"
              >
                <Heart className="h-5 w-5" />
              </Link>
              <Link
                href="/admin/login"
                className={cn(
                  "rounded-custom-md p-2 transition-colors duration-300",
                  isTransparentActive
                    ? "text-white/80 hover:bg-white/10 hover:text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
                aria-label="Account / Admin Login"
              >
                <User className="h-5 w-5" />
              </Link>
            </div>

            {/* Cart Icon Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={cn(
                "relative rounded-custom-md p-2 transition-colors duration-300 focus-visible:outline-none",
                isTransparentActive
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white leading-none scale-100 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <Drawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title={`Shopping Cart (${cartCount})`}
        position="right"
      >
        <div className="flex h-full flex-col justify-between">
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {isMounted && items.length > 0 ? (
              items.map((item) => (
                <div key={`${item.productId}-${item.variantName || ""}`} className="flex items-center gap-4 border-b border-neutral-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-custom-md border border-neutral-200 bg-neutral-50 flex items-center justify-center">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-neutral-400">Media</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-neutral-900 truncate">
                      {item.name}
                    </h4>
                    {item.variantName && (
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Style: {item.variantName}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <QuantityStepper
                        value={item.quantity}
                        max={item.maxStock}
                        onChange={(val) => updateQuantity(item.productId, val, item.variantName)}
                        className="h-7 scale-90 -translate-x-2"
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-neutral-950">${(item.price * item.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => removeItem(item.productId, item.variantName)}
                          className="text-neutral-400 hover:text-red-600 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-custom-xl">
                Your shopping cart is empty.
              </div>
            )}
          </div>

          <div className="border-t border-neutral-200 pt-4 space-y-4">
            <div className="flex justify-between text-base font-semibold text-neutral-900">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-neutral-400">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => setIsCartOpen(false)}
              >
                Keep Shopping
              </Button>
              {items.length > 0 ? (
                <Link href="/checkout" className="w-1/2 block">
                  <Button variant="primary" className="w-full">
                    Checkout
                  </Button>
                </Link>
              ) : (
                <Button variant="primary" className="w-1/2" disabled>
                  Checkout
                </Button>
              )}
            </div>
          </div>
        </div>
      </Drawer>

      {/* Mobile Nav Drawer */}
      <Drawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        title="Menu"
        position="left"
      >
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-6">
            {/* Search Input for Mobile */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Search accessories..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value;
                    window.location.href = `/shop?search=${encodeURIComponent(val)}`;
                    setIsMobileNavOpen(false);
                  }
                }}
                className="w-full h-11 rounded-custom-md border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center justify-between text-base font-semibold text-neutral-800 hover:text-brand-primary py-2 border-b border-neutral-100"
                >
                  {link.name}
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-neutral-100 pt-6 space-y-3">
            <Link href="/admin/login" onClick={() => setIsMobileNavOpen(false)}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <User className="h-4 w-4" /> Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </Drawer>
    </>
  );
}
