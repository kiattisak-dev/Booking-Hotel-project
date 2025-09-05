import express from "express";
import dotenv from "dotenv";
import { createCors } from "./configs/cors";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth_routes";
import userRoutes from "./routes/user_routes";
import roomRoutes from "./routes/room_routes";
import bookingRoutes from "./routes/booking_routes";
import paymentRoutes from "./routes/payment_routes";
import { connectDB } from "./configs/db";
import { startSchedulers } from "./jobs/schedulers";

const app = express();

app.set("trust proxy", 1);

const corsMw = createCors();
app.use(corsMw);
app.options("*", corsMw);

const JSON_LIMIT = process.env.JSON_LIMIT || "20mb";
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));

app.get("/", (_req, res) => res.send("Booking Hotel API running"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

app.use(errorHandler);

export default app;
