import { Router } from "express";
import {
    createContactMessage
} from "../controllers/contact.controller.js";
import { contactSubmissionLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.post("/", contactSubmissionLimiter, createContactMessage);

export default router;
