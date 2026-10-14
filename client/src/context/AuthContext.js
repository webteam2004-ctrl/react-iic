import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => {
        return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    });

    const [user, setUser] = useState(() => {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem('adminUser');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    });

    const [isLoading, setIsLoading] = useState(true);

    // Sync token to localStorage
    const updateAuth = useCallback((newToken, newUser) => {
        if (newToken) {
            localStorage.setItem('token', newToken);
            localStorage.setItem('isAdmin', 'true');
            setToken(newToken);
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            setToken(null);
        }

        if (newUser) {
            localStorage.setItem('adminUser', JSON.stringify(newUser));
            setUser(newUser);
        } else {
            localStorage.removeItem('adminUser');
            setUser(null);
        }
    }, []);

    // Logout
    const logout = useCallback(() => {
        updateAuth(null, null);
    }, [updateAuth]);

    // Refresh profile from server on load
    const refreshProfile = useCallback(async () => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            setUser(null);
            setIsLoading(false);
            return null;
        }

        try {
            const res = await api.auth.getMe();
            if (res && res.success && res.user) {
                setUser(res.user);
                localStorage.setItem('adminUser', JSON.stringify(res.user));
                return res.user;
            }
        } catch (err) {
            console.warn('[AuthContext] Verification failed or session expired:', err.message);
            // If unauthorized, clear credentials
            if (err.status === 401 || err.status === 403) {
                logout();
            }
        } finally {
            setIsLoading(false);
        }
        return null;
    }, [logout]);

    useEffect(() => {
        refreshProfile();

        const handleAuthExpired = () => {
            logout();
        };

        window.addEventListener('auth:expired', handleAuthExpired);
        return () => {
            window.removeEventListener('auth:expired', handleAuthExpired);
        };
    }, [refreshProfile, logout]);

    // Login handler
    const login = async (email, password) => {
        const res = await api.auth.login(email, password);
        if (res && res.success) {
            updateAuth(res.token, res.user);
            return res;
        }
        throw new Error(res.message || 'Login failed');
    };

    // RBAC Permission Helpers
    const isSuperAdmin = useCallback(() => {
        return user?.role === 'super_admin';
    }, [user]);

    const isAnalyst = useCallback(() => {
        return user?.role === 'analyst';
    }, [user]);

    const can = useCallback((module, action = 'read') => {
        if (!user) return false;
        if (user.role === 'super_admin') return true;

        // Analysts are strictly read-only across all permitted modules
        if (user.role === 'analyst') {
            if (action !== 'read') return false;
            const modulePerms = user.permissions?.[module];
            if (Array.isArray(modulePerms)) {
                return modulePerms.includes('read') || modulePerms.includes('*');
            }
            return false;
        }

        // Admin role checks explicit permissions matrix
        const modulePerms = user.permissions?.[module];
        if (Array.isArray(modulePerms)) {
            return modulePerms.includes('*') || modulePerms.includes(action);
        }

        return false;
    }, [user]);

    const canRead = useCallback((module) => can(module, 'read'), [can]);
    const canCreate = useCallback((module) => can(module, 'create'), [can]);
    const canUpdate = useCallback((module) => can(module, 'update'), [can]);
    const canDelete = useCallback((module) => can(module, 'delete'), [can]);

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
        refreshProfile,
        isSuperAdmin,
        isAnalyst,
        can,
        canRead,
        canCreate,
        canUpdate,
        canDelete,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
