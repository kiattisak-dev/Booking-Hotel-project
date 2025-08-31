import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getPackages,
  createPackage,
  deletePackage,
  updatePackage,
} from "../controllers/package_controller";

const router = Router();

router.get("/", getPackages);
router.post("/", protect(["ADMIN"]), createPackage);
router.patch("/:id", protect(["ADMIN"]), updatePackage);
router.delete("/:id", protect(["ADMIN"]), deletePackage);

export default router;
