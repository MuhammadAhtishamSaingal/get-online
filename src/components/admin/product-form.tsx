"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check
} from "lucide-react";

interface ImageAsset {
  url: string;
  publicId: string;
  altText?: string;
  order: number;
}

interface Variant {
  name: string;
  color?: string;
  sku: string;
  price: number;
  stock: number;
}

interface Specification {
  key: string;
  value: string;
}

interface ProductFormProps {
  initialData?: any;
  categories: any[];
  onSave: (data: any) => Promise<void>;
  isSaving: boolean;
}

export function ProductForm({
  initialData,
  categories,
  onSave,
  isSaving,
}: ProductFormProps) {
  const { showToast } = useToast();

  // Tab State
  const [activeTab, setActiveTab] = React.useState<
    "general" | "pricing" | "media" | "variants" | "seo"
  >("general");

  // Form states
  const [name, setName] = React.useState(initialData?.name || "");
  const [slug, setSlug] = React.useState(initialData?.slug || "");
  const [brand, setBrand] = React.useState(initialData?.brand || "");
  const [category, setCategory] = React.useState(
    initialData?.category?._id || initialData?.category || ""
  );
  const [shortDescription, setShortDescription] = React.useState(
    initialData?.shortDescription || ""
  );
  const [fullDescription, setFullDescription] = React.useState(
    initialData?.fullDescription || ""
  );
  const [status, setStatus] = React.useState(initialData?.status || "draft");

  // Flags
  const [featured, setFeatured] = React.useState(!!initialData?.featured);
  const [bestSeller, setBestSeller] = React.useState(!!initialData?.bestSeller);
  const [newArrival, setNewArrival] = React.useState(!!initialData?.newArrival);

  // Pricing & Inventory
  const [basePrice, setBasePrice] = React.useState(
    initialData?.basePrice?.toString() || ""
  );
  const [compareAtPrice, setCompareAtPrice] = React.useState(
    initialData?.compareAtPrice?.toString() || ""
  );
  const [costPrice, setCostPrice] = React.useState(
    initialData?.costPrice?.toString() || ""
  );
  const [stockQuantity, setStockQuantity] = React.useState(
    initialData?.stockQuantity?.toString() || "0"
  );
  const [lowStockThreshold, setLowStockThreshold] = React.useState(
    initialData?.lowStockThreshold?.toString() || "5"
  );
  const [SKU, setSKU] = React.useState(initialData?.SKU || "");
  const [barcode, setBarcode] = React.useState(initialData?.barcode || "");

  // Arrays
  const [images, setImages] = React.useState<ImageAsset[]>(
    initialData?.images || []
  );
  const [variants, setVariants] = React.useState<Variant[]>(
    initialData?.variants || []
  );
  const [specifications, setSpecifications] = React.useState<Specification[]>(
    initialData?.specifications || []
  );
  const [features, setFeatures] = React.useState<string[]>(
    initialData?.features || []
  );
  const [tagsInput, setTagsInput] = React.useState(
    initialData?.tags?.join(", ") || ""
  );

  // Policies
  const [compatibilityInfo, setCompatibilityInfo] = React.useState(
    initialData?.compatibilityInfo || ""
  );
  const [warrantyInfo, setWarrantyInfo] = React.useState(
    initialData?.warrantyInfo || ""
  );
  const [shippingInfo, setShippingInfo] = React.useState(
    initialData?.shippingInfo || ""
  );

  // SEO
  const [seoTitle, setSeoTitle] = React.useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = React.useState(
    initialData?.seoDescription || ""
  );

  // Upload state
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-generate slug from name in creation mode
  React.useEffect(() => {
    if (!initialData?._id) {
      const timer = setTimeout(() => {
        setSlug(
          name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [name, initialData]);

  // Image upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    showToast(`Uploading ${file.name}...`, "info");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const newImg: ImageAsset = {
          url: data.url,
          publicId: data.publicId,
          altText: name,
          order: images.length,
        };
        setImages((prev) => [...prev, newImg]);
        showToast("Image uploaded successfully!", "success");
      } else {
        showToast(data.error || "Failed to upload image.", "error");
      }
    } catch {
      showToast("Network failure during image upload.", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async (publicId: string) => {
    // Optimistically remove from state
    setImages((prev) => prev.filter((img) => img.publicId !== publicId));
    showToast("Image removed from listing queue.", "info");
  };

  const handleMoveImage = (idx: number, direction: "up" | "down") => {
    const newImgs = [...images];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newImgs.length) return;

    // Swap order property
    const temp = newImgs[idx];
    newImgs[idx] = newImgs[targetIdx];
    newImgs[targetIdx] = temp;

    // Re-index order property
    const finalImgs = newImgs.map((img, i) => ({ ...img, order: i }));
    setImages(finalImgs);
  };

  // Spec handlers
  const handleAddSpec = () => {
    setSpecifications((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleSpecChange = (idx: number, field: "key" | "value", val: string) => {
    const newSpecs = [...specifications];
    newSpecs[idx][field] = val;
    setSpecifications(newSpecs);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== idx));
  };

  // Variant handlers
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { name: "", color: "", sku: `${SKU}-V${prev.length + 1}`, price: Number(basePrice) || 0, stock: 10 },
    ]);
  };

  const handleVariantChange = (idx: number, field: keyof Variant, val: any) => {
    const newVariants = [...variants];
    newVariants[idx] = {
      ...newVariants[idx],
      [field]: field === "price" || field === "stock" ? Number(val) || 0 : val,
    };
    setVariants(newVariants);
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  // Feature Bullet handlers
  const handleAddFeature = () => {
    setFeatures((prev) => [...prev, ""]);
  };

  const handleFeatureChange = (idx: number, val: string) => {
    const newFeats = [...features];
    newFeats[idx] = val;
    setFeatures(newFeats);
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !basePrice || !category) {
      showToast("Please fill in all general required fields.", "error");
      setActiveTab("general");
      return;
    }

    const payload = {
      _id: initialData?._id,
      name,
      slug,
      brand,
      category,
      shortDescription,
      fullDescription,
      status,
      featured,
      bestSeller,
      newArrival,
      basePrice: Number(basePrice),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      costPrice: costPrice ? Number(costPrice) : undefined,
      stockQuantity: Number(stockQuantity) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      SKU,
      barcode,
      images,
      variants,
      specifications,
      features: features.filter((f) => f.trim() !== ""),
      tags: tagsInput
        .split(",")
        .map((t: string) => t.trim())
        .filter((t: string) => t !== ""),
      compatibilityInfo,
      warrantyInfo,
      shippingInfo,
      seoTitle,
      seoDescription,
    };

    onSave(payload);
  };

  const tabClass = (tab: typeof activeTab) =>
    `pb-3 text-xs font-bold border-b-2 uppercase tracking-wider transition-all focus:outline-none ${
      activeTab === tab
        ? "border-brand-primary text-brand-primary font-black"
        : "border-transparent text-neutral-400 hover:text-neutral-900"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Dynamic Tabs Navigation Bar */}
      <div className="flex border-b border-neutral-200 gap-6">
        <button type="button" onClick={() => setActiveTab("general")} className={tabClass("general")}>
          General
        </button>
        <button type="button" onClick={() => setActiveTab("pricing")} className={tabClass("pricing")}>
          Pricing &amp; Stock
        </button>
        <button type="button" onClick={() => setActiveTab("media")} className={tabClass("media")}>
          Media Gallery
        </button>
        <button type="button" onClick={() => setActiveTab("variants")} className={tabClass("variants")}>
          Variants &amp; Specs
        </button>
        <button type="button" onClick={() => setActiveTab("seo")} className={tabClass("seo")}>
          SEO Settings
        </button>
      </div>

      {/* Tabs Content */}
      <div className="bg-white p-6 sm:p-8 rounded-custom-2xl border border-neutral-200 shadow-sm">
        {/* Tab 1: General Info */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SonicWave Buds Pro"
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Slug (URL Handle) *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. sonicwave-buds-pro"
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. SonicWave"
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Category *
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 font-medium text-neutral-800 focus:border-brand-primary focus:outline-none"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                Short Description (1-2 sentences) *
              </label>
              <input
                type="text"
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary displayed on cards..."
                className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                Full Description
              </label>
              <textarea
                rows={6}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Write HTML or plain text catalog specs details..."
                className="w-full text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 p-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none resize-none"
              />
            </div>

            {/* Checkbox Flags */}
            <div className="space-y-3 border-t border-neutral-100 pt-5">
              <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                Spotlight Flags
              </span>
              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4 w-4 rounded-custom-md border-neutral-300 text-brand-primary focus:ring-brand-primary"
                  />
                  Featured Innovation
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bestSeller}
                    onChange={(e) => setBestSeller(e.target.checked)}
                    className="h-4 w-4 rounded-custom-md border-neutral-300 text-brand-primary focus:ring-brand-primary"
                  />
                  Best Seller Spot
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newArrival}
                    onChange={(e) => setNewArrival(e.target.checked)}
                    className="h-4 w-4 rounded-custom-md border-neutral-300 text-brand-primary focus:ring-brand-primary"
                  />
                  New Arrival Tag
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pricing & Inventory */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Base Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="249.00"
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Compare At Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="299.00"
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Cost Price ($) (Admin Only)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="120.00"
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  required
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Listing Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-white px-3 font-medium text-neutral-800 focus:border-brand-primary focus:outline-none"
                >
                  <option value="draft">Draft (Hidden)</option>
                  <option value="active">Active (Visible)</option>
                  <option value="archived">Archived (Archived)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-neutral-100 pt-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  SKU Code *
                </label>
                <input
                  type="text"
                  required
                  value={SKU}
                  onChange={(e) => setSKU(e.target.value)}
                  placeholder="e.g. GG-SW-BUDS"
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                  Barcode (UPC/EAN)
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="e.g. 712345678901"
                  className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 border-t border-neutral-100 pt-5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="audio, wireless, noise-cancelling"
                className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Media Gallery */}
        {activeTab === "media" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Product Images
                </h4>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Upload multiple WEBP, JPG, or PNG files. Order is determined by position. Top image is primary.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                variant="outline"
                className="h-10 text-xs font-bold gap-1.5 border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>

            {/* Images Grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {images.map((img, idx) => (
                  <div
                    key={img.publicId}
                    className="relative group aspect-square rounded-custom-xl border border-neutral-200 bg-neutral-50 overflow-hidden flex flex-col items-center justify-center shadow-sm"
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                    
                    {/* Primary Badge overlay */}
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 z-10 bg-brand-primary text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Check className="h-2.5 w-2.5" /> Primary
                      </div>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5 z-20">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.publicId)}
                          className="p-1 bg-red-600 text-white rounded-custom-md hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, "up")}
                          className="p-1 bg-white/20 text-white rounded-custom-md hover:bg-white/30 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={() => handleMoveImage(idx, "down")}
                          className="p-1 bg-white/20 text-white rounded-custom-md hover:bg-white/30 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-neutral-200 rounded-custom-2xl py-12 text-center text-xs text-neutral-400">
                No images uploaded yet. Primary default placeholders will apply.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Variants & Specifications */}
        {activeTab === "variants" && (
          <div className="space-y-10">
            {/* Variants Configurator */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Product Variants
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Define sizes, colors, connector pins, or specs (overrides pricing and stocks).
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleAddVariant}
                  variant="outline"
                  className="h-8 text-xs font-bold gap-1 px-3 border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Variant
                </Button>
              </div>

              {variants.length > 0 ? (
                <div className="space-y-3.5">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 bg-neutral-50 rounded-custom-xl border border-neutral-200 items-end"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">Variant Name</span>
                        <input
                          type="text"
                          required
                          value={v.name}
                          onChange={(e) => handleVariantChange(idx, "name", e.target.value)}
                          placeholder="e.g. Space Grey"
                          className="w-full h-8 text-xs rounded-custom-lg border border-neutral-200 bg-white px-2 focus:border-brand-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">Color / Hex Value</span>
                        <input
                          type="text"
                          value={v.color || ""}
                          onChange={(e) => handleVariantChange(idx, "color", e.target.value)}
                          placeholder="e.g. Space Grey"
                          className="w-full h-8 text-xs rounded-custom-lg border border-neutral-200 bg-white px-2 focus:border-brand-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">Variant SKU</span>
                        <input
                          type="text"
                          required
                          value={v.sku}
                          onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                          className="w-full h-8 text-xs rounded-custom-lg border border-neutral-200 bg-white px-2 focus:border-brand-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">Price</span>
                          <input
                            type="number"
                            required
                            value={v.price}
                            onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                            className="w-full h-8 text-xs rounded-custom-lg border border-neutral-200 bg-white px-2 focus:border-brand-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">Stock</span>
                          <input
                            type="number"
                            required
                            value={v.stock}
                            onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                            className="w-full h-8 text-xs rounded-custom-lg border border-neutral-200 bg-white px-2 focus:border-brand-primary focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pb-0.5">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="h-8 px-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-custom-lg border border-red-200 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-neutral-400">
                  This product has no active color or size variations.
                </div>
              )}
            </div>

            {/* Specifications Configurator */}
            <div className="space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Technical Specifications
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Define technical fields (e.g. Battery Life, Port compatibility, weights).
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleAddSpec}
                  variant="outline"
                  className="h-8 text-xs font-bold gap-1 px-3 border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Field
                </Button>
              </div>

              {specifications.length > 0 ? (
                <div className="space-y-3">
                  {specifications.map((spec, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="text"
                        required
                        value={spec.key}
                        onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                        placeholder="Specification Parameter (e.g. Length)"
                        className="w-1/3 h-8 text-xs rounded-custom-lg border border-neutral-200 bg-neutral-50 px-2.5 focus:border-brand-primary focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        value={spec.value}
                        onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                        placeholder="Specification Value (e.g. 2 Meters)"
                        className="flex-1 h-8 text-xs rounded-custom-lg border border-neutral-200 bg-neutral-50 px-2.5 focus:border-brand-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-custom-lg border border-red-200 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-neutral-400">
                  No specifications registered.
                </div>
              )}
            </div>

            {/* Key Features Bullet Points */}
            <div className="space-y-4 pt-6 border-t border-neutral-100">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Key Highlight Features
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Provide bullet highlights of main features (e.g. Water resistant, GaN Tech).
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleAddFeature}
                  variant="outline"
                  className="h-8 text-xs font-bold gap-1 px-3 border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Highlight
                </Button>
              </div>

              {features.length > 0 ? (
                <div className="space-y-3">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="text"
                        required
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        placeholder="Highlight (e.g. Double-braided safe protection)"
                        className="flex-1 h-8 text-xs rounded-custom-lg border border-neutral-200 bg-neutral-50 px-2.5 focus:border-brand-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-custom-lg border border-red-200 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-neutral-400">
                  No highlighted bullet points.
                </div>
              )}
            </div>

            {/* Extra Policies & Support */}
            <div className="space-y-4 pt-6 border-t border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Support &amp; Warranty Guidelines
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                    Compatibility Info
                  </label>
                  <input
                    type="text"
                    value={compatibilityInfo}
                    onChange={(e) => setCompatibilityInfo(e.target.value)}
                    placeholder="e.g. iOS & Android devices"
                    className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                    Warranty Info
                  </label>
                  <input
                    type="text"
                    value={warrantyInfo}
                    onChange={(e) => setWarrantyInfo(e.target.value)}
                    placeholder="e.g. 2-Year official warranty"
                    className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                    Shipping Policy Override
                  </label>
                  <input
                    type="text"
                    value={shippingInfo}
                    onChange={(e) => setShippingInfo(e.target.value)}
                    placeholder="e.g. Ships next day"
                    className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: SEO Parameters */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                SEO Search Title Tag
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Title tag displayed on Google search results..."
                className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                SEO Meta Description Tag
              </label>
              <textarea
                rows={4}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Brief snippet detailing product specifications for search ranking indexes..."
                className="w-full text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 p-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action CTA Buttons */}
      <div className="flex items-center justify-end gap-3.5 bg-neutral-50 border border-neutral-200 p-5 rounded-custom-2xl shadow-sm">
        <Link href="/admin/products">
          <Button
            type="button"
            variant="outline"
            className="h-10 text-xs font-bold uppercase tracking-wider border-neutral-200 text-neutral-600 hover:bg-white hover:text-neutral-900"
          >
            Discard
          </Button>
        </Link>
        <Button
          type="submit"
          variant="primary"
          className="h-10 text-xs font-bold uppercase tracking-wider shadow-sm"
          isLoading={isSaving}
        >
          {initialData?._id ? "Save Modifications" : "Register Product"}
        </Button>
      </div>
    </form>
  );
}
