import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminAccessDenied from '../../pages/admin/AdminAccessDenied';

export default function AdminProtectedRoute({
    children,
    module,
    action = 'read',
    requiredModule,
    requiredAction,
    requiredRole,
}) {
    const { user, token, isLoading, can, isSuperAdmin } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '60vh',
                    gap: '1rem',
                    color: '#312e81',
                    fontFamily: 'inherit',
                }}
            >
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #e2e8f0',
                        borderTopColor: '#312e81',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                    Verifying Institutional Permissions...
                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Not logged in
    if (!token && !user) {
        return <Navigate to="/admin-portal-login" state={{ from: location }} replace />;
    }

    // Role check
    if (requiredRole && user?.role !== requiredRole && !isSuperAdmin()) {
        return <AdminAccessDenied requiredRole={requiredRole} />;
    }

    // Module & action check
    const permissionModule = requiredModule || module;
    const permissionAction = requiredAction || action;
    if (permissionModule && !can(permissionModule, permissionAction)) {
        return <AdminAccessDenied module={permissionModule} action={permissionAction} />;
    }

    return children;
}
