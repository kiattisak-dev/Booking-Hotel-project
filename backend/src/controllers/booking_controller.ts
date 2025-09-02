import { Request, Response } from "express";
import Booking from "../models/Booking";
import RoomType from "../models/RoomType";
import PaymentSlip from "../models/PaymentSlip";

export const getBookings = async (_req: Request, res: Response) => {
  const list = await Booking.find().populate("user").populate("roomTypeId");
  res.json(list);
};

export const createBooking = async (req: Request, res: Response) => {
  const { roomTypeId, roomId, checkIn, checkOut, guests, contactDetails } =
    req.body as any;
  const rtId = roomTypeId || roomId;
  if (!rtId) return res.status(400).json({ message: "roomTypeId is required" });

  const userId = (req as any).user?._id || (req as any).user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  if (!checkIn || !checkOut)
    return res
      .status(400)
      .json({ message: "checkIn and checkOut are required" });
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return res.status(400).json({ message: "Invalid dates" });
  }

  const rt = await RoomType.findById(rtId);
  if (!rt) return res.status(404).json({ message: "RoomType not found" });

  const booking = await Booking.create({
    roomTypeId: rt._id,
    user: userId,
    checkIn: start,
    checkOut: end,
    guests: typeof guests === "number" ? guests : Number(guests) || 1,
    status: "PENDING",
    paymentStatus: "PENDING",
    contactDetails: contactDetails || {},
  });

  res.status(201).json({ ...booking.toObject(), id: String(booking._id) });
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  const { status, paymentStatus } = req.body as any;
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { ...(status && { status }), ...(paymentStatus && { paymentStatus }) },
    { new: true }
  );
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
};

export const assignRoomCode = async (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const roomType = await RoomType.findById(booking.roomTypeId);
  if (!roomType) return res.status(404).json({ message: "RoomType not found" });

  const available = roomType.rooms.find((r) => r.status === "available");
  if (!available)
    return res.status(409).json({ message: "No available rooms" });

  booking.roomCode = available.code;
  booking.status = "CONFIRMED";
  available.status = "occupied";
  await booking.save();
  await roomType.save();

  res.json(booking);
};

export const getMyBookings = async (req: Request, res: Response) => {
  const userId = (req as any).user?._id || (req as any).user?.id;

  const list = await Booking.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("roomTypeId")
    .lean();

  const ids = list.map((b: any) => b._id);
  const slips = await PaymentSlip.find({ booking: { $in: ids } })
    .sort({ createdAt: -1 })
    .lean();

  const latestSlipByBooking = new Map<string, any>();
  for (const s of slips) {
    const k = String(s.booking);
    if (!latestSlipByBooking.has(k)) latestSlipByBooking.set(k, s);
  }

  const out = list.map((b: any) => {
    const rt: any = b.roomTypeId || {};
    const start = new Date(b.checkIn);
    const end = new Date(b.checkOut);
    const nights = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    const price = Number(rt.pricePerNight ?? 0);
    const latest = latestSlipByBooking.get(String(b._id));
    const computed = price * nights;
    const totalAmount = Number.isFinite(Number(latest?.amount))
      ? Number(latest.amount)
      : computed;

    let uiStatus: string = "PENDING_PAYMENT";
    if (b.status === "CANCELLED") {
      uiStatus = "CANCELLED";
    } else if (latest?.status === "REJECTED") {
      uiStatus = "REJECTED";
    } else if (latest?.status === "SUBMITTED") {
      uiStatus = "AWAITING_REVIEW";
    } else if (b.paymentStatus === "PAID") {
      uiStatus = "CONFIRMED";
    }

    return {
      ...b,
      id: String(b._id),
      status: uiStatus,
      room: {
        name: rt.type || rt.name || "Room",
        description: rt.description || "",
      },
      totalAmount,
    };
  });

  res.json(out);
};
