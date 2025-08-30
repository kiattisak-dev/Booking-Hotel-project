import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload { id: string; role: "ADMIN" | "USER"; }

export const protect = (roles: ("ADMIN" | "USER")[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ message: "Not authorized" });

    try {
      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      (req as any).user = decoded;
      next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};
