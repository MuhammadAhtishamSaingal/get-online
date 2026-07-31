import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  price: number;
  qty: number;
  variant?: string;
}

export interface IShippingAddress {
  country: string;
  province: string;
  city: string;
  area: string;
  houseFlatOffice: string;
  street: string;
  landmark?: string;
  postalCode?: string;
}

export interface IOrderTracking {
  courier?: string;
  trackingNumber?: string;
  status?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: "CASH_ON_DELIVERY" | "BANK_TRANSFER" | "JAZZCASH" | "EASYPAISA";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  orderStatus:
    | "NEW"
    | "AWAITING_CONFIRMATION"
    | "CONFIRMED"
    | "PACKED"
    | "DISPATCHED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED"
    | "REFUNDED";
  notes?: string;
  deliveryInstructions?: string;
  couponCode?: string;
  tracking: IOrderTracking;
  emailStatus: {
    adminNotified: boolean;
    customerConfirmed: boolean;
  };
  // Manual Payment Info
  paymentDetails?: {
    method?: string;
    transactionRef?: string;
    senderAccount?: string;
    screenshotUrl?: string;
    screenshotPublicId?: string;
  };
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  variant: { type: String },
});

const ShippingAddressSchema = new Schema({
  country: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  houseFlatOffice: { type: String, required: true },
  street: { type: String, required: true },
  landmark: { type: String },
  postalCode: { type: String },
});

const OrderTrackingSchema = new Schema({
  courier: { type: String },
  trackingNumber: { type: String },
  status: { type: String },
});

const OrderSchema: Schema<IOrder> = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true, index: true },
      phone: { type: String, required: true, index: true },
    },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["CASH_ON_DELIVERY", "BANK_TRANSFER", "JAZZCASH", "EASYPAISA"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"],
      default: "PENDING",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "NEW",
        "AWAITING_CONFIRMATION",
        "CONFIRMED",
        "PACKED",
        "DISPATCHED",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
        "REFUNDED",
      ],
      default: "NEW",
      index: true,
    },
    notes: { type: String },
    deliveryInstructions: { type: String },
    couponCode: { type: String },
    tracking: { type: OrderTrackingSchema, default: {} },
    emailStatus: {
      adminNotified: { type: Boolean, default: false },
      customerConfirmed: { type: Boolean, default: false },
    },
    paymentDetails: {
      method: { type: String },
      transactionRef: { type: String },
      senderAccount: { type: String },
      screenshotUrl: { type: String },
      screenshotPublicId: { type: String },
    },
    idempotencyKey: { type: String, unique: true, sparse: true, index: true },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
