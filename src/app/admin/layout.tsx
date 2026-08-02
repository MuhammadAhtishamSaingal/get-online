"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  ShoppingCart,
  Sliders,
  LogOut,
  Menu,
  X,
  User,
  ShieldAlert,
  MessageSquare
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { showToast } = useToast();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  // Exclude auth check from the login screen itself so we don't end up in redirect loops
  const isLoginPage = pathname === "/admin/login";

  React.useEffect(() => {
    if (isLoginPage) return;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth");
        const data = await res.json();
        if (!data.authenticated) {
          window.location.href = "/admin/login";
        } else {
          setIsAdmin(true);
        }
      } catch {
        window.location.href = "/admin/login";
      }
    }
    checkAuth();
  }, [pathname, isLoginPage]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth", { method: "DELETE" });
      if (res.ok) {
        showToast("Signed out successfully.", "info");
        window.location.href = "/admin/login";
      } else {
        showToast("Logout failed.", "error");
      }
    } catch {
      showToast("Connection error during logout.", "error");
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-50 px-4">
        <ShieldAlert className="h-10 w-10 text-neutral-400 animate-pulse mb-3" />
        <h3 className="text-sm font-bold text-neutral-800">Verifying administrative credentials...</h3>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Store Settings", href: "/admin/settings", icon: Sliders },
  ];

  return (
    <div className="min-h-screen w-full flex bg-neutral-50 text-neutral-900 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 bg-neutral-900 text-white border-r border-neutral-800">
        {/* Sidebar Brand Header */}
        <div className="h-16 px-6 border-b border-neutral-800 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 focus-visible:outline-none">
            <Image
              src="/images/logo-light-text.png"
              alt="Get Online Logo"
              width={164}
              height={119}
              className="h-9 w-auto object-contain"
            />
            <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wide bg-brand-primary/10 px-1.5 py-0.5 rounded-custom-md border border-brand-primary/20">Admin</span>
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 h-10 text-xs font-semibold rounded-custom-lg transition-all ${
                  isActive
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/10"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Admin Profile and Logout */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/40">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-none">Admin User</h4>
              <p className="text-[10px] text-neutral-500 font-medium mt-0.5">Console Operator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 h-9 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-custom-lg transition-all focus:outline-none"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar Navigation */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-neutral-900/60 backdrop-blur-sm">
          <div className="relative w-64 bg-neutral-900 text-white flex flex-col h-full animate-[slide-in-left_0.25s_cubic-bezier(0.16,1,0.3,1)]">
            {/* Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-custom-md focus:outline-none"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Logo */}
             <div className="h-16 px-6 border-b border-neutral-800 flex items-center">
              <Image
                src="/images/logo-light-text.png"
                alt="Get Online Logo"
                width={164}
                height={119}
                className="h-9 w-auto object-contain"
              />
              <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wide bg-brand-primary/10 px-1.5 py-0.5 rounded-custom-md border border-brand-primary/20 ml-2">Admin</span>
            </div>

            {/* Links */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 h-10 text-xs font-semibold rounded-custom-lg transition-all ${
                      isActive
                        ? "bg-brand-primary text-white"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-neutral-800">
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-4 h-9 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-custom-lg transition-all focus:outline-none"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile Header Bar */}
        <header className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-4 sm:px-6 lg:px-8 lg:border-none shadow-sm lg:shadow-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-custom-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-bold text-neutral-800 tracking-tight block lg:hidden">
              Get Online Admin Panel
            </h2>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center justify-center px-3.5 h-8 border border-neutral-200 rounded-custom-lg text-xs font-bold text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
            >
              Visit Storefront
            </Link>
            
            <div className="h-8 w-8 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-500 flex items-center justify-center font-bold text-xs" title="Profile">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
