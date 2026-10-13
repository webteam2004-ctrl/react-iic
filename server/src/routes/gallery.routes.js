import { Router } from "express";
import {
    createGalleryImage,
    deleteGalleryImage,
    getAllGalleryImages,
    updateGalleryImage,
    uploadGalleryImages
} from "../controllers/gallery.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";
import { imageUpload } from "../middlewares/upload.middleware.js";

const router = Router();

// Public read route
router.get("/", getAllGalleryImages);

// Protected admin routes
router.post("/upload", verifyAdmin, requirePermission("gallery", "create"), imageUpload.array("images", 20), uploadGalleryImages);
router.post("/", verifyAdmin, requirePermission("gallery", "create"), createGalleryImage);
router.put("/:id", verifyAdmin, requirePermission("gallery", "update"), updateGalleryImage);
router.delete("/:id", verifyAdmin, requirePermission("gallery", "delete"), deleteGalleryImage);

export default router;