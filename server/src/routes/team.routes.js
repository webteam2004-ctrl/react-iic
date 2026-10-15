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
import { imageUpload } from "../middlewares/upload.middleware.js";

const router = Router();

// Public read routes
router.get("/", getAllTeamMemeber);
router.get("/:id", getTeamMemberById);

// Protected admin routes
router.post("/", verifyAdmin, requirePermission("team", "create"), imageUpload.single("image"), createTeamMember);
router.put("/:id", verifyAdmin, requirePermission("team", "update"), imageUpload.single("image"), updateTeamMember);
router.delete("/:id", verifyAdmin, requirePermission("team", "delete"), deleteTeamMember);

export default router;