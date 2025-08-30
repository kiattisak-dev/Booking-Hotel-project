import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { deleteUser, getAllUsers } from "../controllers/user_controller";
const router = Router();

router.get("/", protect(["ADMIN"]), getAllUsers);
router.delete("/:id", protect(["ADMIN"]), deleteUser);

export default router;
