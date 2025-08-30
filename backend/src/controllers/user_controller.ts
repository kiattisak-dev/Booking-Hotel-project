import { Request, Response } from "express";
import User from "../models/User";

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const deleteUser = async (req: Request, res: Response) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};
