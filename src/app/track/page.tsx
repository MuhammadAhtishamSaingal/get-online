"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Search,
  Package,
  CheckCircle,
  Truck,
  MapPin,
  Calendar,
  AlertTriangle
} from "lucide-react";

interface TrackedOrder {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  city: string;
  country: string;
  courier: string | null;
  trackingNumber: string | null;
  itemsCount: number;
}

export default function TrackingPage() {
  const { showToast } = useToast();
  const [orderNumber, setOrderNumber] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [order, setOrder] = React.useState<TrackedOrder | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !phone) {
      showToast("Please enter both order number and phone number.", "error");
      return;
    }

    setIsLoading(true);
    setOrder(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.order);
        showToast("Order status loaded successfully!", "success");
      } else {
        showToast(data.error || "Failed to locate order.", "error");
      }
    } catch {
      showToast("Network connection error tracking order.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if status index is active
  const getStatusIndex = (status: string) => {
    const statuses = ["NEW", "CONFIRMED", "PACKED", "DISPATCHED", "DELIVERED"];
    const idx = statuses.indexOf(status.toUpperCase());
    return idx === -1 ? 0 : idx;
  };

  const steps = [
    { label: "Order Placed", desc: "Received and awaiting confirmation." },
    { label: "Confirmed", desc: "Order details verified by store team." },
    { label: "Packed", desc: "Items checked and safely packed." },
    { label: "Dispatched", desc: "Picked up and on route via courier." },
    { label: "Delivered", desc: "Package handed over successfully!" },
  ];

  return (
    <>
      <Header />

      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Tracking Form card */}
          <div className="bg-white p-6 sm:p-8 rounded-custom-3xl border border-neutral-200 shadow-sm space-y-5">
            <div className="text-center max-w-md mx-auto">
              <Package className="h-10 w-10 text-brand-primary mx-auto mb-4" />
              <h1 className="font-display text-2xl font-black text-neutral-900 tracking-tight">
                Track Your Shipment
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Enter your order tracking number and registered phone number below to trace delivery status.
              </p>
            </div>

            <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Order Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORD-2026-000001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 focus:outline-none focus:bg-white focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 03001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 focus:outline-none focus:bg-white focus:border-brand-primary"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center h-11 text-xs font-bold uppercase tracking-wider shadow-sm"
                  isLoading={isLoading}
                >
                  <Search className="h-4 w-4" /> Trace Order
                </Button>
              </div>
            </form>
          </div>

          {/* Results Area */}
          {order && (
            <div className="space-y-6 animate-slide-up">
              
              {/* Order Status Timeline Card */}
              <div className="bg-white p-6 sm:p-8 rounded-custom-3xl border border-neutral-200 shadow-sm space-y-6">
                
                {/* Meta details header */}
                <div className="flex flex-col sm:flex-row justify-between border-b border-neutral-100 pb-5 gap-3.5 text-xs font-semibold text-neutral-500">
                  <div>
                    <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Tracking Code</span>
                    <span className="font-black text-neutral-900 font-mono text-sm">{order.orderNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Estimated Destination</span>
                    <span className="text-neutral-900 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-neutral-400" /> {order.city}, {order.country}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Package Items</span>
                    <span className="text-neutral-900">{order.itemsCount} Accessories</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Placement Date</span>
                    <span className="text-neutral-900 flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-neutral-400" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status Timeline */}
                {order.orderStatus.toUpperCase() === "CANCELLED" ? (
                  <div className="bg-red-50/50 border border-red-200/60 p-5 rounded-custom-2xl text-xs text-neutral-700 flex items-start gap-3.5">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-neutral-900">Order Cancelled</h4>
                      <p className="mt-1 text-neutral-500 leading-relaxed">
                        This order has been cancelled. For refunds, stock queries, or re-orders, please reach out to our team at support@gizmogrid.com.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-neutral-100 space-y-8 py-2 ml-3">
                    {steps.map((step, idx) => {
                      const currentIdx = getStatusIndex(order.orderStatus);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={idx} className="relative">
                          {/* Dot Badge */}
                          <div className={`absolute -left-[31px] top-0 h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted
                              ? isCurrent
                                ? "bg-white border-brand-primary h-5 w-5 -left-[32px] ring-4 ring-brand-primary/10"
                                : "bg-brand-primary border-brand-primary"
                              : "bg-white border-neutral-200"
                          }`}>
                            {isCompleted && !isCurrent && (
                              <CheckCircle className="h-3.5 w-3.5 text-white fill-current" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="pl-4">
                            <h4 className={`text-xs font-bold ${isCompleted ? "text-neutral-900" : "text-neutral-400"}`}>
                              {step.label}
                            </h4>
                            <p className={`text-[10px] mt-0.5 leading-relaxed ${isCompleted ? "text-neutral-500" : "text-neutral-400"}`}>
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Courier details banner */}
              {order.courier && order.trackingNumber && (
                <div className="bg-white p-5 rounded-custom-3xl border border-neutral-200 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-brand-primary/5 text-brand-primary rounded-custom-2xl border border-brand-primary/10">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-neutral-900">Shipment Handed Over to Courier</p>
                    <p className="text-neutral-500 mt-0.5">
                      Your parcel is being transported by <span className="font-bold text-neutral-900">{order.courier}</span> under tracking number <span className="font-bold text-neutral-900 font-mono">{order.trackingNumber}</span>.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
