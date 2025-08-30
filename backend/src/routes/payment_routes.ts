import { Router } from "express";
import { getSlips, submitSlip, updateSlip } from "../controllers/payment_controller";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/", protect(["ADMIN"]), getSlips);
router.post("/", protect(["USER", "ADMIN"]), submitSlip);
router.patch("/:id", protect(["ADMIN"]), updateSlip);

export default router;
