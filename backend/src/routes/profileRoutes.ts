import { Router } from "express";
import {
  deleteAccount,
  deleteAvatar,
  exportData,
  getAvatar,
  getProfile,
  updateProfile,
  uploadAvatar,
} from "../controllers/profileControllers.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = Router();

router.get("/", requireAuth, getProfile);
router.put("/", requireAuth, updateProfile);
router.post("/avatar", requireAuth, upload.single("avatar"), uploadAvatar);
router.get("/avatar", requireAuth, getAvatar);
router.delete("/avatar", requireAuth, deleteAvatar);
router.get("/export", requireAuth, exportData);
router.delete("/account", requireAuth, deleteAccount);

export { router };
