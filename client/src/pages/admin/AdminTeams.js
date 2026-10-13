import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    X
} from 'lucide-react';
import { api, resolveMediaUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MultiImageUploader from '../../components/admin/MultiImageUploader';
import styles from './AdminCommon.module.css';

const LinkedinIcon = ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
);

const GithubIcon = ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
);

const panelRoles = {
    'IIC Co-ordinators': ['Faculty Coordinator'],
    'IIC Presidents': ['President', 'Vice President', 'Secretary'],
    'Social Media Department': ['SM Head', 'SM Member'],
    'Public Relations': ['PR Member', 'PR Head'],
    'Web Development': ['Web Head', 'Web Member'],
    Events: ['Events Head', 'Events Member'],
    'Review & Validation': ['R&V Head', 'R&V Member'],
};

export default function AdminTeams() {
    const { canCreate, canUpdate, canDelete } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [deleteConfirmMember, setDeleteConfirmMember] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [avatarFiles, setAvatarFiles] = useState([]);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        department: '',
        image_url: '',
        linkedin_url: '',
        github_url: '',
        order_index: 0,
    });

    const loadTeamMembers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.teams.getAll();
            if (res && res.success) {
                setMembers(res.teams || []);
            }
        } catch (err) {
            console.error('[AdminTeams] Load failed:', err);
            showToast(err.message || 'Error loading council members', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTeamMembers();
    }, [loadTeamMembers]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleOpenCreate = () => {
        setEditingMember(null);
        setFormData({
            name: '',
            role: '',
            department: '',
            image_url: '',
            linkedin_url: '',
            github_url: '',
            order_index: members.length + 1,
        });
        setAvatarFiles([]);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (member) => {
        setEditingMember(member);
        setFormData({
            name: member.name || '',
            role: member.role || '',
            department: member.department || '',
            image_url: member.image_url || '',
            linkedin_url: member.linkedin_url || '',
            github_url: member.github_url || '',
            order_index: member.order_index || 0,
        });
        setAvatarFiles([]);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToast('Member name is required', 'error');
            return;
        }
        if (!formData.role.trim()) {
            showToast('Panel and role are required', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim(),
                role: formData.role.trim(),
                department: formData.department.trim(),
                image_url: formData.image_url.trim() || null,
                linkedin_url: formData.linkedin_url.trim() || null,
                github_url: formData.github_url.trim() || null,
                order_index: parseInt(formData.order_index, 10) || 0,
            };

            if (editingMember) {
                await api.teams.update(editingMember.id, payload, avatarFiles[0]?.file);
                showToast('Member details updated');
            } else {
                await api.teams.create(payload, avatarFiles[0]?.file);
                showToast('New council member added');
            }
            setIsModalOpen(false);
            setAvatarFiles([]);
            loadTeamMembers();
        } catch (err) {
            showToast(err.message || 'Failed to save member', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePermanent = async () => {
        if (!deleteConfirmMember) return;
        try {
            await api.teams.delete(deleteConfirmMember.id);
            showToast('Member removed from council directory');
            setDeleteConfirmMember(null);
            loadTeamMembers();
        } catch (err) {
            showToast(err.message || 'Failed to remove member', 'error');
        }
    };

    const filteredMembers = members.filter((m) =>
        (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.role || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.department || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.headerTitle}>Council Team Directory</h1>
                    <p className={styles.headerSubtitle}>
                        Manage student coordinators, faculty mentors, executive leadership, and technical team leads.
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={loadTeamMembers}
                        disabled={loading}
                    >
                        <RefreshCw size={15} />
                        <span>Refresh</span>
                    </button>
                    {canCreate('teams') && (
                        <button type="button" className={styles.btnPrimary} onClick={handleOpenCreate}>
                            <Plus size={16} />
                            <span>Add Member</span>
                        </button>
                    )}
                </div>
            </div>

            {toast && (
                <div className={toast.type === 'error' ? styles.toastError : styles.toastSuccess}>
                    {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Search */}
            <div className={styles.filterBar}>
                <div className={styles.searchGroup}>
                    <Search size={16} />
                    <select
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by name, panel, role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                    Total Council Members: <strong>{filteredMembers.length}</strong>
                </div>
            </div>

            {/* Directory Table */}
            <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Panel</th>
                                <th>Role</th>
                                <th>Social Links</th>
                                <th>Sort Order</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                        Loading team directory...
                                    </td>
                                </tr>
                            ) : filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                                        No team members found.
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((member) => (
                                    <tr key={member.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div
                                                    style={{
                                                        width: '38px',
                                                        height: '38px',
                                                        borderRadius: '50%',
                                                        background: '#e2e8f0',
                                                        overflow: 'hidden',
                                                        flexShrink: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.86rem',
                                                        fontWeight: 700,
                                                        color: '#475569',
                                                    }}
                                                >
                                                    {member.image_url ? (
                                                        <img
                                                            src={resolveMediaUrl(member.public_image_url || member.image_url)}
                                                            alt={member.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        member.name?.slice(0, 2).toUpperCase() || 'TM'
                                                    )}
                                                </div>
                                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{member.name}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.84rem', fontWeight: 500, color: '#334155' }}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                style={{
                                                    fontSize: '0.76rem',
                                                    background: '#f1f5f9',
                                                    color: '#475569',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {member.department || 'Council'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {member.linkedin_url && (
                                                    <a
                                                        href={member.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#0077b5' }}
                                                        title="LinkedIn Profile"
                                                    >
                                                        <LinkedinIcon size={15} />
                                                    </a>
                                                )}
                                                {member.github_url && (
                                                    <a
                                                        href={member.github_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#24292e' }}
                                                        title="GitHub Profile"
                                                    >
                                                        <GithubIcon size={15} />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                                #{member.order_index ?? 0}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className={styles.actionBtnGroup} style={{ justifyContent: 'flex-end' }}>
                                                {canUpdate('teams') && (
                                                    <button
                                                        type="button"
                                                        className={styles.actionIconBtn}
                                                        onClick={() => handleOpenEdit(member)}
                                                        title="Edit Member Details"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                )}
                                                {canDelete('teams') && (
                                                    <button
                                                        type="button"
                                                        className={`${styles.actionIconBtn} ${styles.actionIconBtnDanger}`}
                                                        onClick={() => setDeleteConfirmMember(member)}
                                                        title="Remove Member"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {editingMember ? 'Edit Council Member' : 'Add New Council Member'}
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
                                        placeholder="e.g. Dr. K. Ravindra / John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                                            Panel
                                        </label>
                                        <select
                                            className={styles.formSelect}
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value, department: '' })}
                                            required
                                        >
                                            <option value="">Select panel</option>
                                            <option>IIC Co-ordinators</option>
                                            <option>IIC Presidents</option>
                                            <option>Social Media Department</option>
                                            <option>Public Relations</option>
                                            <option>Web Development</option>
                                            <option>Events</option>
                                            <option>Review &amp; Validation</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Role</label>
                                        <select
                                            className={styles.formSelect}
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            disabled={!formData.role}
                                            required
                                        >
                                            <option value="">
                                                {formData.role ? 'Select role' : 'Select a panel first'}
                                            </option>
                                            {(panelRoles[formData.role] || []).map((roleOption) => (
                                                <option key={roleOption} value={roleOption}>
                                                    {roleOption}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Profile Image</label>
                                    <MultiImageUploader files={avatarFiles} onChange={setAvatarFiles} maxFiles={1} uploading={submitting} />
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>LinkedIn Profile URL</label>
                                        <input
                                            type="url"
                                            className={styles.formInput}
                                            placeholder="https://linkedin.com/in/..."
                                            value={formData.linkedin_url}
                                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>GitHub Profile URL</label>
                                        <input
                                            type="url"
                                            className={styles.formInput}
                                            placeholder="https://github.com/..."
                                            value={formData.github_url}
                                            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Display Priority / Order Index</label>
                                    <input
                                        type="number"
                                        className={styles.formInput}
                                        value={formData.order_index}
                                        onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                                    />
                                    <span className={styles.formHelper}>
                                        Lower numbers appear earlier in the public council directory.
                                    </span>
                                </div>
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
                                    {submitting ? 'Saving...' : editingMember ? 'Update Member' : 'Add to Council'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirmMember && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox} style={{ maxWidth: '440px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle} style={{ color: '#dc2626' }}>
                                Confirm Member Removal
                            </h2>
                            <button
                                type="button"
                                className={styles.modalCloseBtn}
                                onClick={() => setDeleteConfirmMember(null)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <p style={{ color: '#334155', fontSize: '0.9rem', margin: 0 }}>
                                Are you sure you want to remove <strong>{deleteConfirmMember.name}</strong> from the
                                council directory?
                            </p>
                            <div
                                style={{
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '0.75rem',
                                    fontSize: '0.8rem',
                                    color: '#475569',
                                }}
                            >
                                <strong>Safe Retention Policy:</strong> Historical events or submissions attributed to
                                this member remain intact.
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className={styles.btnSecondary}
                                onClick={() => setDeleteConfirmMember(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.btnDanger}
                                onClick={handleDeletePermanent}
                            >
                                Remove Member
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
