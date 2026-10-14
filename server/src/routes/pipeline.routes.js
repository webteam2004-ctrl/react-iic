import { Router } from "express";
import { publishUnifiedEvent } from "../controllers/pipeline.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";
import { imageUpload } from "../middlewares/upload.middleware.js";

const router = Router();

// Single unified form submission pipeline
router.post(
    "/publish",
    verifyAdmin,
    requirePermission("events", "create"),
    imageUpload.array("images", 20),
    publishUnifiedEvent
);

export default router;
