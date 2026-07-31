"use client";

import Link from "next/link";
import * as React from "react";
import { Instagram, Twitter, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const [openSection, setOpenSection] = React.useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          
          {/* Brand Info & Newsletter */}
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-custom-sm bg-brand-primary flex items-center justify-center text-white text-xs font-black">
                G
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-neutral-900">
                GizmoGrid
              </span>
            </div>
            <p className="text-sm text-neutral-500 max-w-xs">
              Engineered for high-performance. We provide premium tech accessories designed for professionals and tech enthusiasts.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-5">
              <a
                href="https://instagram.com"
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/1234567890"
                className="text-neutral-400 hover:text-green-600 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Shop Section */}
              <div className="border-b border-neutral-200 md:border-b-0 pb-4 md:pb-0">
                <button
                  onClick={() => toggleSection("shop")}
                  className="flex w-full items-center justify-between text-left font-display text-xs font-semibold uppercase tracking-wider text-neutral-400 md:cursor-default"
                >
                  <span>Shop</span>
                  <ChevronDown className={`h-4 w-4 md:hidden transition-transform duration-200 ${openSection === "shop" ? "rotate-180" : ""}`} />
                </button>
                <ul
                  role="list"
                  className={`mt-4 space-y-3 md:block ${openSection === "shop" ? "block animate-slide-up" : "hidden"}`}
                >
                  <li>
                    <Link
                      href="/shop"
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      Shop All
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shop?filter=new"
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      New Arrivals
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shop?filter=best"
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      Best Sellers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shop?filter=sale"
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      Sale
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support Section */}
              <div className="border-b border-neutral-200 md:border-b-0 pb-4 md:pb-0">
                <button
                  onClick={() => toggleSection("support")}
                  className="flex w-full items-center justify-between text-left font-display text-xs font-semibold uppercase tracking-wider text-neutral-400 md:cursor-default"
                >
                  <span>Support</span>
                  <ChevronDown className={`h-4 w-4 md:hidden transition-transform duration-200 ${openSection === "support" ? "rotate-180" : ""}`} />
                </button>
                <ul
                  role="list"
                  className={`mt-4 space-y-3 md:block ${openSection === "support" ? "block animate-slide-up" : "hidden"}`}
                >
                  <li>
                    <Link
                      href="/support"
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      Product Support
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/policies/returns"
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      Returns
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/policies/shipping"
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      Shipping Info
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="space-y-4">
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Join The Grid
              </h3>
              <p className="text-sm text-neutral-500">
                Get early access to drops and exclusive performance optimization guides.
              </p>
              <form className="mt-4 sm:flex sm:max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  name="email-address"
                  id="email-address"
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-custom-md border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
                <div className="mt-3 rounded-custom-md sm:mt-0 sm:flex-shrink-0">
                  <Button type="submit" variant="primary" className="w-full">
                    Subscribe
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 border-t border-neutral-200 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-neutral-400 order-2 md:order-1">
            &copy; {new Date().getFullYear()} GizmoGrid. High-performance hardware engineered for excellence.
          </p>
          <div className="flex space-x-6 order-1 md:order-2">
            <Link
              href="/policies/privacy"
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/policies/terms"
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
