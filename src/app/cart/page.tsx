"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useCartStore } from "@/lib/cart-store";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft, ShoppingBag, Truck, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();
  const [isMounted, setIsMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const subtotal = isMounted ? getCartTotal() : 0;
  
  // Shipping logic (e.g. Free shipping on orders over $50, else $5 shipping fee)
  const shippingThreshold = 50;
  const shippingFee = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 5;
  
  const estimatedTax = subtotal * 0.05; // 5% VAT/Sales tax
  const orderTotal = subtotal + shippingFee + estimatedTax;

  return (
    <>
      <Header />
      
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs / Back button */}
          <div className="mb-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
          </div>

          <h1 className="font-display text-3xl font-black text-neutral-900 tracking-tight mb-8">
            Shopping Cart
          </h1>

          {!isMounted || items.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-neutral-200 rounded-custom-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h2 className="font-display text-xl font-bold text-neutral-900 mb-2">
                Your cart is empty
              </h2>
              <p className="text-xs text-neutral-500 mb-8 max-w-sm mx-auto">
                Looks like you haven't added any products to your cart yet. Head back to the store to browse our latest accessories.
              </p>
              <Link href="/shop" className="inline-block w-full">
                <Button variant="primary" className="w-full justify-center h-11">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            /* Cart Grid Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Item List (8 Cols) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white rounded-custom-2xl border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-neutral-100 hidden sm:grid sm:grid-cols-12 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    <div className="col-span-6">Product details</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>

                  <div className="divide-y divide-neutral-100 p-6 space-y-6 sm:space-y-0">
                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantName || ""}`}
                        className="py-6 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
                      >
                        {/* Thumb & Info */}
                        <div className="col-span-6 flex gap-4">
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-custom-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center p-2">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-neutral-400">Media</span>
                            )}
                          </div>
                          <div className="min-w-0 flex flex-col justify-center">
                            <h4 className="text-sm font-bold text-neutral-900 hover:text-brand-primary">
                              <Link href={`/products/${item.slug}`}>
                                {item.name}
                              </Link>
                            </h4>
                            {item.variantName && (
                              <span className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                                Style: {item.variantName}
                              </span>
                            )}
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-1 block">
                              SKU: {item.sku}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-2 text-left sm:text-center">
                          <span className="text-xs text-neutral-400 sm:hidden mr-1">Price:</span>
                          <span className="text-sm font-semibold text-neutral-900">${item.price.toFixed(2)}</span>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="col-span-2 flex justify-start sm:justify-center">
                          <QuantityStepper
                            value={item.quantity}
                            max={item.maxStock}
                            onChange={(val) => updateQuantity(item.productId, val, item.variantName)}
                            className="h-8 scale-90"
                          />
                        </div>

                        {/* Total & Remove */}
                        <div className="col-span-2 flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <span className="text-xs text-neutral-400 sm:hidden mr-1">Total:</span>
                            <span className="text-sm font-black text-neutral-950">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.variantName)}
                            className="p-1.5 rounded-custom-lg border border-neutral-200 bg-white text-neutral-400 hover:text-red-600 hover:border-red-200 transition-all focus:outline-none"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Free Shipping Alert Banner */}
                <div className="bg-white rounded-custom-2xl border border-neutral-200 p-5 shadow-sm flex items-center gap-4">
                  <div className={`p-2.5 rounded-custom-xl text-white ${subtotal >= shippingThreshold ? "bg-green-600" : "bg-brand-primary"}`}>
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="text-xs">
                    {subtotal >= shippingThreshold ? (
                      <p className="font-bold text-neutral-900">You qualify for Free Shipping!</p>
                    ) : (
                      <p className="text-neutral-500">
                        Add <span className="font-bold text-neutral-900">${(shippingThreshold - subtotal).toFixed(2)}</span> more to qualify for <span className="font-bold text-neutral-900">Free Shipping</span>.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary (4 Cols) */}
              <div className="lg:col-span-4 bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm space-y-6">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-4 text-xs font-semibold text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-neutral-900">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="text-neutral-900">
                      {shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated VAT (5%)</span>
                    <span className="text-neutral-900">${estimatedTax.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-neutral-100 pt-4 flex justify-between text-base font-black text-neutral-950">
                    <span>Total Amount</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <Link href="/checkout" className="block w-full">
                    <Button variant="primary" className="w-full justify-center h-11 text-xs font-bold uppercase tracking-wider">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 font-bold uppercase tracking-wider text-center pt-2">
                    <ShieldCheck className="h-4.5 w-4.5 text-green-600" />
                    Secure checkout checkout validation
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
