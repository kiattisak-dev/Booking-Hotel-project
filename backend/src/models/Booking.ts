import mongoose, { Schema, Document } from "mongoose";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED";

export interface IBooking extends Document {
  user: Schema.Types.ObjectId;   
  roomTypeId: Schema.Types.ObjectId; 
  roomCode?: string;              
  checkIn: Date;
  checkOut: Date;
  guests?: number;
  totalAmount?: number;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roomTypeId: { type: Schema.Types.ObjectId, ref: "RoomType", required: true },
    roomCode: String,
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: Number,
    totalAmount: Number,
    status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"], default: "PENDING" },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "REFUNDED"], default: "PENDING" }
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", bookingSchema);
