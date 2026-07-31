"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CreditCard,
  Upload,
  Lock,
  Check
} from "lucide-react";

// Form validation schema
const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  streetAddress: z.string().min(5, "Street address must be at least 5 characters"),
  apartment: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  province: z.string().min(2, "State / Province is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  landmark: z.string().optional(),
  notes: z.string().optional(),
  
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "ADVANCE_TRANSFER"]),
  
  // Advance Transfer fields (conditional)
  walletName: z.string().optional(),
  transactionRef: z.string().optional(),
  senderAccount: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { items, getCartTotal, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Coupon State
  const [couponCode, setCouponCode] = React.useState("");
  const [discountPercent, setDiscountPercent] = React.useState(0);
  const [appliedCoupon, setAppliedCoupon] = React.useState<string | null>(null);
  
  // Screenshot Upload State
  const [isUploading, setIsUploading] = React.useState(false);
  const [screenshotUrl, setScreenshotUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [idempotencyKey, setIdempotencyKey] = React.useState("");

  React.useEffect(() => {
    const key = "key_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
    setIdempotencyKey(key);
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const subtotal = isMounted ? getCartTotal() : 0;
  
  // Shipping calculation
  const shippingThreshold = 50;
  const shippingFee = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 5;
  
  // Coupon Discount calculation
  const discountAmount = subtotal * (discountPercent / 100);
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "CASH_ON_DELIVERY",
      country: "Pakistan",
    },
  });

  const paymentMethod = watch("paymentMethod");

  // Validate coupon code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showToast("Please enter a coupon code.", "error");
      return;
    }
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode, subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.discountType === "percentage") {
          setDiscountPercent(data.discountValue);
          showToast(`Coupon ${data.code} applied: ${data.discountValue}% discount!`, "success");
        } else {
          const percent = subtotal > 0 ? (data.discountValue / subtotal) * 100 : 0;
          setDiscountPercent(percent);
          showToast(`Coupon ${data.code} applied: $${data.discountValue} discount!`, "success");
        }
        setAppliedCoupon(data.code);
      } else {
        showToast(data.error || "Failed to validate coupon.", "error");
      }
    } catch {
      showToast("Error checking coupon code.", "error");
    }
  };

  // Upload screenshot
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    showToast(`Uploading screenshot...`, "info");
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScreenshotUrl(data.url);
        showToast("Payment screenshot uploaded successfully!", "success");
      } else {
        showToast(data.error || "Failed to upload screenshot.", "error");
      }
    } catch {
      showToast("Screenshot upload error.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Order
  const onSubmitForm = async (values: CheckoutFormValues) => {
    if (items.length === 0) {
      showToast("Your cart is empty.", "error");
      return;
    }

    if (values.paymentMethod === "ADVANCE_TRANSFER") {
      if (!values.walletName || !values.transactionRef || !values.senderAccount) {
        showToast("Please enter transfer details (wallet name, sender account, and ref).", "error");
        return;
      }
    }

    setIsSubmitting(true);
    
    // Package payload
    const orderPayload = {
      idempotencyKey,
      customerInfo: {
        name: values.fullName,
        email: values.email,
        phone: values.phone,
      },
      shippingAddress: {
        streetAddress: values.streetAddress,
        apartment: values.apartment || "",
        city: values.city,
        province: values.province,
        country: values.country,
        postalCode: values.postalCode,
        landmark: values.landmark || "",
      },
      paymentMethod: values.paymentMethod,
      paymentDetails: values.paymentMethod === "ADVANCE_TRANSFER" ? {
        walletName: values.walletName,
        transactionRef: values.transactionRef,
        senderAccount: values.senderAccount,
        screenshotUrl: screenshotUrl || "",
      } : undefined,
      couponCode: appliedCoupon || undefined,
      notes: values.notes || "",
      items: items.map((item) => ({
        productId: item.productId,
        variantName: item.variantName || "",
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Order submitted successfully!", "success");
        clearCart();
        router.push(`/order-success/${data.orderId}`);
      } else {
        showToast(data.error || "Failed to submit order.", "error");
      }
    } catch {
      showToast("Network error submitting order.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted || items.length === 0) {
    return (
      <>
        <Header />
        <main className="pt-32 pb-20 text-center text-xs text-neutral-400">
          Loading checkout checkout validations...
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Cart
            </Link>
          </div>

          <h1 className="font-display text-2xl font-black text-neutral-900 tracking-tight mb-8">
            Checkout Details
          </h1>

          <form onSubmit={handleSubmit(onSubmitForm)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Fields (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Section 1: Customer Contact */}
              <div className="bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-3">
                  1. Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className={`w-full h-10 text-xs rounded-custom-xl border bg-neutral-50 px-3 focus:outline-none focus:bg-white ${
                        errors.email ? "border-red-500 focus:border-red-500" : "border-neutral-200 focus:border-brand-primary"
                      }`}
                    />
                    {errors.email && <p className="text-[10px] text-red-500 font-semibold">{errors.email.message}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      {...register("phone")}
                      className={`w-full h-10 text-xs rounded-custom-xl border bg-neutral-50 px-3 focus:outline-none focus:bg-white ${
                        errors.phone ? "border-red-500 focus:border-red-500" : "border-neutral-200 focus:border-brand-primary"
                      }`}
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 font-semibold">{errors.phone.message}</p>}
                  </div>
                </div>
              </div>

              {/* Section 2: Shipping Address */}
              <div className="bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-3">
                  2. Shipping Address
                </h3>
                
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...register("fullName")}
                    className={`w-full h-10 text-xs rounded-custom-xl border bg-neutral-50 px-3 focus:outline-none focus:bg-white ${
                      errors.fullName ? "border-red-500 focus:border-red-500" : "border-neutral-200 focus:border-brand-primary"
                    }`}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 font-semibold">{errors.fullName.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      {...register("streetAddress")}
                      className={`w-full h-10 text-xs rounded-custom-xl border bg-neutral-50 px-3 focus:outline-none focus:bg-white ${
                        errors.streetAddress ? "border-red-500 focus:border-red-500" : "border-neutral-200 focus:border-brand-primary"
                      }`}
                    />
                    {errors.streetAddress && <p className="text-[10px] text-red-500 font-semibold">{errors.streetAddress.message}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                      Flat / Office #
                    </label>
                    <input
                      type="text"
                      {...register("apartment")}
                      className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 focus:outline-none focus:bg-white focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                      City *
                    </label>
                    <input
                      type="text"
                      {...register("city")}
                      className={`w-full h-10 text-xs rounded-custom-xl border bg-neutral-50 px-3 focus:outline-none focus:bg-white ${
                        errors.city ? "border-red-500 focus:border-red-500" : "border-neutral-200 focus:border-brand-primary"
                      }`}
                    />
                    {errors.city && <p className="text-[10px] text-red-500 font-semibold">{errors.city.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                      State / Province *
                    </label>
                    <input
                      type="text"
                      {...register("province")}
                      className={`w-full h-10 text-xs rounded-custom-xl border bg-neutral-50 px-3 focus:outline-none focus:bg-white ${
                        errors.province ? "border-red-500 focus:border-red-500" : "border-neutral-200 focus:border-brand-primary"
                      }`}
                    />
                    {errors.province && <p className="text-[10px] text-red-500 font-semibold">{errors.province.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      {...register("postalCode")}
                      className={`w-full h-10 text-xs rounded-custom-xl border bg-neutral-50 px-3 focus:outline-none focus:bg-white ${
                        errors.postalCode ? "border-red-500 focus:border-red-500" : "border-neutral-200 focus:border-brand-primary"
                      }`}
                    />
                    {errors.postalCode && <p className="text-[10px] text-red-500 font-semibold">{errors.postalCode.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                      Country *
                    </label>
                    <input
                      type="text"
                      readOnly
                      {...register("country")}
                      className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-100 px-3 focus:outline-none cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                      Nearby Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      {...register("landmark")}
                      placeholder="e.g. Next to Metro Station"
                      className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 focus:outline-none focus:bg-white focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                    Delivery Instructions / Customer Notes
                  </label>
                  <textarea
                    rows={3}
                    {...register("notes")}
                    placeholder="Provide courier directions or other package notes..."
                    className="w-full text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 p-3 focus:outline-none focus:bg-white focus:border-brand-primary resize-none"
                  />
                </div>
              </div>

              {/* Section 3: Payment Options */}
              <div className="bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-3">
                  3. Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* COD */}
                  <label className={`relative flex items-start gap-3 p-4 rounded-custom-xl border cursor-pointer hover:bg-neutral-50 transition-all ${
                    paymentMethod === "CASH_ON_DELIVERY" ? "border-brand-primary bg-brand-primary/5" : "border-neutral-200"
                  }`}>
                    <input
                      type="radio"
                      value="CASH_ON_DELIVERY"
                      {...register("paymentMethod")}
                      className="h-4 w-4 text-brand-primary focus:ring-brand-primary mt-0.5"
                    />
                    <div>
                      <span className="block text-xs font-bold text-neutral-900">Cash on Delivery (COD)</span>
                      <span className="block text-[10px] text-neutral-500 mt-1">Pay with cash upon package hand-over at your doorstep.</span>
                    </div>
                  </label>

                  {/* Advance Transfer */}
                  <label className={`relative flex items-start gap-3 p-4 rounded-custom-xl border cursor-pointer hover:bg-neutral-50 transition-all ${
                    paymentMethod === "ADVANCE_TRANSFER" ? "border-brand-primary bg-brand-primary/5" : "border-neutral-200"
                  }`}>
                    <input
                      type="radio"
                      value="ADVANCE_TRANSFER"
                      {...register("paymentMethod")}
                      className="h-4 w-4 text-brand-primary focus:ring-brand-primary mt-0.5"
                    />
                    <div>
                      <span className="block text-xs font-bold text-neutral-900">Advance Mobile/Bank Transfer</span>
                      <span className="block text-[10px] text-neutral-500 mt-1">Send payment manually via Easypaisa, JazzCash, or bank account.</span>
                    </div>
                  </label>
                </div>

                {/* Conditional fields for Advance Transfer */}
                {paymentMethod === "ADVANCE_TRANSFER" && (
                  <div className="border-t border-neutral-100 pt-5 mt-5 space-y-6">
                    {/* Bank account details banner */}
                    <div className="bg-neutral-50 p-4 rounded-custom-xl border border-neutral-200 text-xs space-y-2 text-neutral-600">
                      <p className="font-bold text-neutral-900">Please send the exact order total to one of the accounts below:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <p className="font-bold text-neutral-800">Bank Transfer (HBL):</p>
                          <p className="mt-0.5">Title: GizmoGrid Store</p>
                          <p>Account: 1234-5678-9012-34</p>
                        </div>
                        <div>
                          <p className="font-bold text-neutral-800">Easypaisa / JazzCash:</p>
                          <p className="mt-0.5">Title: Muhammad Ahtisham</p>
                          <p>Phone: +92 300 1234567</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                          Bank / Wallet Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Easypaisa"
                          {...register("walletName")}
                          className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 focus:outline-none focus:bg-white focus:border-brand-primary"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                          Sender Phone / Account *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 03001234567"
                          {...register("senderAccount")}
                          className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 focus:outline-none focus:bg-white focus:border-brand-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                          Transaction Ref ID *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. TR-987654321"
                          {...register("transactionRef")}
                          className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 focus:outline-none focus:bg-white focus:border-brand-primary"
                        />
                      </div>
                    </div>

                    {/* Screenshot Upload widget */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 border border-dashed border-neutral-200 p-5 rounded-custom-2xl bg-neutral-50/50">
                      <div className="h-20 w-20 bg-neutral-100 border border-neutral-200 rounded-custom-xl flex items-center justify-center relative overflow-hidden flex-shrink-0">
                        {screenshotUrl ? (
                          <Image src={screenshotUrl} alt="" fill className="object-cover" />
                        ) : (
                          <CreditCard className="h-6 w-6 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-xs font-bold text-neutral-900">Upload Transaction Screenshot</p>
                        <p className="text-[10px] text-neutral-400 mt-1">Submit visual proof of mobile transaction slips for rapid verification.</p>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="h-10 px-4 rounded-custom-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="h-4 w-4" /> {isUploading ? "Uploading..." : "Upload Screenshot"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Preview & Totals (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Order Summary list */}
              <div className="bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-3">
                  Order Review
                </h3>

                <div className="divide-y divide-neutral-100 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variantName || ""}`} className="py-3 first:pt-0 flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-custom-md border border-neutral-200 bg-neutral-50 flex-shrink-0 flex items-center justify-center p-1">
                        {item.image ? (
                          <Image src={item.image} alt="" fill className="object-cover" />
                        ) : (
                          <span className="text-[8px] font-bold text-neutral-400">Box</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-neutral-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{item.quantity}x {item.variantName}</p>
                      </div>
                      <span className="text-xs font-bold text-neutral-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Code Panel */}
              <div className="bg-white p-5 rounded-custom-2xl border border-neutral-200 shadow-sm space-y-3">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Promotional Coupon
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. WELCOME10"
                    className="flex-1 h-9 text-xs rounded-custom-lg border border-neutral-200 bg-neutral-50 px-2.5 focus:outline-none focus:bg-white focus:border-brand-primary"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3 h-9 bg-neutral-900 text-white rounded-custom-lg text-xs font-bold hover:bg-neutral-800 transition-colors uppercase tracking-wider"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Coupon code {appliedCoupon} applied successfully.
                  </p>
                )}
              </div>

              {/* Pricing Cards calculations */}
              <div className="bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm space-y-6">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-3">
                  Summary calculations
                </h3>

                <div className="space-y-4 text-xs font-semibold text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-neutral-900">${subtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discountPercent}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="text-neutral-900">
                      {shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="border-t border-neutral-100 pt-4 flex justify-between text-base font-black text-neutral-950">
                    <span>Total Amount</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full justify-center h-11 text-xs font-bold uppercase tracking-wider shadow-sm"
                    isLoading={isSubmitting}
                  >
                    Place Order
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 font-bold uppercase tracking-wider text-center pt-2">
                    <Lock className="h-3.5 w-3.5 text-neutral-400" />
                    Security-audited checkout transaction
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
