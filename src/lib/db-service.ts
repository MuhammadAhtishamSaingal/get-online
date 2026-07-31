import connectDB from "./mongodb";
import Category from "../models/Category";
import Product from "../models/Product";
import Order from "../models/Order";
import Review from "../models/Review";
import Admin from "../models/Admin";
import StoreSettings from "../models/StoreSettings";
import mongoose from "mongoose";

function isValidObjectId(id: any): boolean {
  if (!id) return false;
  if (id instanceof mongoose.Types.ObjectId) return true;
  const str = String(id);
  return str.length === 24 && /^[0-9a-fA-F]{24}$/.test(str);
}

// Service Methods
export const DbService = {
  // Categories
  async getCategories(): Promise<any[]> {
    await connectDB();
    return await Category.find({}).sort({ order: 1 }).lean();
  },

  async getCategoryBySlug(slug: string): Promise<any> {
    await connectDB();
    return await Category.findOne({ slug }).lean();
  },

  async saveCategory(categoryData: any): Promise<any> {
    await connectDB();
    const idStr = categoryData._id ? String(categoryData._id) : "";
    if (idStr && isValidObjectId(idStr)) {
      return await Category.findByIdAndUpdate(idStr, categoryData, { new: true });
    }
    if (categoryData._id) {
      delete categoryData._id;
    }
    return await Category.create(categoryData);
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    await connectDB();
    const res = await Category.findByIdAndDelete(String(id));
    return !!res;
  },

  // Products
  async getProducts(filter: Record<string, any> = {}): Promise<any[]> {
    await connectDB();
    return await Product.find(filter).sort({ createdAt: -1 }).lean();
  },

  async getProductBySlug(slug: string): Promise<any> {
    await connectDB();
    return await Product.findOne({ slug }).populate("category").lean();
  },

  async getProductById(id: string): Promise<any> {
    if (!isValidObjectId(id)) return null;
    await connectDB();
    return await Product.findById(String(id)).lean();
  },

  async saveProduct(productData: any): Promise<any> {
    await connectDB();
    const idStr = productData._id ? String(productData._id) : "";
    if (idStr && isValidObjectId(idStr)) {
      return await Product.findByIdAndUpdate(idStr, productData, { new: true });
    }
    if (productData._id) {
      delete productData._id;
    }
    return await Product.create(productData);
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    await connectDB();
    const res = await Product.findByIdAndDelete(String(id));
    return !!res;
  },

  // Orders
  async getOrders(filter: Record<string, any> = {}): Promise<any[]> {
    await connectDB();
    return await Order.find(filter).sort({ createdAt: -1 }).lean();
  },

  async getOrderByNumber(orderNumber: string): Promise<any> {
    await connectDB();
    return await Order.findOne({ orderNumber }).populate("items.product").lean();
  },

  async getOrderById(id: string): Promise<any> {
    if (!isValidObjectId(id)) return null;
    await connectDB();
    return await Order.findById(String(id)).populate("items.product").lean();
  },

  async saveOrder(orderData: any): Promise<any> {
    await connectDB();
    const idStr = orderData._id ? String(orderData._id) : "";
    if (idStr && isValidObjectId(idStr)) {
      return await Order.findByIdAndUpdate(idStr, orderData, { new: true });
    }
    if (orderData._id) {
      delete orderData._id;
    }
    return await Order.create(orderData);
  },

  // Reviews
  async getReviews(productId?: string): Promise<any[]> {
    await connectDB();
    const query = (productId && isValidObjectId(productId)) ? { product: String(productId) } : {};
    return await Review.find(query).sort({ createdAt: -1 }).lean();
  },

  async saveReview(reviewData: any): Promise<any> {
    await connectDB();
    if (reviewData.product && !isValidObjectId(reviewData.product)) {
      delete reviewData.product;
    }
    return await Review.create(reviewData);
  },

  async updateReview(reviewId: string, updateData: any): Promise<any> {
    if (!isValidObjectId(reviewId)) return null;
    await connectDB();
    return await Review.findByIdAndUpdate(String(reviewId), updateData, { new: true });
  },

  async deleteReview(reviewId: string): Promise<boolean> {
    if (!isValidObjectId(reviewId)) return false;
    await connectDB();
    const res = await Review.findByIdAndDelete(String(reviewId));
    return !!res;
  },

  // Admin Verification
  async getAdminByEmail(email: string): Promise<any> {
    await connectDB();
    return await Admin.findOne({ email }).lean();
  },

  // Store Settings
  async getStoreSettings(): Promise<any> {
    await connectDB();
    const settings = await StoreSettings.findOne({}).lean();
    if (settings) return settings;
    return {
      announcementText: "⚡ Free shipping on orders over $50 | COD Nationwide",
      shippingFee: 5,
      freeShippingThreshold: 50,
      vatRate: 0,
      contactPhone: "+92 300 1234567",
      contactEmail: "support@gizmogrid.com",
      address: "GizmoGrid HQ, Lahore, Pakistan",
    };
  },

  async saveStoreSettings(settingsData: any): Promise<any> {
    await connectDB();
    return await StoreSettings.findOneAndUpdate({}, settingsData, { new: true, upsert: true });
  },
};
