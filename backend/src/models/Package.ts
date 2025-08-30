import mongoose, { Schema, Document } from "mongoose";

export interface IPackage extends Document {
  name: string;
  description?: string;
  price?: number;
  discountPercent?: number;
  validFrom?: Date;
  validTo?: Date;
  active?: boolean;
}

const packageSchema = new Schema<IPackage>(
  {
    name: { type: String, required: true },
    description: String,
    price: Number,
    discountPercent: Number,
    validFrom: Date,
    validTo: Date,
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<IPackage>("Package", packageSchema);
