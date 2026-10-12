import { Router } from "express";
import { publishUnifiedEvent } from "../controllers/pipeline.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";

const router = Router();

// Single unified form submission pipeline
router.post(
    "/publish",
    verifyAdmin,
    requirePermission("events", "create"),
    publishUnifiedEvent
);

export default router;
