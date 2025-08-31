import { Request, Response } from "express";
import RoomType from "../models/RoomType";

// GET /api/rooms
export const getRoomTypes = async (_req: Request, res: Response) => {
  const types = await RoomType.find();
  res.json(types);
};

// POST /api/rooms
export const createRoomType = async (req: Request, res: Response) => {
  const type = await RoomType.create(req.body);
  res.status(201).json(type);
};

// POST /api/rooms/:typeId/rooms 
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

// PUT /api/rooms/:typeId/rooms/:roomCode
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
  const payload = req.body; // { type?, capacity?, bedType?, pricePerNight?, status?, description?, images? ... }
  const updated = await RoomType.findByIdAndUpdate(typeId, payload, { new: true });
  if (!updated) return res.status(404).json({ message: "RoomType not found" });
  res.json(updated);
};

// DELETE /api/rooms/:typeId/rooms/:roomCode 
export const deleteRoom = async (req: Request, res: Response) => {
  const { typeId, roomCode } = req.params;

  const roomType = await RoomType.findById(typeId);
  if (!roomType) return res.status(404).json({ message: "RoomType not found" });

  roomType.rooms = roomType.rooms.filter((r) => r.code !== roomCode);
  await roomType.save();

  res.json({ message: "Room removed", roomType });
};

// DELETE /api/rooms/:typeId 
export const deleteRoomType = async (req: Request, res: Response) => {
  const { typeId } = req.params;
  await RoomType.findByIdAndDelete(typeId);
  res.json({ message: "RoomType deleted" });
};
