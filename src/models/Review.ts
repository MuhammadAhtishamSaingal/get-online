import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  name: string;
  email: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    approved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
