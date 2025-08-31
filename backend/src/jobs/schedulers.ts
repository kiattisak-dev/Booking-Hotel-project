import cron from "node-cron";
import dayjs from "dayjs";
import Booking from "../models/Booking";
import PaymentSlip from "../models/PaymentSlip";
import RoomType from "../models/RoomType";

async function cleanupExpiredBookings() {
  const threshold = dayjs().subtract(30, "minute").toDate();

  const expired = await Booking.find({
    paymentStatus: "PENDING",
    createdAt: { $lte: threshold },
  });

  if (!expired.length) return;

  for (const b of expired) {
    // ถ้าเคย assign ห้องไว้ ให้คืนห้อง (จาก occupied → available)
    if (b.roomTypeId && b.roomCode) {
      const rt = await RoomType.findById(b.roomTypeId);
      if (rt) {
        const room = rt.rooms.find((r) => r.code === b.roomCode);
        if (room && room.status === "occupied") {
          room.status = "available";
          await rt.save();
        }
      }
    }

    // ลบสลิปที่อ้างอิง booking นี้
    await PaymentSlip.deleteMany({ booking: b._id });

    // ลบ booking
    await Booking.deleteOne({ _id: b._id });
  }
  console.log(`🧹 cleanupExpiredBookings removed ${expired.length} bookings`);
}

/**
 * 2) คืนห้องอัตโนมัติเมื่อถึงเวลา checkOut
 * - ถ้า booking มี roomCode และถึงเวลา checkOut → คืนห้อง available
 * - ปรับ booking.status → COMPLETED ถ้ายังไม่ใช่
 */
async function releaseRoomsAfterCheckout() {
  const now = new Date();

  // เอาเฉพาะ booking ที่มี roomCode (แปลว่าเคยเข้าพัก) และถึงเวลา checkOut แล้ว
  const bookings = await Booking.find({
    roomCode: { $exists: true, $ne: null },
    checkOut: { $lte: now },
  });

  if (!bookings.length) return;

  for (const b of bookings) {
    if (!b.roomTypeId || !b.roomCode) continue;

    const rt = await RoomType.findById(b.roomTypeId);
    if (!rt) continue;

    const room = rt.rooms.find((r) => r.code === b.roomCode);
    if (room && room.status !== "available") {
      room.status = "available";
      await rt.save();
    }

    // ปรับสถานะ booking (ถ้าอยากจบการจอง)
    if (b.status !== "COMPLETED") {
      b.status = "COMPLETED";
      await b.save();
    }
  }
  console.log(`✅ releaseRoomsAfterCheckout processed ${bookings.length} bookings`);
}

export function startSchedulers() {
  // ทุก 1 นาทีตรวจหมดเวลา 30 นาที
  cron.schedule("* * * * *", async () => {
    try {
      await cleanupExpiredBookings();
    } catch (e) {
      console.error("cleanupExpiredBookings error:", e);
    }
  });

  // ทุก 5 นาทีคืนห้องตาม checkOut
  cron.schedule("*/5 * * * *", async () => {
    try {
      await releaseRoomsAfterCheckout();
    } catch (e) {
      console.error("releaseRoomsAfterCheckout error:", e);
    }
  });

  console.log("⏱️ Schedulers started: cleanup(1m), releaseRooms(5m)");
}
