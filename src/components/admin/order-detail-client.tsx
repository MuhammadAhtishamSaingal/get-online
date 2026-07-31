"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Printer,
  CreditCard,
  User,
  MapPin,
  Clock
} from "lucide-react";

interface OrderDetailClientProps {
  order: any;
}

export function OrderDetailClient({ order: initialOrder }: OrderDetailClientProps) {
  const { showToast } = useToast();
  const [order, setOrder] = React.useState(initialOrder);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Editable Form states
  const [orderStatus, setOrderStatus] = React.useState(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = React.useState(order.paymentStatus);
  const [courierName, setCourierName] = React.useState(order.tracking?.courier || "");
  const [trackingNumber, setTrackingNumber] = React.useState(order.tracking?.trackingNumber || "");
  const [notes, setNotes] = React.useState(order.notes || "");

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch("/api/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          orderStatus,
          paymentStatus,
          courierName,
          trackingNumber,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.order);
        showToast("Order specifications updated!", "success");
      } else {
        showToast(data.error || "Failed to update order details.", "error");
      }
    } catch {
      showToast("Network error updating order.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isAdvance = order.paymentMethod !== "CASH_ON_DELIVERY";

  return (
    <div className="space-y-8">
      {/* Print styles overrides */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-slip, .printable-slip * {
            visibility: visible;
          }
          .printable-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Head section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Link>
          <h1 className="font-display text-2xl font-black text-neutral-900 tracking-tight">
            Manage Order: {order.orderNumber}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Submitted on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handlePrint}
            variant="outline"
            className="h-10 text-xs font-bold gap-1.5 border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-sm"
          >
            <Printer className="h-4 w-4" /> Print Packing Slip
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column (8 cols) - Order details block (Printable) */}
        <div className="lg:col-span-8 space-y-6 printable-slip bg-white p-6 sm:p-8 rounded-custom-2xl border border-neutral-200 shadow-sm">
          
          {/* Slip Header (visible during print only) */}
          <div className="hidden print:flex items-center justify-between border-b border-neutral-200 pb-5 mb-5">
            <div>
              <h2 className="font-display text-lg font-black text-neutral-900 tracking-tight">GizmoGrid Store</h2>
              <p className="text-[10px] text-neutral-500 mt-0.5">GizmoGrid Store - Premium Accessories</p>
            </div>
            <div className="text-right">
              <h3 className="font-mono text-sm font-bold text-neutral-900">{order.orderNumber}</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Items breakdown Table */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-3">
              Ordered Items Summary
            </h3>
            
            <div className="divide-y divide-neutral-100">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold text-neutral-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {item.qty}x {item.variant ? `Style: ${item.variant}` : ""} (SKU: {item.sku})
                    </p>
                  </div>
                  <span className="text-sm font-black text-neutral-950">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Subtotal / totals block */}
            <div className="border-t border-neutral-100 pt-5 space-y-3.5 max-w-sm ml-auto text-xs font-semibold text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-neutral-900">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-neutral-900">
                  {order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>VAT (5%)</span>
                <span className="text-neutral-900">${(order.tax || 0).toFixed(2)}</span>
              </div>
              <div className="border-t border-neutral-150 pt-3 flex justify-between text-base font-black text-neutral-950">
                <span>Grand Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Billing details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-neutral-100 pt-6 mt-6">
            
            {/* Customer Details */}
            <div className="space-y-3.5 text-xs text-neutral-600 font-semibold">
              <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[10px] border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                <User className="h-4 w-4 text-brand-primary" /> Recipient Details
              </h4>
              <div>
                <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Name</span>
                <span className="text-neutral-950">{order.customerInfo?.name}</span>
              </div>
              <div>
                <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Email</span>
                <span className="text-neutral-950 font-mono">{order.customerInfo?.email}</span>
              </div>
              <div>
                <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Phone</span>
                <span className="text-neutral-950 font-mono">{order.customerInfo?.phone}</span>
              </div>
            </div>

            {/* Shipping Destination */}
            <div className="space-y-3.5 text-xs text-neutral-600 font-semibold">
              <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[10px] border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand-primary" /> Destination Address
              </h4>
              <div>
                <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Street Address</span>
                <span className="text-neutral-950">
                  {order.shippingAddress?.street}, {order.shippingAddress?.houseFlatOffice !== "N/A" ? order.shippingAddress?.houseFlatOffice + ", " : ""}
                </span>
              </div>
              <div>
                <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Location details</span>
                <span className="text-neutral-950">
                  {order.shippingAddress?.city}, {order.shippingAddress?.province}, {order.shippingAddress?.postalCode}
                </span>
              </div>
              <div>
                <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Nearby Landmark</span>
                <span className="text-neutral-950">{order.shippingAddress?.landmark || "None specified"}</span>
              </div>
            </div>
          </div>

          {/* Payment proof screenshot section */}
          {isAdvance && order.paymentDetails?.screenshotUrl && (
            <div className="border-t border-neutral-100 pt-6 mt-6 no-print space-y-4">
              <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[10px] border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-brand-primary" /> Payment Screenshot Proof
              </h4>
              
              <div className="bg-neutral-50 p-4 rounded-custom-2xl border border-neutral-200 inline-block">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">Submitted Slip</p>
                <div className="relative h-64 w-64 rounded-custom-xl overflow-hidden border border-neutral-200 bg-white">
                  <Image src={order.paymentDetails.screenshotUrl} alt="Payment slip" fill className="object-contain" />
                </div>
              </div>
            </div>
          )}

          {/* Customer notes */}
          {order.notes && (
            <div className="border-t border-neutral-100 pt-6 mt-6 text-xs font-semibold text-neutral-600">
              <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[10px] border-b border-neutral-100 pb-2">
                Order Notes
              </h4>
              <p className="text-neutral-900 mt-2 bg-neutral-50 p-3.5 rounded-custom-xl border border-neutral-200 leading-relaxed">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right column (4 cols) - Control panel no-print */}
        <div className="lg:col-span-4 bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm no-print space-y-6">
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-3 flex items-center gap-1.5">
            <Clock className="h-4.5 w-4.5 text-brand-primary" /> Order Fulfillment
          </h3>

          <form onSubmit={handleUpdateOrder} className="space-y-5">
            {/* Order status dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                Order Status
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 font-medium text-neutral-800 focus:outline-none focus:border-brand-primary"
              >
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

            {/* Payment status dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 font-medium text-neutral-800 focus:outline-none focus:border-brand-primary"
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
                <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
              </select>
            </div>

            {/* Advance payment specifics information display */}
            {isAdvance && (
              <div className="bg-neutral-50 p-4 rounded-custom-xl border border-neutral-200 text-xs space-y-2 font-medium text-neutral-600">
                <p className="font-bold text-neutral-800">Bank Transfer Details:</p>
                <p>Method: <span className="font-bold text-neutral-900">{order.paymentMethod}</span></p>
                <p>Reference: <span className="font-bold text-neutral-900 font-mono">{order.paymentDetails?.transactionRef || "N/A"}</span></p>
                <p>Sender Phone: <span className="font-bold text-neutral-900 font-mono">{order.paymentDetails?.senderAccount || "N/A"}</span></p>
              </div>
            )}

            {/* Courier / Tracking Fields */}
            <div className="border-t border-neutral-100 pt-5 mt-5 space-y-4">
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Courier Tracking details
              </h4>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Courier Name
                </label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. DHL, Leopard Courier"
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Tracking Code
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TR-5432109"
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5 border-t border-neutral-100 pt-5 mt-5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                Admin Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal logs or operational notes..."
                className="w-full text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 p-2.5 focus:outline-none focus:border-brand-primary resize-none font-medium"
              />
            </div>

            {/* Save updates CTA */}
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center h-10 text-xs font-bold uppercase tracking-wider shadow-sm pt-2"
              isLoading={isUpdating}
            >
              Update Order Details
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
