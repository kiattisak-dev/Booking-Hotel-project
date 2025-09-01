import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getBookings,
  createBooking,
  updateBookingStatus,
  assignRoomCode,
  getMyBookings,
} from "../controllers/booking_controller";

const router = Router();

router.get("/", protect(["ADMIN"]), getBookings);
router.post("/", protect(["ADMIN", "USER"]), createBooking);
router.get("/me", protect(["ADMIN", "USER"]), getMyBookings);
router.patch("/:id", protect(["ADMIN"]), updateBookingStatus);
router.post("/:id/assign", protect(["ADMIN"]), assignRoomCode);

export default router;
