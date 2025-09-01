import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });
  const user = await User.create({ email, password, firstName: name || "", lastName: "", role: "USER" });
  const payload = { _id: user._id, email: user.email, role: user.role };
  res.status(201).json({ user: payload, token: generateToken(String(user._id), user.role) });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const payload = { _id: user._id, email: user.email, role: user.role };
  res.json({ user: payload, token: generateToken(String(user._id), user.role) });
};

export const profile = async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.id).select("-password");
  if (!user) return res.status(404).json({ message: "Not found" });
  res.json({ _id: user._id, email: user.email, role: user.role });
};
