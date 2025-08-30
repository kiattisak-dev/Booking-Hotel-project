import { Request, Response } from "express";
import Booking from "../models/Booking";
import RoomType from "../models/RoomType";

// GET /api/bookings (admin overview)
export const getBookings = async (_req: Request, res: Response) => {
  const list = await Booking.find().populate("user").populate("roomTypeId");
  res.json(list);
};

// POST /api/bookings (USER/ADMIN)
export const createBooking = async (req: Request, res: Response) => {
  const body = req.body;
  const booking = await Booking.create(body);
  res.status(201).json(booking);
};

// PATCH /api/bookings/:id
export const updateBookingStatus = async (req: Request, res: Response) => {
  const { status, paymentStatus } = req.body;
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { ...(status && { status }), ...(paymentStatus && { paymentStatus }) },
    { new: true }
  );
  res.json(booking);
};

// OPTIONAL: auto-assign empty from roomType 
export const assignRoomCode = async (req: Request, res: Response) => {
  const { id } = req.params; // booking id
  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const roomType = await RoomType.findById(booking.roomTypeId);
  if (!roomType) return res.status(404).json({ message: "RoomType not found" });

  // find first available
  const available = roomType.rooms.find((r) => r.status === "available");
  if (!available) return res.status(409).json({ message: "No available rooms" });

  booking.roomCode = available.code;
  booking.status = "CONFIRMED";
  available.status = "occupied"; 
  await booking.save();
  await roomType.save();

  res.json(booking);
};
