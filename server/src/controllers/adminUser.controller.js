import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase.js";

/**
 * Controller for Super Admin to manage other admin accounts, roles, and permissions.
 */

// List all admin users
export const listAdminUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from("admin_users")
            .select("id, email, name, role, permissions, is_active, last_login, created_at, updated_at")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[AdminUser] Error listing admins:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch admin users"
            });
        }

        return res.status(200).json({
            success: true,
            users: users || []
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Create a new admin or analyst account
export const createAdminUser = async (req, res) => {
    try {
        const { email, password, name, role, permissions } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({
                success: false,
                message: "Email, password, name, and role are required."
            });
        }

        if (!["super_admin", "admin", "analyst"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Role must be 'super_admin', 'admin', or 'analyst'."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Check if email already exists
        const { data: existingUser } = await supabase
            .from("admin_users")
            .select("id")
            .eq("email", cleanEmail)
            .maybeSingle();

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An admin account with this email already exists."
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Format permissions default
        let userPermissions = permissions || {};
        if (role === "super_admin") {
            userPermissions = {
                events: ["create", "read", "update", "delete"],
                calendar: ["create", "read", "update", "delete"],
                gallery: ["create", "read", "update", "delete"],
                idea_hub: ["create", "read", "update", "delete"],
                team: ["create", "read", "update", "delete"],
                analytics: ["read"],
                admin_users: ["create", "read", "update", "delete"],
                contact_messages: ["create", "read", "update", "delete"],
                manage_home: ["create", "read", "update", "delete"]
            };
        } else if (role === "analyst") {
            // Analysts strictly get read-only permissions
            userPermissions = {
                events: ["read"],
                calendar: ["read"],
                gallery: ["read"],
                idea_hub: ["read"],
                team: ["read"],
                analytics: ["read"],
                contact_messages: ["read"],
                manage_home: ["read"]
            };
        }

        const { data: newUser, error: insertError } = await supabase
            .from("admin_users")
            .insert([
                {
                    email: cleanEmail,
                    password_hash: passwordHash,
                    name: name.trim(),
                    role,
                    permissions: userPermissions,
                    is_active: true
                }
            ])
            .select("id, email, name, role, permissions, is_active, created_at")
            .single();

        if (insertError) {
            console.error("[AdminUser] Error inserting admin:", insertError);
            return res.status(500).json({
                success: false,
                message: insertError.message || "Failed to create admin user"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Admin user created successfully",
            user: newUser
        });
    } catch (err) {
        console.error("[AdminUser] Create error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update an admin's role and permissions
export const updateAdminPermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, permissions, name } = req.body;

        const updates = {
            updated_at: new Date().toISOString()
        };

        if (role) {
            if (!["super_admin", "admin", "analyst"].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role value"
                });
            }
            updates.role = role;
        }

        if (permissions !== undefined) {
            updates.permissions = permissions;
        }

        if (name) {
            updates.name = name.trim();
        }

        const { data: updatedUser, error } = await supabase
            .from("admin_users")
            .update(updates)
            .eq("id", id)
            .select("id, email, name, role, permissions, is_active, updated_at")
            .single();

        if (error || !updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Admin user not found or update failed"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Admin permissions updated successfully",
            user: updatedUser
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Activate or deactivate an admin account
export const updateAdminStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "is_active boolean field is required"
            });
        }

        // Prevent Super Admin from deactivating their own current account
        if (req.admin.id === id && !is_active) {
            return res.status(400).json({
                success: false,
                message: "You cannot deactivate your own Super Admin account"
            });
        }

        const { data: updatedUser, error } = await supabase
            .from("admin_users")
            .update({ is_active, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select("id, email, name, role, permissions, is_active")
            .single();

        if (error || !updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Admin user not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: `Admin user has been ${is_active ? "activated" : "deactivated"} successfully`,
            user: updatedUser
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete an admin account
export const deleteAdminUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (req.admin.id === id) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account"
            });
        }

        const { error, count } = await supabase
            .from("admin_users")
            .delete({ count: "exact" })
            .eq("id", id);

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        if (count === 0) {
            return res.status(404).json({
                success: false,
                message: "Admin user not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Admin user deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
