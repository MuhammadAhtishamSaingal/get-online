import * as React from "react";
import Link from "next/link";
import { DbService } from "@/lib/db-service";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  CheckCircle,
  CreditCard,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const { id } = await params;
  const order = await DbService.getOrderById(id);

  if (!order) {
    return (
      <>
        <Header />
        <main className="pt-40 pb-20 px-4 text-center max-w-md mx-auto">
          <h2 className="font-display text-xl font-bold text-neutral-900">Order Not Found</h2>
          <p className="text-xs text-neutral-500 mt-2">
            The transaction ID does not map to any active records in our system.
          </p>
          <Link href="/shop" className="mt-6 inline-block w-full">
            <Button variant="primary" className="w-full justify-center">Continue Shopping</Button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const isAdvance = order.paymentMethod !== "CASH_ON_DELIVERY";

  return (
    <>
      <Header />

      <main className="flex-grow pt-40 pb-20 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
        <div className="max-w-3xl mx-auto space-y-8 animate-slide-up">
          
          {/* Header Banner Success Card */}
          <div className="bg-white border border-neutral-200 rounded-custom-3xl p-8 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <CheckCircle className="h-9 w-9" />
            </div>
            <h2 className="font-display text-2xl font-black text-neutral-900 tracking-tight mb-2">
              Thank You for Your Purchase!
            </h2>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mb-5">
              Your order has been recorded successfully. A confirmation email has been dispatched to <span className="font-bold text-neutral-900">{order.customerInfo.email}</span>.
            </p>
            <div className="inline-block bg-neutral-50 px-5 py-2.5 rounded-custom-xl border border-neutral-250 text-xs">
              <span className="text-neutral-400 font-semibold uppercase tracking-wider mr-2">Order ID:</span>
              <span className="font-black text-neutral-900 font-mono text-sm">{order.orderNumber}</span>
            </div>
          </div>

          {/* Advance Transfer notice */}
          {isAdvance && (
            <div className="bg-amber-50/50 border border-amber-200/60 p-5 rounded-custom-2xl text-xs text-neutral-700 flex items-start gap-3.5 shadow-sm">
              <CreditCard className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-neutral-900">Payment Verification Pending</h4>
                <p className="mt-1 text-neutral-500 leading-relaxed">
                  You selected Advance Mobile/Bank Transfer. Our financial team will verify your transaction reference number (<span className="font-bold text-neutral-800 font-mono">{order.paymentDetails?.transactionRef || "N/A"}</span>) shortly. Once verified, your order status will update and you will receive a shipping dispatch email.
                </p>
              </div>
            </div>
          )}

          {/* Details breakdown split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Delivery address & details */}
            <div className="bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-3">
                Shipping Destination
              </h3>
              
              <div className="space-y-3 font-semibold text-neutral-600">
                <div>
                  <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Recipient</span>
                  <span className="text-neutral-900">{order.customerInfo.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Address</span>
                  <span className="text-neutral-900">
                    {order.shippingAddress.street}, {order.shippingAddress.houseFlatOffice !== "N/A" ? order.shippingAddress.houseFlatOffice + ", " : ""}{order.shippingAddress.city}, {order.shippingAddress.province}, {order.shippingAddress.country}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Phone Number</span>
                  <span className="text-neutral-900 font-mono">{order.customerInfo.phone}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Shipping Method</span>
                  <span className="text-neutral-900">Standard Delivery (3-5 Business Days)</span>
                </div>
              </div>
            </div>

            {/* Billing totals invoice summary */}
            <div className="bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-3">
                Billing Invoice
              </h3>

              <div className="space-y-3 font-semibold text-neutral-600">
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
                  <span>Estimated VAT (5%)</span>
                  <span className="text-neutral-900">${(order.tax || 0).toFixed(2)}</span>
                </div>

                <div className="border-t border-neutral-100 pt-3 flex justify-between text-sm font-black text-neutral-950">
                  <span>Total Paid</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Ordered items listing preview card */}
          <div className="bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-3">
              Ordered Items Summary
            </h3>
            
            <div className="divide-y divide-neutral-100">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-neutral-900">{item.name}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {item.qty}x {item.variant ? `Style: ${item.variant}` : ""} (SKU: ${item.sku})
                    </p>
                  </div>
                  <span className="font-bold text-neutral-950">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/shop" className="w-full sm:flex-1">
              <Button variant="primary" className="w-full justify-center h-11 text-xs font-bold uppercase tracking-wider gap-1 shadow-sm">
                Keep Browsing <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full justify-center h-11 text-xs font-bold uppercase tracking-wider border-neutral-200 text-neutral-600 hover:bg-white hover:text-neutral-900">
                Return to Home
              </Button>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
