import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: "admin" | "superadmin";
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
  },
  { timestamps: true }
);

const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
