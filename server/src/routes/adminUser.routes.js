import { Router } from "express";
import {
    listAdminUsers,
    createAdminUser,
    updateAdminPermissions,
    updateAdminStatus,
    deleteAdminUser
} from "../controllers/adminUser.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";

const router = Router();

// All routes here strictly require authenticated Super Admin
router.use(verifyAdmin, requireRole("super_admin"));

router.get("/", listAdminUsers);
router.post("/", createAdminUser);
router.put("/:id/permissions", updateAdminPermissions);
router.put("/:id/status", updateAdminStatus);
router.delete("/:id", deleteAdminUser);

export default router;
