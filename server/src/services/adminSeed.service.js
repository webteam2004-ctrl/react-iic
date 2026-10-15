import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase.js";

/**
 * Ensures that an initial Super Admin exists in the database.
 * If the admin_users table has no active super_admin, seeds one from environment variables.
 */
export const ensureSuperAdmin = async () => {
    try {
        const superAdminEmail = (process.env.SUPER_ADMIN_EMAILS || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
        const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

        if (!superAdminEmail || !superAdminPassword) {
            console.warn("[AdminSeed] Warning: SUPER_ADMIN_EMAILS or SUPER_ADMIN_PASSWORD not set in environment.");
            return null;
        }

        // Check if any super_admin already exists
        const { data: existingSuperAdmin, error: checkError } = await supabase
            .from("admin_users")
            .select("id, email, role")
            .eq("email", superAdminEmail)
            .maybeSingle();

        if (checkError) {
            console.error("[AdminSeed] Error checking existing super admin:", checkError.message);
            return null;
        }

        if (existingSuperAdmin) {
            return existingSuperAdmin;
        }

        // Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(superAdminPassword, salt);

        const fullPermissions = {
            events: ["create", "read", "update", "delete"],
            calendar: ["create", "read", "update", "delete"],
            gallery: ["create", "read", "update", "delete"],
            idea_hub: ["create", "read", "update", "delete"],
            team: ["create", "read", "update", "delete"],
            analytics: ["read"],
            admin_users: ["create", "read", "update", "delete"]
        };

        const { data: newAdmin, error: insertError } = await supabase
            .from("admin_users")
            .insert([
                {
                    email: superAdminEmail,
                    password_hash: passwordHash,
                    name: "Super Administrator",
                    role: "super_admin",
                    permissions: fullPermissions,
                    is_active: true
                }
            ])
            .select()
            .single();

        if (insertError) {
            console.error("[AdminSeed] Error seeding super admin:", insertError.message);
            return null;
        }

        console.log(`[AdminSeed] Initial Super Admin seeded successfully: ${superAdminEmail}`);
        return newAdmin;
    } catch (err) {
        console.error("[AdminSeed] Unexpected error during super admin seed:", err);
        return null;
    }
};
