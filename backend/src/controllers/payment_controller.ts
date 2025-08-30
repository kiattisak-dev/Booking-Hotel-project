import { Request, Response } from "express";
import PaymentSlip from "../models/PaymentSlip";

export const getSlips = async (_req: Request, res: Response) => {
  const slips = await PaymentSlip.find().populate({
    path: "booking",
    populate: ["user", "roomTypeId"]
  });
  res.json(slips);
};

export const submitSlip = async (req: Request, res: Response) => {
  const slip = await PaymentSlip.create(req.body);
  res.status(201).json(slip);
};

export const updateSlip = async (req: Request, res: Response) => {
  const slip = await PaymentSlip.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(slip);
};
