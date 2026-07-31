"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Pencil,
  Copy,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ImageOff
} from "lucide-react";

function makeDuplicateSlug(slug: string): string {
  return `${slug}-copy-${Math.floor(100 + Math.random() * 900)}`;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  basePrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  SKU: string;
  status: "active" | "draft" | "archived";
  category?: { _id: string; name: string } | string;
  images?: Array<{ url: string }>;
}

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch categories
      const catRes = await fetch("/api/categories");
      const catData = await catRes.json();
      if (Array.isArray(catData)) setCategories(catData);

      // 2. Fetch products (with admin flags)
      const prodRes = await fetch("/api/products?admin=true");
      const prodData = await prodRes.json();
      if (Array.isArray(prodData)) {
        setProducts(prodData);
      }
    } catch {
      showToast("Error loading catalog data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Duplicate product helper
  const handleDuplicate = async (prod: Product) => {
    try {
      const copyName = `${prod.name} (Copy)`;
      const copySlug = makeDuplicateSlug(prod.slug);
      const copySku = `${prod.SKU || "sku"}-COPY`;

      const duplicatedRecord = {
        ...prod,
        _id: undefined, // Let db-service generate unique id
        name: copyName,
        slug: copySlug,
        SKU: copySku,
        status: "draft", // Start as draft
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicatedRecord),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Duplicated "${prod.name}" successfully! Created draft.`, "success");
        loadData();
      } else {
        showToast(data.error || "Failed to duplicate product.", "error");
      }
    } catch {
      showToast("Network error during duplication.", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Product "${name}" deleted.`, "success");
        loadData();
      } else {
        showToast(data.error || "Failed to delete product.", "error");
      }
    } catch {
      showToast("Connection error while deleting product.", "error");
    }
  };

  // Filter items
  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.SKU && p.SKU.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getCategoryName = (catIdOrObj: any) => {
    if (!catIdOrObj) return "Uncategorized";
    if (typeof catIdOrObj === "object" && catIdOrObj.name) return catIdOrObj.name;
    const cat = categories.find((c) => c._id.toString() === catIdOrObj.toString());
    return cat ? cat.name : "Uncategorized";
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-neutral-900 tracking-tight">
            Products Registry
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your hardware inventory, modify product variants, update prices, and upload specs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="inline-flex items-center justify-center p-2 border border-neutral-200 bg-white rounded-custom-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 focus:outline-none transition-colors"
            title="Refresh Catalog"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Link href="/admin/products/new">
            <Button variant="primary" className="h-10 text-xs font-bold uppercase tracking-wider gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-custom-2xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand, SKU..."
            className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status filter */}
        <div className="w-full sm:w-44 flex-shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-white px-3 font-medium text-neutral-800 focus:border-brand-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Grid List Table */}
      <div className="bg-white rounded-custom-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-20 text-xs text-neutral-400">
              Loading active inventory registry...
            </div>
          ) : filteredProducts.length > 0 ? (
            <table className="min-w-full divide-y divide-neutral-100 text-left">
              <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 w-16">Item</th>
                  <th className="px-6 py-3.5">Product &amp; SKU</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Inventory</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-600 font-medium">
                {filteredProducts.map((prod) => {
                  const image = prod.images?.[0]?.url;
                  const isLow = prod.stockQuantity <= (prod.lowStockThreshold || 5);
                  
                  return (
                    <tr key={prod._id} className="hover:bg-neutral-50/50">
                      {/* Image Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="relative h-10 w-10 rounded-custom-lg border border-neutral-100 overflow-hidden bg-neutral-50 flex items-center justify-center">
                          {image ? (
                            <Image src={image} alt="" fill className="object-cover" />
                          ) : (
                            <ImageOff className="h-4 w-4 text-neutral-400" />
                          )}
                        </div>
                      </td>

                      {/* Name & SKU */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-neutral-900 line-clamp-1">{prod.name}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wide">
                          SKU: {prod.SKU || "N/A"}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="text-neutral-500 font-semibold">
                          {getCategoryName(prod.category)}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-bold text-neutral-900">
                        ${prod.basePrice.toFixed(2)}
                      </td>

                      {/* Inventory Count */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${isLow ? "text-amber-600" : "text-neutral-900"}`}>
                            {prod.stockQuantity} units
                          </span>
                          {isLow && (
                            <span title="Low Stock Warning">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          prod.status === "active"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : prod.status === "draft"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                        }`}>
                          {prod.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-1.5">
                          <Link href={`/admin/products/${prod._id}`}>
                            <button
                              className="p-1.5 rounded-custom-lg border border-neutral-200 bg-white text-neutral-500 hover:text-brand-primary hover:border-brand-primary/30 transition-all focus:outline-none"
                              title="Edit product"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDuplicate(prod)}
                            className="p-1.5 rounded-custom-lg border border-neutral-200 bg-white text-neutral-500 hover:text-indigo-600 hover:border-indigo-200 transition-all focus:outline-none"
                            title="Duplicate product"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod._id, prod.name)}
                            className="p-1.5 rounded-custom-lg border border-neutral-200 bg-white text-neutral-500 hover:text-red-600 hover:border-red-200 transition-all focus:outline-none"
                            title="Delete product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-24 text-xs text-neutral-400">
              No products found matching active filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
