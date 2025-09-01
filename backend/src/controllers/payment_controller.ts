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
  try {
    const { booking, amount } = req.body as {
      booking?: string;
      amount?: number;
    };
    const slipRaw: string | undefined =
      (req.body as any).slipImage ||
      (req.body as any).image ||
      (req.body as any).slip;

    if (!booking)
      return res.status(400).json({ message: "booking is required" });
    if (!slipRaw)
      return res.status(400).json({ message: "slipImage is required" });

    const b = await Booking.findById(booking);
    if (!b) return res.status(404).json({ message: "Booking not found" });

    const amt = typeof amount === "number" ? amount : Number(amount);
    const payload: any = {
      booking,
      amount: Number.isFinite(amt) ? amt : undefined,
      status: "SUBMITTED",
      slipImage: slipRaw,
      image: slipRaw,
      slip: slipRaw,
    };

    const slip = await PaymentSlip.create(payload);

    b.paymentStatus = "PENDING";
    await b.save();

    res.status(201).json({ ...slip.toObject(), id: String(slip._id) });
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Submit slip failed" });
  }
};

export const updateSlip = async (req: Request, res: Response) => {
  try {
    const slip = await PaymentSlip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!slip) return res.status(404).json({ message: "Slip not found" });

    if (slip.booking) {
      const b = await Booking.findById(slip.booking);
      if (b) {
        if (slip.status === "APPROVED") {
          b.paymentStatus = "PAID";       
          if (b.status !== "CONFIRMED") { 
            b.status = "CONFIRMED";
          }
        }
        if (slip.status === "REJECTED") {
          b.paymentStatus = "PENDING";   
        }
        await b.save();
      }
    }

    res.json(slip);
  } catch (e: any) {
    console.error("updateSlip error:", e);
    res.status(500).json({ message: e?.message || "Update slip failed" });
  }
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
    console.error("QR gen error:", e);
    res.status(500).json({ message: e?.message || "QR generation failed" });
  }
};
