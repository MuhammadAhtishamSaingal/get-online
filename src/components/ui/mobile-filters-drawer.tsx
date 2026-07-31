"use client";

import * as React from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "./button";
import { Drawer } from "./drawer";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface MobileFiltersDrawerProps {
  categories: Category[];
  currentCategory: string;
  currentMinPrice: string;
  currentMaxPrice: string;
  currentSearch: string;
  hasActiveFilters: boolean;
}

export function MobileFiltersDrawer({
  categories,
  currentCategory,
  currentMinPrice,
  currentMaxPrice,
  currentSearch,
  hasActiveFilters,
}: MobileFiltersDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Helper to build URL with query params
  const buildFilterUrl = (newParams: Record<string, string | null>) => {
    const base = new URLSearchParams();
    if (currentCategory) base.set("category", currentCategory);
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

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden inline-flex items-center gap-1.5 px-3 h-9 text-xs font-semibold rounded-custom-md border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
        {hasActiveFilters && (
          <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
        )}
      </button>

      {/* Drawer */}
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Filter & Refine">
        <form method="GET" action="/shop" className="space-y-6" onSubmit={() => setIsOpen(false)}>
          {/* Categories */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 mb-3">
              Categories
            </h3>
            <div className="space-y-2.5">
              <Link
                href={buildFilterUrl({ category: null })}
                onClick={() => setIsOpen(false)}
                className={`block text-sm font-medium transition-colors ${
                  !currentCategory ? "text-brand-primary font-bold" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                All Categories
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={buildFilterUrl({ category: cat.slug })}
                  onClick={() => setIsOpen(false)}
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
          <div className="border-t border-neutral-100 pt-5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-455 mb-3">
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
            
            {/* Form hidden helpers */}
            {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
            {currentSearch && <input type="hidden" name="search" value={currentSearch} />}
            
            <Button type="submit" variant="primary" className="w-full mt-3 h-9 text-xs font-bold">
              Apply Price Filters
            </Button>
          </div>

          {/* Keyword Search */}
          <div className="border-t border-neutral-100 pt-5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-455 mb-3">
              Search Keyword
            </h3>
            <input
              type="text"
              name="search"
              placeholder="Search accessories..."
              defaultValue={currentSearch}
              className="w-full h-9 text-xs rounded-custom-md border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
            />
          </div>

          {/* Active summary */}
          {hasActiveFilters && (
            <div className="border-t border-neutral-100 pt-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900">Active Filters</span>
                <Link
                  href="/shop"
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                >
                  Clear All
                </Link>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentSearch && (
                  <Link
                    href={buildFilterUrl({ search: null })}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-1 text-[10px] font-medium bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full hover:bg-neutral-200"
                  >
                    Search: {currentSearch}
                    <X className="h-3 w-3" />
                  </Link>
                )}
                {currentCategory && (
                  <Link
                    href={buildFilterUrl({ category: null })}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-1 text-[10px] font-medium bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full hover:bg-neutral-200"
                  >
                    Category: {currentCategory}
                    <X className="h-3 w-3" />
                  </Link>
                )}
                {(currentMinPrice || currentMaxPrice) && (
                  <Link
                    href={buildFilterUrl({ minPrice: null, maxPrice: null })}
                    onClick={() => setIsOpen(false)}
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
      </Drawer>
    </>
  );
}
