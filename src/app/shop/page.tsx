import * as React from "react";
import { DbService } from "@/lib/db-service";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

import { SortSelector } from "@/components/ui/sort-selector";
import { MobileFiltersDrawer } from "@/components/ui/mobile-filters-drawer";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  }>;
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentCategory = params.category || "";
  const currentSort = params.sort || "popular";
  const currentMinPrice = params.minPrice || "";
  const currentMaxPrice = params.maxPrice || "";
  const currentSearch = params.search || "";

  // Fetch from database/JSON backup
  const categories = await DbService.getCategories();
  let products = await DbService.getProducts({ status: "active" });

  // Apply filters
  let activeCategoryObj: any = null;
  if (currentCategory) {
    activeCategoryObj = categories.find((c) => c.slug === currentCategory);
    if (activeCategoryObj) {
      products = products.filter(
        (p) => p.category?.toString() === activeCategoryObj._id.toString()
      );
    }
  }

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.tags.some((t: string) => t.toLowerCase().includes(q))
    );
  }

  if (currentMinPrice) {
    products = products.filter((p) => p.basePrice >= Number(currentMinPrice));
  }

  if (currentMaxPrice) {
    products = products.filter((p) => p.basePrice <= Number(currentMaxPrice));
  }

  // Sort products
  if (currentSort === "price-asc") {
    products.sort((a, b) => a.basePrice - b.basePrice);
  } else if (currentSort === "price-desc") {
    products.sort((a, b) => b.basePrice - a.basePrice);
  } else if (currentSort === "newest") {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // Default score sorting (Bestsellers / Featured first)
    products.sort((a, b) => {
      const scoreA = (a.bestSeller ? 2 : 0) + (a.featured ? 1 : 0);
      const scoreB = (b.bestSeller ? 2 : 0) + (b.featured ? 1 : 0);
      return scoreB - scoreA;
    });
  }

  // Helper to build URL with persistent params
  const buildFilterUrl = (newParams: Record<string, string | null>) => {
    const base = new URLSearchParams();
    if (currentCategory) base.set("category", currentCategory);
    if (currentSort) base.set("sort", currentSort);
    if (currentMinPrice) base.set("minPrice", currentMinPrice);
    if (currentMaxPrice) base.set("maxPrice", currentMaxPrice);
    if (currentSearch) base.set("search", currentSearch);

    for (const [key, val] of Object.entries(newParams)) {
      if (val === null) {
        base.delete(key);
      } else {
        base.set(key, val);
      }
    }
    return `/shop?${base.toString()}`;
  };

  const hasActiveFilters =
    !!(currentCategory || currentSearch || currentMinPrice || currentMaxPrice);

  return (
    <>
      <Header />
      
      {/* Spacer to push content below the absolute header */}
      <div className="h-[140px]" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
        {/* Header Breadcrumb Title */}
        <div className="border-b border-neutral-100 pb-6 mb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            {activeCategoryObj ? activeCategoryObj.name : "Shop All Accessories"}
          </h1>
          <p className="mt-2 text-sm text-neutral-500 max-w-xl">
            {activeCategoryObj?.description ||
              "High-performance design-forward hardware, engineered to elevate your daily workspace setup."}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1">
            <form method="GET" action="/shop" className="space-y-6 sticky top-28">
              {/* Category selector */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  Categories
                </h3>
                <div className="space-y-2.5">
                  <Link
                    href={buildFilterUrl({ category: null })}
                    className={`block text-sm font-medium transition-colors ${
                      !currentCategory ? "text-brand-primary font-bold" : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    All Categories ({products.length + (currentCategory ? 5 : 0)})
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={buildFilterUrl({ category: cat.slug })}
                      className={`block text-sm font-medium transition-colors ${
                        currentCategory === cat.slug
                          ? "text-brand-primary font-bold"
                          : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="border-t border-neutral-100 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  Price Range
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    defaultValue={currentMinPrice}
                    className="w-1/2 h-9 text-xs rounded-custom-md border border-neutral-200 bg-neutral-50 px-2 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                  />
                  <span className="text-neutral-400 text-xs">to</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    defaultValue={currentMaxPrice}
                    className="w-1/2 h-9 text-xs rounded-custom-md border border-neutral-200 bg-neutral-50 px-2 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                  />
                </div>
                {/* Carry category and sort values implicitly in form */}
                {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
                {currentSort && <input type="hidden" name="sort" value={currentSort} />}
                {currentSearch && <input type="hidden" name="search" value={currentSearch} />}
                
                <Button type="submit" variant="primary" className="w-full mt-3 h-9 text-xs">
                  Apply Price
                </Button>
              </div>

              {/* Search override inside sidebar */}
              <div className="border-t border-neutral-100 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  Filter by Name
                </h3>
                <input
                  type="text"
                  name="search"
                  placeholder="Keyword..."
                  defaultValue={currentSearch}
                  className="w-full h-9 text-xs rounded-custom-md border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>

              {/* Active filters summary */}
              {hasActiveFilters && (
                <div className="border-t border-neutral-100 pt-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900">Active Filters</span>
                    <Link
                      href="/shop"
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                    >
                      Clear All
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentSearch && (
                      <Link
                        href={buildFilterUrl({ search: null })}
                        className="flex items-center gap-1 text-[10px] font-medium bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full hover:bg-neutral-200"
                      >
                        Search: {currentSearch}
                        <X className="h-3 w-3" />
                      </Link>
                    )}
                    {currentCategory && (
                      <Link
                        href={buildFilterUrl({ category: null })}
                        className="flex items-center gap-1 text-[10px] font-medium bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full hover:bg-neutral-200"
                      >
                        Category: {currentCategory}
                        <X className="h-3 w-3" />
                      </Link>
                    )}
                    {(currentMinPrice || currentMaxPrice) && (
                      <Link
                        href={buildFilterUrl({ minPrice: null, maxPrice: null })}
                        className="flex items-center gap-1 text-[10px] font-medium bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full hover:bg-neutral-200"
                      >
                        Price: ${currentMinPrice || "0"} - ${currentMaxPrice || "∞"}
                        <X className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </form>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {/* Top bar (sorting & results counter) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4 mb-6">
              <span className="text-xs font-medium text-neutral-500">
                Showing {products.length} {products.length === 1 ? "product" : "products"}
              </span>

              <div className="flex items-center gap-3">
                {/* Mobile Filters Trigger (Visible on mobile only) */}
                <MobileFiltersDrawer 
                  categories={categories.map(c => ({ _id: c._id.toString(), name: c.name, slug: c.slug }))}
                  currentCategory={currentCategory}
                  currentMinPrice={currentMinPrice}
                  currentMaxPrice={currentMaxPrice}
                  currentSearch={currentSearch}
                  hasActiveFilters={hasActiveFilters}
                />

                {/* Sort selector dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <ArrowUpDown className="h-3.5 w-3.5" /> Sort
                  </span>
                  <SortSelector currentSort={currentSort} />
                </div>
              </div>
            </div>

            {/* Main grid cards */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-neutral-50 rounded-custom-xl border border-dashed border-neutral-200 px-4">
                <SlidersHorizontal className="h-10 w-10 text-neutral-400 mx-auto mb-4" />
                <h3 className="font-display text-lg font-bold text-neutral-900 mb-1">
                  No products match filters
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
                  Try adjusting your search criteria, widening the price sliders, or selecting a different category.
                </p>
                <Link href="/shop">
                  <Button variant="primary">Reset Filters</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
