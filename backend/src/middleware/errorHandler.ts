import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const code = err.statusCode || 500;
  res.status(code).json({ message: err.message || "Server Error" });
};
