import { Router } from "express";
import {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
} from "../controllers/event.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";

const router = Router();

// Public read routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Protected admin routes with granular RBAC
router.post("/", verifyAdmin, requirePermission("events", "create"), createEvent);
router.put("/:id", verifyAdmin, requirePermission("events", "update"), updateEvent);
router.delete("/:id", verifyAdmin, requirePermission("events", "delete"), deleteEvent);

export default router;
