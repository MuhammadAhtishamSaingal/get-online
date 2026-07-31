"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { QuantityStepper } from "./quantity-stepper";
import { VariantSelector } from "./variant-selector";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "./toast";

export interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    shortDescription: string;
    brand: string;
    basePrice: number;
    compareAtPrice?: number;
    stockQuantity: number;
    newArrival?: boolean;
    bestSeller?: boolean;
    featured?: boolean;
    images?: Array<{ url: string; altText?: string }>;
    variants?: Array<{
      name: string;
      color?: string;
      size?: string;
      sku: string;
      price: number;
      stock: number;
    }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { showToast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedVariantIdx, setSelectedVariantIdx] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);

  // Get active variant or use product base specs
  const hasVariants = product.variants && product.variants.length > 0;
  const activeVariant = hasVariants ? product.variants![selectedVariantIdx] : null;

  const currentPrice = activeVariant ? activeVariant.price : product.basePrice;
  const comparePrice = product.compareAtPrice;
  const currentStock = activeVariant ? activeVariant.stock : product.stockQuantity;
  const currentSku = activeVariant ? activeVariant.sku : product._id;

  // Swatch options
  const colorOptions = hasVariants
    ? product.variants!.map((v) => v.color || v.name)
    : [];

  // Reset quantity when variant changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setQuantity(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedVariantIdx]);

  const handleAddToCart = () => {
    if (currentStock <= 0) {
      showToast("Sorry, this variant is currently out of stock.", "error");
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
        maxStock: currentStock,
        quantity: quantity,
      });

      showToast(
        `${quantity}x ${product.name} ${
          activeVariant ? `(${activeVariant.name})` : ""
        } added successfully!`,
        "success"
      );
      setIsAdding(false);
    }, 500);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-custom-xl border border-neutral-100 bg-white shadow-sm product-card-hover">
      {/* Badge Tags */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.newArrival && <Badge variant="new">New</Badge>}
        {product.bestSeller && <Badge variant="success">Best Seller</Badge>}
        {comparePrice && comparePrice > currentPrice && (
          <Badge variant="sale" className="bg-red-50 text-red-600 border-red-200 font-bold">
            Sale
          </Badge>
        )}
      </div>

      {/* Product Image Link */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square block w-full overflow-hidden bg-neutral-50">
        <Image
          src={product.images?.[0]?.url || "/images/gan-charger.png"}
          alt={product.images?.[0]?.altText || product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover product-card-zoom-img"
          priority={false}
        />
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
          {product.brand}
        </div>
        
        <Link
          href={`/products/${product.slug}`}
          className="mb-1 text-sm font-semibold tracking-tight text-neutral-900 line-clamp-1 group-hover:text-brand-primary transition-colors focus-visible:outline-none"
        >
          {product.name}
        </Link>
        
        <p className="mb-3 text-xs text-neutral-500 line-clamp-2 min-h-[2rem]">
          {product.shortDescription}
        </p>

        {/* Pricing Area */}
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-base font-bold text-neutral-900">${currentPrice.toFixed(2)}</span>
          {comparePrice && comparePrice > currentPrice && (
            <span className="text-xs text-neutral-400 line-through">${comparePrice.toFixed(2)}</span>
          )}
        </div>

        {/* Variants list selector */}
        {hasVariants && (
          <div className="mb-4">
            <div className="mb-1.5 text-[10px] font-medium text-neutral-400">Variant</div>
            <VariantSelector
              options={colorOptions}
              selectedValue={activeVariant ? activeVariant.color || activeVariant.name : ""}
              onChange={(val) => {
                const idx = product.variants!.findIndex((v) => (v.color || v.name) === val);
                if (idx !== -1) setSelectedVariantIdx(idx);
              }}
              type="color"
            />
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-medium text-neutral-400">
              {currentStock > 0 ? `${currentStock} items left` : "Out of stock"}
            </span>
            {currentStock > 0 && (
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={currentStock}
              />
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={currentStock <= 0 || isAdding}
            variant={currentStock <= 0 ? "outline" : "primary"}
            className="w-full justify-center gap-2 h-9 text-xs"
            isLoading={isAdding}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {currentStock <= 0 ? "Sold Out" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
