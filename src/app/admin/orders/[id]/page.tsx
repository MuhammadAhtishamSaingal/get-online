import * as React from "react";
import { DbService } from "@/lib/db-service";
import { OrderDetailClient } from "@/components/admin/order-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await DbService.getOrderById(id);

  if (!order) {
    return (
      <div className="text-center py-20 bg-neutral-50 rounded-custom-xl border border-dashed border-neutral-200">
        <h2 className="font-display text-lg font-bold text-neutral-900 mb-1">
          Order Not Found
        </h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          The requested order ID does not exist or has been archived from catalog backups.
        </p>
      </div>
    );
  }

  return (
    <OrderDetailClient order={order} />
  );
}
