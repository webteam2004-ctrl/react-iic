import { Router } from "express";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";
import {
  submitChallenge,
  getAllChallenges,
  updateWebTeamReview,
  updateFacultyReview,
  verifyStudent
} from "../controllers/challenge.controller.js";

const router = Router();

// ==========================================
// STUDENT / PUBLIC ROUTES
// ==========================================
router.post("/verify", verifyStudent);
router.post("/submit", submitChallenge);

// ==========================================
// ADMIN / IDEA HUB ROUTES - RBAC PROTECTED
// ==========================================
router.get(
  "/",
  verifyAdmin,
  requirePermission("idea_hub", "read"),
  getAllChallenges
);

router.put(
  "/:id/web-review",
  verifyAdmin,
  requirePermission("idea_hub", "update"),
  updateWebTeamReview
);

router.put(
  "/:id/faculty-review",
  verifyAdmin,
  requirePermission("idea_hub", "update"),
  updateFacultyReview
);

export default router;