import * as React from "react";
import { DbService } from "@/lib/db-service";
import Link from "next/link";
import {
  DollarSign,
  AlertTriangle,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  ArrowRightLeft,
  RotateCcw,
  ArrowUpRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const products = await DbService.getProducts({});
  const orders = await DbService.getOrders({});

  // 1. Calculate stats case-insensitively
  const totalSales = orders
    .filter((o) => String(o.paymentStatus).toUpperCase() === "PAID")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCodAmount = orders
    .filter(
      (o) =>
        String(o.paymentMethod).toUpperCase() === "CASH_ON_DELIVERY" &&
        String(o.paymentStatus).toUpperCase() === "PENDING"
    )
    .reduce((sum, o) => sum + o.total, 0);

  const lowStockProducts = products.filter(
    (p) => p.stockQuantity <= (p.lowStockThreshold || 5)
  );

  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  // Case-insensitive status mapping for all 9 spec statuses
  const orderStats = {
    new: orders.filter((o) => {
      const s = String(o.orderStatus).toUpperCase();
      return s === "NEW";
    }).length,
    awaiting_confirmation: orders.filter((o) => {
      const s = String(o.orderStatus).toUpperCase();
      return s === "AWAITING_CONFIRMATION";
    }).length,
    confirmed: orders.filter((o) => {
      const s = String(o.orderStatus).toUpperCase();
      return s === "CONFIRMED";
    }).length,
    packed: orders.filter((o) => {
      const s = String(o.orderStatus).toUpperCase();
      return s === "PACKED";
    }).length,
    dispatched: orders.filter((o) => {
      const s = String(o.orderStatus).toUpperCase();
      return s === "DISPATCHED";
    }).length,
    delivered: orders.filter((o) => {
      const s = String(o.orderStatus).toUpperCase();
      return s === "DELIVERED";
    }).length,
    cancelled: orders.filter((o) => {
      const s = String(o.orderStatus).toUpperCase();
      return s === "CANCELLED";
    }).length,
    returned: orders.filter((o) => {
      const s = String(o.orderStatus).toUpperCase();
      return s === "RETURNED";
    }).length,
    refunded: orders.filter((o) => {
      const s = String(o.orderStatus).toUpperCase();
      return s === "REFUNDED";
    }).length,
  };

  // Sort and slice top lists
  const recentOrders = orders.slice(0, 5);
  const lowStockAlerts = lowStockProducts.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl font-black text-neutral-900 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Welcome back! Here is a summary of your store's performance metrics and operational health.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales (Featured prominent card) */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 rounded-custom-2xl border border-neutral-800 shadow-md flex items-center gap-5 text-white animate-fade-in-up stagger-delay-1">
          <div className="p-4 bg-white/10 text-white rounded-custom-xl backdrop-blur-sm">
            <DollarSign className="h-7 w-7 text-brand-primary" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <span className="block text-3xl font-black tracking-tight mt-1">
              ${totalSales.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Pending COD */}
        <div className="bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm flex items-center gap-5 animate-fade-in-up stagger-delay-2">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-custom-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Pending COD
            </span>
            <span className="block text-2xl font-black text-neutral-900 tracking-tight mt-1">
              ${pendingCodAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm flex items-center gap-5 animate-fade-in-up stagger-delay-3">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-custom-xl">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Total Orders
            </span>
            <span className="block text-2xl font-black text-neutral-900 tracking-tight mt-1">
              {orders.length}
            </span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm flex items-center gap-5 animate-fade-in-up stagger-delay-4">
          <div className="p-3.5 bg-red-50 text-red-650 rounded-custom-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <span className="block text-2xl font-black text-neutral-900 tracking-tight mt-1">
              {lowStockProducts.length} <span className="text-xs text-neutral-450 font-medium">({outOfStockCount} out)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Order Status Counters Grid (All 9 Spec Statuses - Premium color codes) */}
      <div className="bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm animate-fade-in-up stagger-delay-4">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-5">
          Orders Status Summary
        </h3>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-5 lg:grid-cols-9">
          {/* 1. New */}
          <div className="bg-neutral-50/50 p-3 rounded-custom-xl border border-neutral-100/80 text-center hover:bg-neutral-50 transition-colors">
            <Clock className="h-4.5 w-4.5 text-neutral-400 mx-auto mb-1.5" />
            <span className="block text-lg font-black text-neutral-900">{orderStats.new}</span>
            <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">New</span>
          </div>
          {/* 2. Awaiting Confirmation */}
          <div className="bg-amber-50/30 p-3 rounded-custom-xl border border-amber-100/50 text-center hover:bg-amber-50/50 transition-colors">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500 mx-auto mb-1.5" />
            <span className="block text-lg font-black text-neutral-900">{orderStats.awaiting_confirmation}</span>
            <span className="block text-[9px] font-bold text-amber-700 uppercase tracking-wider mt-0.5 truncate">Awaiting</span>
          </div>
          {/* 3. Confirmed */}
          <div className="bg-blue-50/30 p-3 rounded-custom-xl border border-blue-100/50 text-center hover:bg-blue-50/50 transition-colors">
            <CheckCircle className="h-4.5 w-4.5 text-blue-500 mx-auto mb-1.5" />
            <span className="block text-lg font-black text-neutral-900">{orderStats.confirmed}</span>
            <span className="block text-[9px] font-bold text-blue-700 uppercase tracking-wider mt-0.5 truncate">Confirmed</span>
          </div>
          {/* 4. Packed */}
          <div className="bg-purple-50/30 p-3 rounded-custom-xl border border-purple-100/50 text-center hover:bg-purple-50/50 transition-colors">
            <Package className="h-4.5 w-4.5 text-purple-500 mx-auto mb-1.5" />
            <span className="block text-lg font-black text-neutral-900">{orderStats.packed}</span>
            <span className="block text-[9px] font-bold text-purple-700 uppercase tracking-wider mt-0.5 truncate">Packed</span>
          </div>
          {/* 5. Dispatched */}
          <div className="bg-indigo-50/30 p-3 rounded-custom-xl border border-indigo-100/50 text-center hover:bg-indigo-50/50 transition-colors">
            <Truck className="h-4.5 w-4.5 text-indigo-500 mx-auto mb-1.5" />
            <span className="block text-lg font-black text-neutral-900">{orderStats.dispatched}</span>
            <span className="block text-[9px] font-bold text-indigo-700 uppercase tracking-wider mt-0.5 truncate">Dispatched</span>
          </div>
          {/* 6. Delivered */}
          <div className="bg-green-50/30 p-3 rounded-custom-xl border border-green-100/50 text-center hover:bg-green-50/50 transition-colors">
            <CheckCircle className="h-4.5 w-4.5 text-green-500 mx-auto mb-1.5" />
            <span className="block text-lg font-black text-neutral-900">{orderStats.delivered}</span>
            <span className="block text-[9px] font-bold text-green-700 uppercase tracking-wider mt-0.5 truncate">Delivered</span>
          </div>
          {/* 7. Cancelled */}
          <div className="bg-red-50/30 p-3 rounded-custom-xl border border-red-100/50 text-center hover:bg-red-50/50 transition-colors">
            <XCircle className="h-4.5 w-4.5 text-red-500 mx-auto mb-1.5" />
            <span className="block text-lg font-black text-neutral-900">{orderStats.cancelled}</span>
            <span className="block text-[9px] font-bold text-red-700 uppercase tracking-wider mt-0.5 truncate">Cancelled</span>
          </div>
          {/* 8. Returned */}
          <div className="bg-orange-50/30 p-3 rounded-custom-xl border border-orange-100/50 text-center hover:bg-orange-50/50 transition-colors">
            <ArrowRightLeft className="h-4.5 w-4.5 text-orange-500 mx-auto mb-1.5" />
            <span className="block text-lg font-black text-neutral-900">{orderStats.returned}</span>
            <span className="block text-[9px] font-bold text-orange-700 uppercase tracking-wider mt-0.5 truncate">Returned</span>
          </div>
          {/* 9. Refunded */}
          <div className="bg-rose-50/30 p-3 rounded-custom-xl border border-rose-100/50 text-center hover:bg-rose-50/50 transition-colors">
            <RotateCcw className="h-4.5 w-4.5 text-rose-500 mx-auto mb-1.5" />
            <span className="block text-lg font-black text-neutral-900">{orderStats.refunded}</span>
            <span className="block text-[9px] font-bold text-rose-700 uppercase tracking-wider mt-0.5 truncate">Refunded</span>
          </div>
        </div>
      </div>

      {/* Detailed Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-custom-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-neutral-150 flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-primary uppercase tracking-wider hover:underline"
            >
              Manage All <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex-grow">
            {recentOrders.length > 0 ? (
              <>
                {/* Desktop view table layout */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-100 text-left">
                    <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Order No</th>
                        <th className="px-6 py-3.5">Customer</th>
                        <th className="px-6 py-3.5">Total</th>
                        <th className="px-6 py-3.5">Payment</th>
                        <th className="px-6 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs text-neutral-600 font-medium">
                      {recentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-neutral-50/50">
                          <td className="px-6 py-4 font-bold text-neutral-900">
                            <Link href={`/admin/orders/${order._id}`} className="hover:underline text-brand-primary">
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <div>{order.customerInfo?.name}</div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">{order.customerInfo?.phone}</div>
                          </td>
                          <td className="px-6 py-4 font-bold text-neutral-900">${order.total.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              String(order.paymentStatus).toUpperCase() === "PAID" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              String(order.orderStatus).toUpperCase() === "DELIVERED" ? "bg-green-50 text-green-700 border border-green-200" : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                            }`}>
                              {order.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view responsive cards list */}
                <div className="block md:hidden divide-y divide-neutral-100">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Link href={`/admin/orders/${order._id}`} className="font-bold text-brand-primary hover:underline">
                          {order.orderNumber}
                        </Link>
                        <span className="font-black text-neutral-900">${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <div>
                          <div>{order.customerInfo?.name}</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">{order.customerInfo?.phone}</div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            String(order.paymentStatus).toUpperCase() === "PAID" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {order.paymentStatus}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            String(order.orderStatus).toUpperCase() === "DELIVERED" ? "bg-green-50 text-green-700 border border-green-200" : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-xs text-neutral-400">
                No orders have been submitted yet.
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-custom-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-neutral-150">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Low Stock Alerts
            </h3>
          </div>

          <div className="flex-1 p-6 space-y-4">
            {lowStockAlerts.length > 0 ? (
              lowStockAlerts.map((prod) => (
                <div key={prod._id} className="flex items-center justify-between border-b border-neutral-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="min-w-0 pr-3">
                    <h4 className="text-xs font-bold text-neutral-900 truncate">
                      {prod.name}
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                      SKU: {prod.SKU}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      prod.stockQuantity === 0 ? "bg-red-50 text-red-600 border border-red-200" : "bg-amber-50 text-amber-600 border border-amber-200"
                    }`}>
                      {prod.stockQuantity === 0 ? "Sold Out" : `${prod.stockQuantity} Left`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-xs text-neutral-400">
                All inventory quantities are healthy.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
