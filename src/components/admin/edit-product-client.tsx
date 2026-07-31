"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { ProductForm } from "@/components/admin/product-form";

interface EditProductClientProps {
  product: any;
  categories: any[];
}

export function EditProductClient({
  product,
  categories,
}: EditProductClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

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
        showToast("Product specifications updated!", "success");
        router.push("/admin/products");
        router.refresh();
      } else {
        showToast(data.error || "Failed to update product details.", "error");
      }
    } catch {
      showToast("Network error during product saving.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-black text-neutral-900 tracking-tight">
          Edit Product: {product.name}
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Modify specification variables, tags, variant stocks, and pricing models.
        </p>
      </div>

      <ProductForm
        initialData={product}
        categories={categories}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
