import { Router } from "express";
import { getDashboardAnalytics } from "../controllers/analytics.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";

const router = Router();

// Dashboard analytics endpoint
router.get(
    "/",
    verifyAdmin,
    requirePermission("analytics", "read"),
    getDashboardAnalytics
);

export default router;
