import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  address?: {
    country: string;
    province: string;
    city: string;
    area: string;
    houseFlatOffice: string;
    street: string;
    postalCode?: string;
  };
  orders: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema<ICustomer> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    phone: { type: String, required: true, index: true },
    address: {
      country: String,
      province: String,
      city: String,
      area: String,
      houseFlatOffice: String,
      street: String,
      postalCode: String,
    },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  },
  { timestamps: true }
);

const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
