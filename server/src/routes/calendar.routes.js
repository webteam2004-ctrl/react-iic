import { Router } from "express";
import {
    getCalendarEvents,
    updateCalendarEventSchedule
} from "../controllers/calendar.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";

const router = Router();

// Public / client calendar schedule
router.get("/", getCalendarEvents);

// Protected admin update from calendar view
router.put(
    "/:id",
    verifyAdmin,
    requirePermission("calendar", "update"),
    updateCalendarEventSchedule
);

export default router;
