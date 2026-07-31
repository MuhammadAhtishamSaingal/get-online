import * as React from "react";
import { DbService } from "@/lib/db-service";
import { EditProductClient } from "@/components/admin/edit-product-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await DbService.getProductById(id);
  const categories = await DbService.getCategories();

  if (!product) {
    return (
      <div className="text-center py-20 bg-neutral-50 rounded-custom-xl border border-dashed border-neutral-200">
        <h2 className="font-display text-lg font-bold text-neutral-900 mb-1">
          Product Not Found
        </h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          The requested product ID does not exist or has been deleted from catalog backups.
        </p>
      </div>
    );
  }

  return (
    <EditProductClient product={product} categories={categories} />
  );
}
