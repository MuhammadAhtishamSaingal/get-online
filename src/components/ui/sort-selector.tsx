"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SortSelectorProps {
  currentSort: string;
}

export function SortSelector({ currentSort }: SortSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", val);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSortChange(e.target.value)}
      className="text-xs rounded-custom-md border border-neutral-200 bg-white px-2 py-1.5 font-medium text-neutral-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
    >
      <option value="popular">Popularity</option>
      <option value="newest">Newest Drops</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
  );
}
