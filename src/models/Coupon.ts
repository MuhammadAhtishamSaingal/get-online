import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoin extends Document {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: Date;
  active: boolean;
  usageLimit?: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema<ICoin> = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    expiryDate: { type: Date, required: true },
    active: { type: Boolean, default: true, index: true },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Coupon: Model<ICoin> =
  mongoose.models.Coupon || mongoose.model<ICoin>("Coupon", CouponSchema);

export default Coupon;
