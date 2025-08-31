import { Request, Response } from "express";
import PaymentSlip from "../models/PaymentSlip";
import Booking from "../models/Booking";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

export const getSlips = async (_req: Request, res: Response) => {
  const slips = await PaymentSlip.find().populate({
    path: "booking",
    populate: ["user", "roomTypeId"],
  });
  res.json(slips);
};

export const submitSlip = async (req: Request, res: Response) => {
  const { booking, slipImage, amount } = req.body;

  const slip = await PaymentSlip.create({
    booking,
    slipImage,
    amount,
    status: "SUBMITTED",
  });

  const b = await Booking.findById(booking);
  if (b) {
    b.paymentStatus = "PAID";
    await b.save();
  }

  res.status(201).json(slip);
};

export const updateSlip = async (req: Request, res: Response) => {
  const slip = await PaymentSlip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!slip) return res.status(404).json({ message: "Slip not found" });

  if (slip.booking) {
    const b = await Booking.findById(slip.booking);
    if (b) {
      if (slip.status === "APPROVED") b.paymentStatus = "PAID";
      if (slip.status === "REJECTED") b.paymentStatus = "PENDING";
      await b.save();
    }
  }

  res.json(slip);
};

export const generatePromptPayQR = async (req: Request, res: Response) => {
  const { pp, amount } = req.query as { pp?: string; amount?: string };
  if (!pp) return res.status(400).json({ message: "Missing 'pp' receiver id" });

  try {
    const amt = amount !== undefined ? Number(amount) : undefined;

    const options: any = {};
    if (!Number.isNaN(amt) && amt !== undefined) options.amount = amt;

    const payload: string = generatePayload(pp, options);
    const qrcodeDataUrl = await QRCode.toDataURL(payload, {
      margin: 1,
      scale: 6,
    });

    res.json({ payload, qrcodeDataUrl });
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "QR generation failed" });
  }
};
