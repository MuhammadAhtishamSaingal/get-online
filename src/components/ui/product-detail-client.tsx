"use client";

import * as React from "react";
import Image from "next/image";
import { ShoppingCart, Star, ShieldCheck, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
import { QuantityStepper } from "./quantity-stepper";
import { VariantSelector } from "./variant-selector";
import { useToast } from "./toast";
import { useCartStore } from "@/lib/cart-store";
import { ProductCard } from "./product-card";

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductDetailClientProps {
  product: any;
  reviews: Review[];
  relatedProducts: any[];
}

export function ProductDetailClient({ product, reviews: initialReviews, relatedProducts }: ProductDetailClientProps) {
  const { showToast } = useToast();
  const addItem = useCartStore((state) => state.addItem);

  const toast = React.useCallback(
    ({ description, variant }: { title?: string; description: string; variant?: "success" | "error" | "info" }) => {
      showToast(description, variant || "success");
    },
    [showToast]
  );
  
  // Gallery active index state
  const [activeImageIdx, setActiveImageIdx] = React.useState(0);
  
  // Variant active selection state
  const [selectedVariantIdx, setSelectedVariantIdx] = React.useState(0);
  
  // Quantity selected
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);

  // Touch handlers for mobile swipe gallery
  const [touchStart, setTouchStart] = React.useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const threshold = 50;

    if (!product.images || product.images.length <= 1) return;

    if (diff > threshold) {
      setActiveImageIdx((prev) => (prev + 1) % product.images.length);
    } else if (diff < -threshold) {
      setActiveImageIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
    setTouchStart(null);
  };

  // Tab Selection
  const [activeTab, setActiveTab] = React.useState<"description" | "specifications" | "reviews">("description");

  // Reviews States
  const [reviews, setReviews] = React.useState<Review[]>(initialReviews);
  const [reviewName, setReviewName] = React.useState("");
  const [reviewEmail, setReviewEmail] = React.useState("");
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewComment, setReviewComment] = React.useState("");
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);

  // Computed values based on variant selection
  const activeVariant = product.variants?.[selectedVariantIdx] || null;
  const currentPrice = activeVariant ? activeVariant.price : product.basePrice;
  const comparePrice = product.compareAtPrice;
  const currentSku = activeVariant ? activeVariant.sku : product.SKU;
  const hasVariants = product.variants && product.variants.length > 0;
  const currentStock = activeVariant ? activeVariant.stock : product.stockQuantity;

  // Swatch options
  const colorOptions = hasVariants
    ? product.variants.map((v: any) => v.color || v.name)
    : [];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setQuantity(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedVariantIdx]);

  const handleAddToCart = () => {
    // Check variant stock bounds
    const maxStock = activeVariant ? activeVariant.stock : product.stockQuantity;
    if (maxStock <= 0) {
      toast({
        title: "Out of stock",
        description: "Sorry, this variant is currently out of stock.",
        variant: "error",
      });
      return;
    }

    setIsAdding(true);
    setTimeout(() => {
      addItem({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0]?.url || "/images/gan-charger.png",
        price: currentPrice,
        sku: currentSku,
        variantName: activeVariant ? activeVariant.name : undefined,
        variantColor: activeVariant ? activeVariant.color : undefined,
        maxStock: maxStock,
        quantity: quantity,
      });

      // Verification log
      console.log(`Zustand cart addition dispatched successfully: ${quantity}x ${product.name}`);

      toast({
        title: "Added to Cart",
        description: `${quantity}x ${product.name} added successfully!`,
        variant: "success",
      });
      setIsAdding(false);
    }, 400);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewEmail || !reviewComment) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all the review details.",
        variant: "error",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product._id,
          name: reviewName,
          email: reviewEmail,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      if (response.ok) {
        await response.json();
        toast({
          title: "Review Submitted",
          description: "Thank you! Your review has been submitted for approval.",
          variant: "success",
        });
        
        // Optimistically add review to state
        const newRev: Review = {
          _id: Math.random().toString(),
          name: reviewName,
          rating: reviewRating,
          comment: reviewComment,
          createdAt: new Date().toISOString(),
        };
        setReviews([newRev, ...reviews]);
        
        // Reset form
        setReviewName("");
        setReviewEmail("");
        setReviewRating(5);
        setReviewComment("");
      } else {
        throw new Error("Failed to post review");
      }
    } catch {
      toast({
        title: "Error submitting review",
        description: "Something went wrong. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="w-full">
      {/* Product Detail Grid Layout */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        {/* Photo Gallery (Left 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative aspect-square overflow-hidden rounded-custom-2xl border border-neutral-100 bg-neutral-50 select-none touch-pan-y"
          >
            <Image
              src={product.images?.[activeImageIdx]?.url || "/images/gan-charger.png"}
              alt={product.images?.[activeImageIdx]?.altText || product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-all duration-300"
              priority
            />
          </div>

          {/* Swipe indicator dots for mobile */}
          {product.images && product.images.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-2 lg:hidden">
              {product.images.map((_: any, idx: number) => (
                <div
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    activeImageIdx === idx ? "bg-brand-primary w-3.5" : "bg-neutral-300"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail triggers */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-custom-md border transition-all ${
                    activeImageIdx === idx
                      ? "border-brand-primary ring-2 ring-brand-primary/20"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Configurations Panel (Right 7 Cols) */}
        <div className="mt-8 lg:col-span-7 lg:mt-0 flex flex-col justify-start">
          {/* Tag Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {product.newArrival && <Badge variant="new">New Drop</Badge>}
            {product.bestSeller && <Badge variant="success">Best Seller</Badge>}
            {product.featured && <Badge variant="neutral">Featured</Badge>}
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
            {product.brand}
          </span>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl mb-2">
            {product.name}
          </h1>

          {/* Rating Summary */}
          <div className="flex items-center gap-1.5 mb-5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4.5 w-4.5 fill-current ${
                    i < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 5))
                      ? "text-amber-400"
                      : "text-neutral-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-neutral-500">
              {reviews.length > 0
                ? `(${reviews.length} customer ${reviews.length === 1 ? "review" : "reviews"})`
                : "No reviews yet"}
            </span>
          </div>

          {/* Price */}
          <div className="mb-6 flex items-baseline gap-3 border-b border-neutral-100 pb-5">
            <span className="text-3xl font-extrabold text-neutral-900">${currentPrice.toFixed(2)}</span>
            {comparePrice && comparePrice > currentPrice && (
              <span className="text-lg text-neutral-400 line-through">${comparePrice.toFixed(2)}</span>
            )}
          </div>

          <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Variants Selector Swatches */}
          {hasVariants && (
            <div className="mb-6">
              <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
                Select Variant
              </span>
              <VariantSelector
                options={colorOptions}
                selectedValue={activeVariant ? activeVariant.color || activeVariant.name : ""}
                onChange={(val) => {
                  const idx = product.variants.findIndex((v: any) => (v.color || v.name) === val);
                  if (idx !== -1) setSelectedVariantIdx(idx);
                }}
                type="color"
              />
            </div>
          )}

          {/* Buy actions */}
          <div className="mb-8 border-b border-neutral-100 pb-6 space-y-4">
            <div className="flex items-center gap-4">
              <QuantityStepper value={quantity} onChange={setQuantity} max={currentStock} />
              
              <Button
                onClick={handleAddToCart}
                disabled={currentStock <= 0 || isAdding}
                variant="primary"
                className="flex-1 justify-center gap-2 h-11 text-sm font-semibold shadow-md"
                isLoading={isAdding}
              >
                <ShoppingCart className="h-4 w-4" />
                {currentStock <= 0 ? "Out of Stock" : "Add to Shopping Cart"}
              </Button>
            </div>
            <span className="text-xs text-neutral-400 block">
              {currentStock > 0 ? `⚡ In stock: ${currentStock} units ready to dispatch.` : "❌ Sold out: Check back soon."}
            </span>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-neutral-50 rounded-custom-lg p-3 border border-neutral-100">
              <ShieldCheck className="h-5 w-5 text-brand-primary flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Warranty Protection</h4>
                <p className="text-[10px] text-neutral-500">{product.warrantyInfo || "2-Year official warranty."}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-neutral-50 rounded-custom-lg p-3 border border-neutral-100">
              <Sparkles className="h-5 w-5 text-indigo-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-neutral-900">COD Available</h4>
                <p className="text-[10px] text-neutral-500">{product.shippingInfo || "Cash on delivery nationwide."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specifications, Reviews */}
      <div className="mt-16 border-t border-neutral-100 pt-10">
        <div className="flex border-b border-neutral-200 gap-6">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "description"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-neutral-400 hover:text-neutral-900"
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab("specifications")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "specifications"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-neutral-400 hover:text-neutral-900"
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "reviews"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-neutral-400 hover:text-neutral-900"
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        <div className="py-6">
          {/* Description Tab */}
          {activeTab === "description" && (
            <div className="prose prose-sm prose-neutral max-w-none">
              <p className="text-sm leading-relaxed text-neutral-600 whitespace-pre-line">
                {product.fullDescription}
              </p>
              {product.features && product.features.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-neutral-900 mb-2">Key Features</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-neutral-600">
                    {product.features.map((feature: string, idx: number) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === "specifications" && (
            <div className="max-w-2xl">
              <table className="min-w-full divide-y divide-neutral-100 border border-neutral-100 rounded-custom-lg overflow-hidden">
                <tbody className="divide-y divide-neutral-100">
                  {product.specifications?.map((spec: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-neutral-50/50" : "bg-white"}>
                      <td className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider w-1/3">{spec.key}</td>
                      <td className="px-4 py-3 text-xs font-medium text-neutral-800">{spec.value}</td>
                    </tr>
                  ))}
                  {product.compatibilityInfo && (
                    <tr className="bg-white">
                      <td className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider w-1/3">Compatibility</td>
                      <td className="px-4 py-3 text-xs font-medium text-neutral-800">{product.compatibilityInfo}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Reviews List */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-neutral-900 mb-4">Customer Reviews</h3>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <div key={rev._id} className="border-b border-neutral-100 pb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-neutral-900">{rev.name}</span>
                          <span className="text-[10px] text-neutral-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex text-amber-400 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 fill-current ${
                                i < rev.rating ? "text-amber-400" : "text-neutral-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-neutral-50 rounded-custom-lg border border-dashed border-neutral-200">
                    <MessageSquare className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500">No reviews submitted yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>

              {/* Add Review Form */}
              <div className="bg-neutral-50 rounded-custom-xl p-6 border border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-900 mb-4">Write a Customer Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Your Name</label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full h-9 text-xs rounded-custom-md border border-neutral-200 bg-white px-3 focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Your Email</label>
                      <input
                        type="email"
                        required
                        value={reviewEmail}
                        onChange={(e) => setReviewEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full h-9 text-xs rounded-custom-md border border-neutral-200 bg-white px-3 focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="h-9 text-xs rounded-custom-md border border-neutral-200 bg-white px-2 focus:border-brand-primary focus:outline-none w-32"
                    >
                      <option value={5}>5 Stars (Excellent)</option>
                      <option value={4}>4 Stars (Good)</option>
                      <option value={3}>3 Stars (Average)</option>
                      <option value={2}>2 Stars (Poor)</option>
                      <option value={1}>1 Star (Very Bad)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Review Message</label>
                    <textarea
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      className="w-full text-xs rounded-custom-md border border-neutral-200 bg-white p-3 focus:border-brand-primary focus:outline-none resize-none"
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full h-10" isLoading={isSubmittingReview}>
                    Submit Review
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-neutral-100 pt-12 pb-16">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl mb-8 text-center">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.slice(0, 4).map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky mobile CTA bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-45 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-4 py-3 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Price</span>
          <span className="text-base font-black text-neutral-900">${currentPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 flex-grow max-w-[70%]">
          <QuantityStepper value={quantity} onChange={setQuantity} max={currentStock} />
          <Button
            onClick={handleAddToCart}
            disabled={currentStock <= 0 || isAdding}
            variant="primary"
            className="flex-1 justify-center gap-1.5 h-10 text-xs font-bold uppercase tracking-wider"
            isLoading={isAdding}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {currentStock <= 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
