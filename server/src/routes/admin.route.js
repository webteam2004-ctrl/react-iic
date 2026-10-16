import { Router } from "express";
import { login, getMe } from "../controllers/admin.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";
import { adminLoginLimiter } from "../middlewares/rateLimiter.js";
import {
    deleteContactMessage,
    getContactMessage,
    listContactMessages,
    updateContactMessage
} from "../controllers/contact.controller.js";
import {
    getParticipants,
    updateStatus,
    updateField
} from "../controllers/participant.controller.js";

const router = Router();

// Rate-limited Admin Login
router.post("/login", adminLoginLimiter, login);

// Protected profile endpoint
router.get("/me", verifyAdmin, getMe);

router.get("/contact-messages", verifyAdmin, requirePermission("contact_messages", "read"), listContactMessages);
router.get("/contact-messages/:id", verifyAdmin, requirePermission("contact_messages", "read"), getContactMessage);
router.patch("/contact-messages/:id", verifyAdmin, requirePermission("contact_messages", "update"), updateContactMessage);
router.delete("/contact-messages/:id", verifyAdmin, requirePermission("contact_messages", "delete"), deleteContactMessage);

// Participant endpoints
router.get("/participants", getParticipants);

// Protected participant updates
router.put(
    "/participants/:id/status",
    verifyAdmin,
    requirePermission("idea_hub", "update"),
    updateStatus
);

router.put(
    "/participants/:id/field",
    verifyAdmin,
    requirePermission("idea_hub", "update"),
    updateField
);

export default router;
