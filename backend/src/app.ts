import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth_routes";
import userRoutes from "./routes/user_routes";
import roomRoutes from "./routes/room_routes";
import packageRoutes from "./routes/package_routes";
import bookingRoutes from "./routes/booking_routes";
import paymentRoutes from "./routes/payment_routes";
import { connectDB } from "./configs/db";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json());

app.get("/", (_req, res) => res.send("Booking Hotel API running"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

app.use(errorHandler);

export default app;
