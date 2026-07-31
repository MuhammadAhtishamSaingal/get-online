import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStoreSettings extends Document {
  announcementText: string;
  shippingFee: number;
  freeShippingThreshold: number;
  vatRate: number;
  contactPhone: string;
  contactEmail: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSettingsSchema: Schema<IStoreSettings> = new Schema(
  {
    announcementText: { type: String, default: "⚡ Free shipping on orders over $50" },
    shippingFee: { type: Number, default: 5 },
    freeShippingThreshold: { type: Number, default: 50 },
    vatRate: { type: Number, default: 0 },
    contactPhone: { type: String, default: "+92 300 1234567" },
    contactEmail: { type: String, default: "support@gizmogrid.com" },
    address: { type: String, default: "GizmoGrid HQ, Lahore, Pakistan" },
  },
  { timestamps: true }
);

const StoreSettings: Model<IStoreSettings> =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);

export default StoreSettings;
