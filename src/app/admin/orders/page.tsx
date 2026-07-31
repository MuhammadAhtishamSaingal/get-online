"use client";

import * as React from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { Search, Eye, RefreshCw } from "lucide-react";

interface Order {
  _id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Filter states
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const fetchOrders = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/order");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        showToast(data.error || "Failed to load orders.", "error");
      }
    } catch {
      showToast("Network error fetching orders.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerInfo?.name.toLowerCase().includes(q) ||
      o.customerInfo?.phone.includes(q);

    const matchesStatus =
      statusFilter === "ALL" || o.orderStatus.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-neutral-900 tracking-tight">
            Orders Registry
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Fulfill store purchases, update shipping timelines, trace reference proofs, and print slips.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3 h-8 border border-neutral-200 bg-white text-neutral-600 rounded-custom-lg text-xs font-bold hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Reload
        </button>
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
            placeholder="Search by order number, client name, phone..."
            className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full sm:w-56 flex-shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-white px-3 font-medium text-neutral-800 focus:border-brand-primary focus:outline-none"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="NEW">New</option>
            <option value="AWAITING_CONFIRMATION">Awaiting Confirmation</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PACKED">Packed</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RETURNED">Returned</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Grid List Table */}
      <div className="bg-white rounded-custom-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-20 text-xs text-neutral-400">
              Loading client order records...
            </div>
          ) : filteredOrders.length > 0 ? (
            <table className="min-w-full divide-y divide-neutral-100 text-left">
              <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Order Number</th>
                  <th className="px-6 py-3.5">Customer details</th>
                  <th className="px-6 py-3.5">Submission Date</th>
                  <th className="px-6 py-3.5">Invoice Total</th>
                  <th className="px-6 py-3.5">Payment Status</th>
                  <th className="px-6 py-3.5">Order Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-600 font-medium">
                {filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-4 font-bold text-neutral-900 font-mono">
                      {ord.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-neutral-900">{ord.customerInfo?.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{ord.customerInfo?.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-semibold">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-900">
                      ${ord.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        ord.paymentStatus === "PAID"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : ord.paymentStatus === "PENDING"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        ord.orderStatus === "DELIVERED"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : ord.orderStatus === "CANCELLED"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${ord._id}`}>
                        <button
                          className="p-1.5 rounded-custom-lg border border-neutral-200 bg-white text-neutral-500 hover:text-brand-primary hover:border-brand-primary/30 transition-all focus:outline-none"
                          title="View order details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-24 text-xs text-neutral-400">
              No orders matched the current registry filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
