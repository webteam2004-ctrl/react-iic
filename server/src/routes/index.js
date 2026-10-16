import { Router } from "express";
import eventRoutes from "./event.routes.js";
import teamRoutes from "./team.routes.js";
import galleryRoutes from "./gallery.routes.js";
import adminRoute from "./admin.route.js";
import adminUserRoutes from "./adminUser.routes.js";
import challengeRoutes from "./challenge.routes.js";
import calendarRoutes from "./calendar.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import pipelineRoutes from "./pipeline.routes.js";
import homepageRoutes from "./homepage.routes.js";
import contactRoutes from "./contact.routes.js";

const api = Router();

// Module Routes
api.use("/events", eventRoutes);
api.use("/calendar", calendarRoutes);
api.use("/gallery", galleryRoutes);
api.use("/team", teamRoutes);
api.use("/teams", teamRoutes); // Alias for plural endpoint consistency
api.use("/challenges", challengeRoutes);
api.use("/idea-hub", challengeRoutes); // Alias for Idea Hub module

// Admin & Pipeline Routes
api.use("/admin", adminRoute);
api.use("/admin/users", adminUserRoutes);
api.use("/admin/analytics", analyticsRoutes);
api.use("/pipeline", pipelineRoutes);
api.use("/homepage", homepageRoutes);
api.use("/contact", contactRoutes);

export default api;