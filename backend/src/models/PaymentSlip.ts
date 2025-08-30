import mongoose, { Schema, Document } from "mongoose";

export type SlipStatus = "SUBMITTED" | "APPROVED" | "REJECTED";

export interface IPaymentSlip extends Document {
  booking: Schema.Types.ObjectId;
  slipImage: string;
  amount?: number;
  status?: SlipStatus;
  rejectionReason?: string;
}

const slipSchema = new Schema<IPaymentSlip>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    slipImage: { type: String, required: true },
    amount: Number,
    status: { type: String, enum: ["SUBMITTED", "APPROVED", "REJECTED"], default: "SUBMITTED" },
    rejectionReason: String
  },
  { timestamps: true }
);

export default mongoose.model<IPaymentSlip>("PaymentSlip", slipSchema);
