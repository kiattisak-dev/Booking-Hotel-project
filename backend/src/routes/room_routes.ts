import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getRoomTypes,
  createRoomType,
  addRooms,
  updateRoom,
  deleteRoom,
  deleteRoomType,
  updateRoomType,
} from "../controllers/room_controller";

const router = Router();

router.get("/", getRoomTypes);
router.post("/", protect(["ADMIN"]), createRoomType);
router.delete("/:typeId", protect(["ADMIN"]), deleteRoomType);
router.patch("/:typeId", protect(["ADMIN"]), updateRoomType);
router.post("/:typeId/rooms", protect(["ADMIN"]), addRooms);
router.put("/:typeId/rooms/:roomCode", protect(["ADMIN"]), updateRoom);
router.delete("/:typeId/rooms/:roomCode", protect(["ADMIN"]), deleteRoom);

export default router;
