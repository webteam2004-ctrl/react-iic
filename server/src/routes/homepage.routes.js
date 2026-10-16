import { Router } from "express";
import {
    getHomepage,
    getHomepageAdmin,
    updateHero,
    updateTeamBanner,
    createStartupStory,
    updateStartupStory,
    deleteStartupStory,
    reorderStartupStories
} from "../controllers/homepage.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";
import { imageUpload } from "../middlewares/upload.middleware.js";

const router = Router();
const homeRead = [verifyAdmin, requirePermission("manage_home", "read")];
const homeCreate = [verifyAdmin, requirePermission("manage_home", "create")];
const homeUpdate = [verifyAdmin, requirePermission("manage_home", "update")];
const homeDelete = [verifyAdmin, requirePermission("manage_home", "delete")];

router.get("/", getHomepage);
router.get("/admin", ...homeRead, getHomepageAdmin);
router.put("/admin/hero", ...homeUpdate, imageUpload.single("image"), updateHero);
router.put("/admin/team-banner", ...homeUpdate, imageUpload.single("image"), updateTeamBanner);
router.post("/admin/stories", ...homeCreate, imageUpload.single("image"), createStartupStory);
router.put("/admin/stories/order", ...homeUpdate, reorderStartupStories);
router.put("/admin/stories/:id", ...homeUpdate, imageUpload.single("image"), updateStartupStory);
router.delete("/admin/stories/:id", ...homeDelete, deleteStartupStory);

export default router;
