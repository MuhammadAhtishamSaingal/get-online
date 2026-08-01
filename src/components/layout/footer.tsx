"use client";

import Link from "next/link";
import * as React from "react";
import { Cookie } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
        
        {/* Top Stay Connected Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-neutral-900">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-white">
            Stay Connected
          </div>

          {/* Square Newsletter form with highly visible placeholder */}
          <form 
            className="flex-1 max-w-2xl flex flex-col sm:flex-row gap-3" 
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for subscribing to GizmoGrid updates!");
            }}
          >
            <input
              type="email"
              required
              placeholder="Enter your email address"
              className="flex-1 bg-neutral-950 border border-neutral-800 text-sm px-4 py-2.5 text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 transition-colors rounded-none"
            />
            <button
              type="submit"
              className="bg-white hover:bg-neutral-100 text-black text-xs font-bold uppercase tracking-widest px-8 py-3 transition-colors rounded-none"
            >
              Subscribe
            </button>
          </form>

          {/* Social Links (Custom SVG Vectors) */}
          <div className="flex items-center gap-5">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* X */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="h-[17px] w-[17px] fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <svg className="h-[18px] w-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.525 3.545 12 3.545 12 3.545s-7.525 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.025 0 12 0 12s0 3.975.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.475 20.455 12 20.455 12 20.455s7.525 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
              aria-label="TikTok"
            >
              <svg className="h-[18px] w-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.43-.43-.62-.67-.02 3.28-.01 6.56-.02 9.84-.06 2.03-.74 4.07-2.22 5.48-1.52 1.48-3.76 2.15-5.85 1.95-2.24-.19-4.41-1.44-5.39-3.48-1.12-2.24-.87-5.11.71-7.1 1.25-1.59 3.26-2.45 5.28-2.43.02 1.34.01 2.68.02 4.02-1.18-.08-2.43.43-3.04 1.47-.63 1.05-.43 2.53.51 3.39.95.89 2.47.93 3.44.09.68-.6.94-1.54.93-2.43.02-5.46.01-10.92.02-16.38z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Dynamic content restored exactly from the original footer specs */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
          
          {/* Column 1: Brand Info Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-custom-sm bg-brand-primary flex items-center justify-center text-white text-xs font-black">
                G
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                GizmoGrid
              </span>
            </div>
            <p className="text-[13px] text-neutral-400 max-w-sm leading-relaxed">
              Engineered for high-performance. We provide premium tech accessories designed for professionals and tech enthusiasts.
            </p>
          </div>

          {/* Column 2: SHOP Navigation Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-6">
              Shop
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/shop" className="text-[13px] text-neutral-400 hover:text-white transition-colors duration-300">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=new" className="text-[13px] text-neutral-400 hover:text-white transition-colors duration-300">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=best" className="text-[13px] text-neutral-400 hover:text-white transition-colors duration-300">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=sale" className="text-[13px] text-neutral-400 hover:text-white transition-colors duration-300">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: SUPPORT Navigation Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-6">
              Support
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/support" className="text-[13px] text-neutral-400 hover:text-white transition-colors duration-300">
                  Product Support
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="text-[13px] text-neutral-400 hover:text-white transition-colors duration-300">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="text-[13px] text-neutral-400 hover:text-white transition-colors duration-300">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[13px] text-neutral-400 hover:text-white transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Cookie Toggle button */}
        <div className="mt-16 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 order-2 sm:order-1 text-center sm:text-left">
            <p className="text-[11px] text-neutral-500 tracking-wider">
              &copy; {new Date().getFullYear()} GizmoGrid. High-performance hardware engineered for excellence.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/policies/privacy" className="text-[11px] text-neutral-500 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-neutral-700 hidden sm:inline">|</span>
              <Link href="/policies/terms" className="text-[11px] text-neutral-500 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Premium Cookie Toggle button */}
          <div 
            onClick={() => alert("Cookie settings panel simulation activated.")}
            className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-transform order-1 sm:order-2"
            aria-label="Manage cookie settings"
          >
            <Cookie className="h-5 w-5 text-black" />
          </div>
        </div>

      </div>
    </footer>
  );
}
