import { Router } from "express";
import {
    createTeamMember,
    getAllTeamMemeber,
    getTeamMemberById,
    updateTeamMember,
    deleteTeamMember
} from "../controllers/team.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";

const router = Router();

// Public read routes
router.get("/", getAllTeamMemeber);
router.get("/:id", getTeamMemberById);

// Protected admin routes
router.post("/", verifyAdmin, requirePermission("team", "create"), createTeamMember);
router.put("/:id", verifyAdmin, requirePermission("team", "update"), updateTeamMember);
router.delete("/:id", verifyAdmin, requirePermission("team", "delete"), deleteTeamMember);

export default router;