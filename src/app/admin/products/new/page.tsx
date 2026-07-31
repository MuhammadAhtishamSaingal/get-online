"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { ProductForm } from "@/components/admin/product-form";

export default function AdminNewProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [categories, setCategories] = React.useState<any[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch {
        showToast("Failed to load catalog categories.", "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, [showToast]);

  const handleSave = async (payload: any) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Product registered successfully!", "success");
        // Force refresh table
        router.push("/admin/products");
        router.refresh();
      } else {
        showToast(data.error || "Failed to register product.", "error");
      }
    } catch {
      showToast("Network error during product saving.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-xs text-neutral-400">
        Preparing catalog configuration form...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-black text-neutral-900 tracking-tight">
          Register New Product
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Add hardware items, specs, pricing tiers, and upload media items.
        </p>
      </div>

      <ProductForm
        categories={categories}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
