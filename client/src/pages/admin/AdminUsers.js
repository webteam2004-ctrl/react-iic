import React, { useState, useEffect, useCallback } from 'react';
import {
    ShieldCheck,
    UserPlus,
    Search,
    Edit2,
    Trash2,
    RefreshCw,
    Mail,
    CheckCircle,
    AlertTriangle,
    X,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminCommon.module.css';

const AVAILABLE_MODULES = [
    { id: 'events', label: 'Events Management' },
    { id: 'calendar', label: 'Academic Calendar' },
    { id: 'gallery', label: 'Gallery Showcase' },
    { id: 'teams', label: 'Council Directory' },
    { id: 'idea_hub', label: 'Idea Hub / SIH Reviews' },
    { id: 'contact_messages', label: 'Contact Messages' },
    { id: 'manage_home', label: 'Manage Home' },
];

const ACTIONS = ['read', 'create', 'update', 'delete'];

export default function AdminUsers() {
    const { user: currentAdmin, isSuperAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        is_active: true,
        permissions: {},
    });

    const loadAdminUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.adminUsers.getAll();
            if (res && res.success) {
                setUsers(res.users || []);
            }
        } catch (err) {
            console.error('[AdminUsers] Load error:', err);
            showToast(err.message || 'Error loading administrators', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isSuperAdmin()) {
            loadAdminUsers();
        }
    }, [loadAdminUsers, isSuperAdmin]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleOpenCreate = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'admin',
            is_active: true,
            permissions: {
                events: ['read', 'create', 'update'],
                calendar: ['read', 'update'],
                gallery: ['read', 'create'],
                teams: ['read', 'create', 'update'],
                idea_hub: ['read', 'update'],
                contact_messages: ['read', 'update'],
                manage_home: ['read', 'update'],
            },
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (targetUser) => {
        setEditingUser(targetUser);
        setFormData({
            name: targetUser.name || '',
            email: targetUser.email || '',
            password: '', // blank unless resetting
            role: targetUser.role || 'admin',
            is_active: targetUser.is_active !== false,
            permissions: targetUser.permissions || {},
        });
        setIsModalOpen(true);
    };

    const togglePermission = (module, action) => {
        const current = formData.permissions[module] || [];
        let updated;
        if (current.includes(action)) {
            updated = current.filter((a) => a !== action);
        } else {
            updated = [...current, action];
        }

        setFormData({
            ...formData,
            permissions: {
                ...formData.permissions,
                [module]: updated,
            },
        });
    };

    const toggleAllModuleActions = (module, selectAll) => {
        setFormData({
            ...formData,
            permissions: {
                ...formData.permissions,
                [module]: selectAll ? [...ACTIONS] : ['read'],
            },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email.trim()) {
            showToast('Email is required', 'error');
            return;
        }
        if (!editingUser && (!formData.password || formData.password.length < 8)) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim() || formData.email.split('@')[0],
                email: formData.email.trim().toLowerCase(),
                role: formData.role,
                is_active: Boolean(formData.is_active),
                permissions: formData.role === 'admin' ? formData.permissions : {},
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            if (editingUser) {
                await api.adminUsers.update(editingUser.id, payload);
                showToast('Admin user permissions updated');
            } else {
                await api.adminUsers.create(payload);
                showToast('New administrator created successfully');
            }
            setIsModalOpen(false);
            loadAdminUsers();
        } catch (err) {
            showToast(err.message || 'Operation failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (targetUser) => {
        if (targetUser.id === currentAdmin?.id) {
            showToast('You cannot deactivate your own account', 'error');
            return;
        }

        try {
            await api.adminUsers.update(targetUser.id, {
                is_active: !targetUser.is_active,
            });
            showToast(`Account status updated to ${!targetUser.is_active ? 'Active' : 'Disabled'}`);
            loadAdminUsers();
        } catch (err) {
            showToast(err.message || 'Failed to update status', 'error');
        }
    };

    const handleDeletePermanent = async () => {
        if (!deleteConfirmUser) return;
        try {
            await api.adminUsers.delete(deleteConfirmUser.id);
            showToast('Administrator removed');
            setDeleteConfirmUser(null);
            loadAdminUsers();
        } catch (err) {
            showToast(err.message || 'Failed to remove user', 'error');
        }
    };

    const filteredUsers = users.filter((u) =>
        (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.role || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.headerTitle}>Council Access & Granular RBAC</h1>
                    <p className={styles.headerSubtitle}>
                        Configure administrator accounts, enforce role-based boundaries, and audit permissions matrix.
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={loadAdminUsers}
                        disabled={loading}
                    >
                        <RefreshCw size={15} />
                        <span>Refresh</span>
                    </button>
                    <button type="button" className={styles.btnPrimary} onClick={handleOpenCreate}>
                        <UserPlus size={16} />
                        <span>Create Admin User</span>
                    </button>
                </div>
            </div>

            {toast && (
                <div className={toast.type === 'error' ? styles.toastError : styles.toastSuccess}>
                    {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Filter and Security Notice */}
            <div className={styles.filterBar}>
                <div className={styles.searchGroup}>
                    <Search size={16} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by email, role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#6b21a8' }}>
                    <ShieldCheck size={16} />
                    <span style={{ fontWeight: 600 }}>Super Admin Restricted Module</span>
                </div>
            </div>

            {/* Administrators Table */}
            <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Admin Email</th>
                                <th>Role Tier</th>
                                <th>Status</th>
                                <th>Permissions Scope</th>
                                <th>Created At</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                        Loading administrator accounts...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                                        No administrators found matching search criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => {
                                    const isCurrent = u.id === currentAdmin?.id;
                                    const roleBadge =
                                        u.role === 'super_admin'
                                            ? styles.badgeSuperAdmin
                                            : u.role === 'analyst'
                                                ? styles.badgeAnalyst
                                                : styles.badgeAdmin;

                                    return (
                                        <tr key={u.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <div
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '50%',
                                                            background: '#f1f5f9',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#475569',
                                                        }}
                                                    >
                                                        <Mail size={15} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                                            {u.email} {isCurrent && <span style={{ color: '#4338ca', fontSize: '0.74rem' }}>(You)</span>}
                                                        </div>
                                                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>ID: {u.id?.slice(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.badge} ${roleBadge}`}>
                                                    {u.role?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleActive(u)}
                                                    disabled={isCurrent}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: isCurrent ? 'not-allowed' : 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 600,
                                                        color: u.is_active ? '#059669' : '#dc2626',
                                                    }}
                                                >
                                                    {u.is_active ? <ToggleRight size={20} color="#059669" /> : <ToggleLeft size={20} color="#dc2626" />}
                                                    <span>{u.is_active ? 'Active' : 'Disabled'}</span>
                                                </button>
                                            </td>
                                            <td>
                                                {u.role === 'super_admin' ? (
                                                    <span style={{ fontSize: '0.8rem', color: '#6b21a8', fontWeight: 600 }}>
                                                        Full Root Access (*)
                                                    </span>
                                                ) : u.role === 'analyst' ? (
                                                    <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>
                                                        Read-Only All Modules
                                                    </span>
                                                ) : (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '300px' }}>
                                                        {Object.entries(u.permissions || {}).map(([mod, perms]) => (
                                                            <span
                                                                key={mod}
                                                                style={{
                                                                    fontSize: '0.72rem',
                                                                    background: '#f1f5f9',
                                                                    color: '#334155',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '4px',
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                {mod}: {Array.isArray(perms) ? perms.join(',') : perms}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Initial Seed'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className={styles.actionBtnGroup} style={{ justifyContent: 'flex-end' }}>
                                                    <button
                                                        type="button"
                                                        className={styles.actionIconBtn}
                                                        onClick={() => handleOpenEdit(u)}
                                                        title="Edit Permissions & Roles"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    {!isCurrent && (
                                                        <button
                                                            type="button"
                                                            className={`${styles.actionIconBtn} ${styles.actionIconBtnDanger}`}
                                                            onClick={() => setDeleteConfirmUser(u)}
                                                            title="Delete Administrator"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create / Edit Modal with Granular RBAC Matrix */}
            {isModalOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox} style={{ maxWidth: '650px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {editingUser ? 'Configure Admin Permissions' : 'Create Administrator Account'}
                            </h2>
                            <button
                                type="button"
                                className={styles.modalCloseBtn}
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.formInput}
                                        placeholder="e.g. Dr. K. Ravindra / Jane Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className={styles.formInput}
                                        placeholder="admin@iicvvit.in"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        {editingUser ? 'Reset Password (leave empty to keep unchanged)' : 'Initial Password *'}
                                    </label>
                                    <input
                                        type="password"
                                        className={styles.formInput}
                                        placeholder="Min 8 characters"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingUser}
                                    />
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Role Tier</label>
                                        <select
                                            className={styles.formSelect}
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="super_admin">Super Admin (Full Root Access)</option>
                                            <option value="admin">Admin (Granular RBAC Matrix)</option>
                                            <option value="analyst">Analyst (Read-Only Observer)</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup} style={{ justifyContent: 'center' }}>
                                        <label className={styles.checkboxLabel} style={{ marginTop: '1.4rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            />
                                            <span>Active Account (Permit Login)</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Granular RBAC Permission Matrix (Shown only if role === 'admin') */}
                                {formData.role === 'admin' ? (
                                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                        <div style={{ marginBottom: '0.75rem' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                                                Granular RBAC Module Permissions
                                            </div>
                                            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                                Specify which operational modules and actions this administrator is authorized to execute.
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {AVAILABLE_MODULES.map((mod) => {
                                                const modPerms = formData.permissions[mod.id] || [];
                                                const allSelected = ACTIONS.every((a) => modPerms.includes(a));

                                                return (
                                                    <div
                                                        key={mod.id}
                                                        style={{
                                                            background: '#f8fafc',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            padding: '0.75rem',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '0.5rem',
                                                            }}
                                                        >
                                                            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b' }}>
                                                                {mod.label}
                                                            </span>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleAllModuleActions(mod.id, !allSelected)}
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        fontSize: '0.72rem',
                                                                        color: '#4338ca',
                                                                        cursor: 'pointer',
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {allSelected ? 'Set Read-Only' : 'Grant All'}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                            {ACTIONS.map((action) => {
                                                                const isChecked = modPerms.includes(action);
                                                                return (
                                                                    <label
                                                                        key={action}
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px',
                                                                            fontSize: '0.78rem',
                                                                            color: isChecked ? '#0f172a' : '#64748b',
                                                                            cursor: 'pointer',
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => togglePermission(mod.id, action)}
                                                                        />
                                                                        <span style={{ textTransform: 'capitalize' }}>{action}</span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : formData.role === 'super_admin' ? (
                                    <div
                                        style={{
                                            background: '#ede9fe',
                                            border: '1px solid #ddd6fe',
                                            borderRadius: '8px',
                                            padding: '0.85rem',
                                            fontSize: '0.82rem',
                                            color: '#5b21b6',
                                        }}
                                    >
                                        <strong>Super Admin Notice:</strong> Super Administrators bypass individual module checks and inherit unrestricted creation, modification, deletion, and system administrative capabilities.
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            background: '#fffbeb',
                                            border: '1px solid #fef3c7',
                                            borderRadius: '8px',
                                            padding: '0.85rem',
                                            fontSize: '0.82rem',
                                            color: '#92400e',
                                        }}
                                    >
                                        <strong>Analyst Notice:</strong> Analysts have read-only visibility into institutional statistics, submissions, and events without mutation or deletion permissions.
                                    </div>
                                )}
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    className={styles.btnSecondary}
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                                    {submitting ? 'Saving...' : editingUser ? 'Update Account' : 'Create Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirmUser && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox} style={{ maxWidth: '440px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle} style={{ color: '#dc2626' }}>
                                Revoke Admin Privileges
                            </h2>
                            <button
                                type="button"
                                className={styles.modalCloseBtn}
                                onClick={() => setDeleteConfirmUser(null)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <p style={{ color: '#334155', fontSize: '0.9rem', margin: 0 }}>
                                Are you sure you want to remove administrative access for <strong>{deleteConfirmUser.email}</strong>?
                            </p>
                            <div
                                style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fee2e2',
                                    borderRadius: '8px',
                                    padding: '0.75rem',
                                    fontSize: '0.8rem',
                                    color: '#991b1b',
                                }}
                            >
                                This action revokes immediate login and API access. Event and challenge records created by this account remain preserved.
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className={styles.btnSecondary}
                                onClick={() => setDeleteConfirmUser(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.btnDanger}
                                onClick={handleDeletePermanent}
                            >
                                Revoke Access
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
