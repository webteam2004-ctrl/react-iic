import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";
import { ensureSuperAdmin } from "../services/adminSeed.service.js";

/**
 * Admin Login Endpoint
 * Authenticates against admin_users table with bcrypt hashing.
 * Auto-seeds Super Admin if needed.
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password"
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Ensure initial super admin exists
        await ensureSuperAdmin();

        // Lookup user in admin_users table
        const { data: adminUser, error: fetchError } = await supabase
            .from("admin_users")
            .select("id, email, password_hash, name, role, permissions, is_active")
            .eq("email", cleanEmail)
            .maybeSingle();

        if (fetchError) {
            console.error("[AdminLogin] Database error:", fetchError.message);
            return res.status(500).json({
                success: false,
                message: "Internal server error during authentication"
            });
        }

        if (!adminUser) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!adminUser.is_active) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Account has been deactivated. Please contact Super Admin."
            });
        }

        // Compare bcrypt password
        const isMatch = await bcrypt.compare(password, adminUser.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Server configuration error: JWT_SECRET not configured"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: adminUser.id,
                email: adminUser.email,
                role: adminUser.role,
                name: adminUser.name
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Update last_login timestamp asynchronously
        await supabase
            .from("admin_users")
            .update({ last_login: new Date().toISOString() })
            .eq("id", adminUser.id);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                role: adminUser.role,
                permissions: adminUser.permissions || {}
            }
        });
    } catch (err) {
        console.error("[AdminLogin] Unexpected error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get current authenticated admin profile
 */
export const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: req.admin
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};