/**
 * Role-Based Access Control (RBAC) and Action-Level Permission Middleware.
 */

/**
 * Enforce that the authenticated user has one of the required roles.
 * @param  {...string} roles - e.g. 'super_admin', 'admin', 'analyst'
 */
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Authentication required"
            });
        }

        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Access restricted to roles [${roles.join(", ")}]. Current role: '${req.admin.role}'`
            });
        }

        next();
    };
};

/**
 * Enforces module-level and action-level permissions.
 *
 * Permission matrix logic:
 * 1. Super Admin: full bypass (access granted to all modules and actions).
 * 2. Analyst: read-only access only. Any create/update/delete attempts are blocked immediately.
 * 3. Admin / Analyst: checks if the admin's permissions object grants the required module and action.
 *    Format: { [module]: ["read", "create", "update", "delete"] }
 *
 * @param {string} module - Name of module (e.g. 'events', 'calendar', 'gallery', 'idea_hub', 'team', 'analytics', 'admin_users')
 * @param {string} action - Action being performed ('read', 'create', 'update', 'delete')
 */
export const requirePermission = (module, action) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Authentication required"
            });
        }

        const { role, permissions } = req.admin;

        // Super Admin has unrestricted wildcard access
        if (role === "super_admin") {
            return next();
        }

        // Analysts are strictly read-only
        if (role === "analyst" && action !== "read") {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Analyst role has read-only access and cannot perform '${action}' operations.`
            });
        }

        // Check specific module and action
        const modulePermissions = permissions?.[module];

        if (Array.isArray(modulePermissions)) {
            if (modulePermissions.includes("*") || modulePermissions.includes(action)) {
                return next();
            }
        }

        return res.status(403).json({
            success: false,
            message: `Forbidden: Insufficient permissions to perform '${action}' on '${module}'. Please contact a Super Admin.`
        });
    };
};
