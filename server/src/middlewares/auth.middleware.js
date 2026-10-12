import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

/**
 * Authentication middleware that verifies JWT and checks active status in admin_users table.
 */
export const verifyAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        if (!process.env.JWT_SECRET) {
            console.error("[Auth] JWT_SECRET is not configured");
            return res.status(500).json({
                success: false,
                message: "Server configuration error"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id) {
            // Handle legacy tokens that only had email
            if (decoded && decoded.email) {
                const { data: adminUser, error } = await supabase
                    .from("admin_users")
                    .select("id, email, name, role, permissions, is_active")
                    .eq("email", decoded.email.trim().toLowerCase())
                    .maybeSingle();

                if (error || !adminUser) {
                    return res.status(401).json({
                        success: false,
                        message: "Unauthorized: Admin account not found"
                    });
                }

                if (!adminUser.is_active) {
                    return res.status(403).json({
                        success: false,
                        message: "Forbidden: Account has been deactivated"
                    });
                }

                req.admin = adminUser;
                return next();
            }

            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token payload"
            });
        }

        // Verify user in Supabase to ensure active status
        const { data: adminUser, error } = await supabase
            .from("admin_users")
            .select("id, email, name, role, permissions, is_active")
            .eq("id", decoded.id)
            .maybeSingle();

        if (error || !adminUser) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Admin user not found"
            });
        }

        if (!adminUser.is_active) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Account has been deactivated"
            });
        }

        req.admin = adminUser;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token has expired. Please login again."
            });
        }

        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid token"
        });
    }
};

export const authenticateAdmin = verifyAdmin;
