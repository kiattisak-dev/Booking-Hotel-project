import { Request, Response } from "express";
import Package from "../models/Package";

export const getPackages = async (_req: Request, res: Response) => {
  res.json(await Package.find());
};

export const createPackage = async (req: Request, res: Response) => {
  res.status(201).json(await Package.create(req.body));
};

export const deletePackage = async (req: Request, res: Response) => {
  await Package.findByIdAndDelete(req.params.id);
  res.json({ message: "Package deleted" });
};
