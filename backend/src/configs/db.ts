import mongoose from "mongoose";
import User from "../models/User";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set in environment");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
    await seedAdminFromEnv();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

const seedAdminFromEnv = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({
      email,
      password,
      firstName: "Admin",
      lastName: "",
      role: "ADMIN",
    });
    console.log("✅ Seeded admin user from .env");
    return;
  }

  if (existing.role !== "ADMIN") {
    existing.role = "ADMIN";
    await existing.save();
    console.log("✅ Updated existing user to ADMIN role");
  }
};
