import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getPackages,
  createPackage,
  deletePackage,
} from "../controllers/package_controller";

const router = Router();

router.get("/", getPackages);
router.post("/", protect(["ADMIN"]), createPackage);
router.delete("/:id", protect(["ADMIN"]), deletePackage);

export default router;
