import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductImage {
  url: string;
  publicId: string;
  altText?: string;
  order: number;
}

export interface IProductVariant {
  name: string; // e.g. "Phantom Black" or "M / Black"
  color?: string;
  size?: string;
  sku: string;
  price: number;
  stock: number;
}

export interface IProductSpecification {
  key: string;
  value: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: mongoose.Types.ObjectId;
  brand: string;
  basePrice: number;
  compareAtPrice?: number;
  costPrice: number; // admin-only
  SKU: string;
  barcode?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  status: "draft" | "active" | "archived";
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  tags: string[];
  specifications: IProductSpecification[];
  features: string[];
  compatibilityInfo?: string;
  warrantyInfo?: string;
  shippingInfo?: string;
  images: IProductImage[];
  variants: IProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  altText: { type: String },
  order: { type: Number, default: 0 },
});

const ProductVariantSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String },
  size: { type: String },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
});

const ProductSpecificationSchema = new Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    brand: { type: String, required: true, trim: true },
    basePrice: { type: Number, required: true },
    compareAtPrice: { type: Number },
    costPrice: { type: Number, required: true },
    SKU: { type: String, required: true, unique: true, index: true },
    barcode: { type: String },
    stockQuantity: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, required: true, default: 5 },
    status: { type: String, enum: ["draft", "active", "archived"], default: "active", index: true },
    featured: { type: Boolean, default: false, index: true },
    bestSeller: { type: Boolean, default: false, index: true },
    newArrival: { type: Boolean, default: false, index: true },
    tags: [{ type: String }],
    specifications: [ProductSpecificationSchema],
    features: [{ type: String }],
    compatibilityInfo: { type: String },
    warrantyInfo: { type: String },
    shippingInfo: { type: String },
    images: [ProductImageSchema],
    variants: [ProductVariantSchema],
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
