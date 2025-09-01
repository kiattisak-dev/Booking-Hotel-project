import { Request, Response } from "express";
import RoomType from "../models/RoomType";

export const getRoomTypes = async (req: Request, res: Response) => {
  const page = Number(req.query.page || 0);
  const limit = Number(req.query.limit || 0);
  if (page > 0 && limit > 0) {
    const skip = (page - 1) * limit;
    const [types, total] = await Promise.all([
      RoomType.find().skip(skip).limit(limit).lean(),
      RoomType.countDocuments(),
    ]);
    return res.json({
      rooms: types.map((t) => ({ ...t, id: String(t._id) })),
      total,
    });
  }
  const types = await RoomType.find().lean();
  return res.json({
    rooms: types.map((t) => ({ ...t, id: String(t._id) })),
    total: types.length,
  });
};

export const getAvailableRooms = async (req: Request, res: Response) => {
  const { guests, minPrice, maxPrice, roomType, amenities } = req.query;
  const filter: any = {};
  if (roomType) filter.type = roomType;
  if (guests) filter.capacity = { $gte: Number(guests) };
  if (minPrice || maxPrice)
    filter.pricePerNight = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
    };
  if (amenities)
    filter.amenities = { $all: String(amenities).split(",").filter(Boolean) };
  const types = await RoomType.find(filter).lean();
  const available = types.filter(
    (t) =>
      (t.status ?? "active") === "active" &&
      Array.isArray(t.rooms) &&
      t.rooms.some((r) => r.status === "available")
  );
  res.json(available.map((t) => ({ ...t, id: String(t._id) })));
};

export const getRoomById = async (req: Request, res: Response) => {
  const room = await RoomType.findById(req.params.id).lean();
  if (!room) return res.status(404).json({ message: "Room not found" });
  const unavailableDates: string[] = [];
  res.json({ ...room, id: String(room._id), unavailableDates });
};

export const createRoomType = async (req: Request, res: Response) => {
  const type = await RoomType.create(req.body);
  res.status(201).json(type);
};

export const addRooms = async (req: Request, res: Response) => {
  const { typeId } = req.params;
  const { prefix, count = 1 } = req.body as { prefix: string; count: number };
  const roomType = await RoomType.findById(typeId);
  if (!roomType) return res.status(404).json({ message: "RoomType not found" });
  const start = (roomType.rooms?.length || 0) + 1;
  for (let i = 0; i < count; i++) {
    const code = `${prefix}${(start + i).toString().padStart(3, "0")}`;
    roomType.rooms.push({ code });
  }
  await roomType.save();
  res.status(201).json(roomType);
};

export const updateRoom = async (req: Request, res: Response) => {
  const { typeId, roomCode } = req.params;
  const { status, images } = req.body;
  const roomType = await RoomType.findById(typeId);
  if (!roomType) return res.status(404).json({ message: "RoomType not found" });
  const room = roomType.rooms.find((r) => r.code === roomCode);
  if (!room) return res.status(404).json({ message: "Room not found" });
  if (status) room.status = status;
  if (images) room.images = images;
  await roomType.save();
  res.json(roomType);
};

export const updateRoomType = async (req: Request, res: Response) => {
  const { typeId } = req.params;
  const payload = req.body;
  const updated = await RoomType.findByIdAndUpdate(typeId, payload, {
    new: true,
  });
  if (!updated) return res.status(404).json({ message: "RoomType not found" });
  res.json(updated);
};

export const deleteRoom = async (req: Request, res: Response) => {
  const { typeId, roomCode } = req.params;
  const roomType = await RoomType.findById(typeId);
  if (!roomType) return res.status(404).json({ message: "RoomType not found" });
  roomType.rooms = roomType.rooms.filter((r) => r.code !== roomCode);
  await roomType.save();
  res.json({ message: "Room removed", roomType });
};

export const deleteRoomType = async (req: Request, res: Response) => {
  const { typeId } = req.params;
  await RoomType.findByIdAndDelete(typeId);
  res.json({ message: "RoomType deleted" });
};
