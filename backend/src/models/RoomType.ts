import mongoose, { Schema, Document } from "mongoose";

export type RoomSmallStatus = "available" | "occupied" | "maintenance" | "inactive";
export type RoomTypeStatus = "active" | "inactive";

export interface IRoomSmall {
  code: string;                
  status?: RoomSmallStatus;    
  images?: string[];           
}

export interface IRoomType extends Document {
  type: string;               
  description?: string;
  capacity?: number;
  bedType?: string;
  pricePerNight?: number;
  amenities?: string[];
  images?: string[];
  status?: RoomTypeStatus;
  rooms: IRoomSmall[];      
}

const roomSmallSchema = new Schema<IRoomSmall>(
  {
    code: { type: String, required: true },
    status: { type: String, enum: ["available", "occupied", "maintenance", "inactive"], default: "available" },
    images: [{ type: String }]
  },
  { _id: false }
);

const roomTypeSchema = new Schema<IRoomType>(
  {
    type: { type: String, required: true, unique: true },
    description: String,
    capacity: Number,
    bedType: String,
    pricePerNight: Number,
    amenities: [{ type: String }],
    images: [{ type: String }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    rooms: { type: [roomSmallSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model<IRoomType>("RoomType", roomTypeSchema);
