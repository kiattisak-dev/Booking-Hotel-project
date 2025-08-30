import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";

export const register = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ email, password, firstName, lastName, role });
  res.status(201).json({
    _id: user._id,
    email: user.email,
    role: user.role,
    token: generateToken(String(user._id), user.role)
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  res.json({
    _id: user._id,
    email: user.email,
    role: user.role,
    token: generateToken(String(user._id), user.role)
  });
};
