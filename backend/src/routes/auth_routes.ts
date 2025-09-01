import { Router } from "express";
import { login, profile, register } from "../controllers/auth_controller";
import { protect } from "../middleware/authMiddleware";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect(["ADMIN", "USER"]), profile);

export default router;
