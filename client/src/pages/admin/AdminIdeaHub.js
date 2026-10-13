import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    FolderGit2,
    Search,
    RefreshCw,
    Eye,
    CheckCircle,
    Mail,
    Phone,
    X,
    AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminCommon.module.css';

const GithubIcon = ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
);

export default function AdminIdeaHub() {
    const { canUpdate, isAnalyst } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [toast, setToast] = useState(null);

    const loadChallenges = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.challenges.getAll();
            if (res && res.success) {
                setChallenges(res.challenges || []);
            }
        } catch (err) {
            console.error('[AdminIdeaHub] Fetch error:', err);
            showToast(err.message || 'Error loading SIH submissions', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadChallenges();
    }, [loadChallenges]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleUpdateWebReview = async (id, newStatus) => {
        if (!canUpdate('idea_hub') || isAnalyst()) return;
        setUpdatingId(id);
        try {
            await api.challenges.updateWebReview(id, newStatus);
            showToast(`Web Team status updated to "${newStatus}"`);
            // Update local state
            setChallenges((prev) =>
                prev.map((c) => (c.id === id ? { ...c, web_team_review_status: newStatus } : c))
            );
            if (selectedChallenge?.id === id) {
                setSelectedChallenge((prev) => ({ ...prev, web_team_review_status: newStatus }));
            }
        } catch (err) {
            showToast(err.message || 'Failed to update review status', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleUpdateFacultyReview = async (id, newStatus) => {
        if (!canUpdate('idea_hub') || isAnalyst()) return;
        setUpdatingId(id);
        try {
            await api.challenges.updateFacultyReview(id, newStatus);
            showToast(`Faculty review status updated to "${newStatus}"`);
            setChallenges((prev) =>
                prev.map((c) => (c.id === id ? { ...c, faculty_review_status: newStatus } : c))
            );
            if (selectedChallenge?.id === id) {
                setSelectedChallenge((prev) => ({ ...prev, faculty_review_status: newStatus }));
            }
        } catch (err) {
            showToast(err.message || 'Failed to update faculty review status', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    // Filtered
    const filtered = challenges.filter((c) => {
        const matchesSearch =
            (c.team_lead_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.register_number || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.branch || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.problem_statement_details || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.batch_id || '').toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;
        if (statusFilter === 'all') return true;
        if (statusFilter === 'pending')
            return c.web_team_review_status === 'Pending' || c.faculty_review_status === 'Pending';
        if (statusFilter === 'approved')
            return c.web_team_review_status === 'Approved' && c.faculty_review_status === 'Approved';
        if (statusFilter === 'rejected')
            return c.web_team_review_status === 'Rejected' || c.faculty_review_status === 'Rejected';
        return true;
    });

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.headerTitle}>Idea Hub & SIH Reviews</h1>
                    <p className={styles.headerSubtitle}>
                        Evaluate Smart India Hackathon problem proposals, student prototypes, and project repositories.
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={loadChallenges}
                        disabled={loading}
                    >
                        <RefreshCw size={15} />
                        <span>Refresh</span>
                    </button>
                    <Link to="/admin-challenges" className={styles.btnSecondary}>
                        <FolderGit2 size={15} />
                        <span>Classic Review Portal</span>
                    </Link>
                </div>
            </div>

            {toast && (
                <div className={toast.type === 'error' ? styles.toastError : styles.toastSuccess}>
                    {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className={styles.filterBar}>
                <div className={styles.searchGroup}>
                    <Search size={16} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by team lead, reg number, branch, problem statement..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className={styles.filterControls}>
                    <select
                        className={styles.selectInput}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Submissions ({challenges.length})</option>
                        <option value="pending">Pending Evaluation</option>
                        <option value="approved">Fully Approved</option>
                        <option value="rejected">Rejected / Needs Revisions</option>
                    </select>
                </div>
            </div>

            {/* Submissions Table Card */}
            <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Team Lead & Reg No</th>
                                <th>Branch & Year</th>
                                <th>Problem Statement</th>
                                <th>Web Team Review</th>
                                <th>Faculty Review</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                        Loading SIH submissions...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                                        No challenge proposals found matching search criteria.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => {
                                    const webStatus = item.web_team_review_status || 'Pending';
                                    const facultyStatus = item.faculty_review_status || 'Pending';

                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                                    {item.team_lead_name || 'Anonymous Leader'}
                                                </div>
                                                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                                    {item.register_number || 'No Reg No'} {item.batch_id ? `• Batch ${item.batch_id}` : ''}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.84rem', fontWeight: 500, color: '#334155' }}>
                                                    {item.branch || '—'}
                                                </div>
                                                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                                    Year {item.year || '—'}
                                                </div>
                                            </td>
                                            <td>
                                                <div
                                                    style={{
                                                        maxWidth: '280px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        fontSize: '0.84rem',
                                                        color: '#1e293b',
                                                    }}
                                                    title={item.problem_statement_details}
                                                >
                                                    {item.problem_statement_details || 'No statement provided'}
                                                </div>
                                                {item.github_repo_link && (
                                                    <a
                                                        href={item.github_repo_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            fontSize: '0.74rem',
                                                            color: '#4338ca',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '3px',
                                                            marginTop: '2px',
                                                            textDecoration: 'none',
                                                        }}
                                                    >
                                                        <GithubIcon size={11} /> GitHub Repo ↗
                                                    </a>
                                                )}
                                            </td>
                                            <td>
                                                <select
                                                    className={styles.selectInput}
                                                    style={{
                                                        fontSize: '0.78rem',
                                                        padding: '3px 8px',
                                                        fontWeight: 600,
                                                        borderColor:
                                                            webStatus === 'Approved'
                                                                ? '#a7f3d0'
                                                                : webStatus === 'Rejected'
                                                                    ? '#fecaca'
                                                                    : '#fde68a',
                                                        background:
                                                            webStatus === 'Approved'
                                                                ? '#ecfdf5'
                                                                : webStatus === 'Rejected'
                                                                    ? '#fef2f2'
                                                                    : '#fffbeb',
                                                        color:
                                                            webStatus === 'Approved'
                                                                ? '#065f46'
                                                                : webStatus === 'Rejected'
                                                                    ? '#991b1b'
                                                                    : '#92400e',
                                                    }}
                                                    value={webStatus}
                                                    disabled={!canUpdate('idea_hub') || isAnalyst() || updatingId === item.id}
                                                    onChange={(e) => handleUpdateWebReview(item.id, e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select
                                                    className={styles.selectInput}
                                                    style={{
                                                        fontSize: '0.78rem',
                                                        padding: '3px 8px',
                                                        fontWeight: 600,
                                                        borderColor:
                                                            facultyStatus === 'Approved'
                                                                ? '#a7f3d0'
                                                                : facultyStatus === 'Rejected'
                                                                    ? '#fecaca'
                                                                    : '#fde68a',
                                                        background:
                                                            facultyStatus === 'Approved'
                                                                ? '#ecfdf5'
                                                                : facultyStatus === 'Rejected'
                                                                    ? '#fef2f2'
                                                                    : '#fffbeb',
                                                        color:
                                                            facultyStatus === 'Approved'
                                                                ? '#065f46'
                                                                : facultyStatus === 'Rejected'
                                                                    ? '#991b1b'
                                                                    : '#92400e',
                                                    }}
                                                    value={facultyStatus}
                                                    disabled={!canUpdate('idea_hub') || isAnalyst() || updatingId === item.id}
                                                    onChange={(e) => handleUpdateFacultyReview(item.id, e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    type="button"
                                                    className={styles.actionIconBtn}
                                                    onClick={() => setSelectedChallenge(item)}
                                                    title="View Full Submission Details"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Submission Detail Modal */}
            {selectedChallenge && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox} style={{ maxWidth: '680px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>SIH Innovation Proposal Details</h2>
                            <button
                                type="button"
                                className={styles.modalCloseBtn}
                                onClick={() => setSelectedChallenge(null)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.modalBody} style={{ gap: '1.25rem' }}>
                            {/* Header Card */}
                            <div
                                style={{
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    padding: '1.25rem',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1rem',
                                }}
                            >
                                <div>
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                                        Team Lead
                                    </span>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                                        {selectedChallenge.team_lead_name}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                                        Reg: {selectedChallenge.register_number}
                                    </div>
                                </div>

                                <div>
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                                        Academic Info
                                    </span>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                                        {selectedChallenge.branch} • Year {selectedChallenge.year}
                                    </div>
                                    {selectedChallenge.batch_id && (
                                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                                            Batch: {selectedChallenge.batch_id}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                                        Contact Channels
                                    </span>
                                    {selectedChallenge.email && (
                                        <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Mail size={12} color="#64748b" /> {selectedChallenge.email}
                                        </div>
                                    )}
                                    {selectedChallenge.contact_number && (
                                        <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Phone size={12} color="#64748b" /> {selectedChallenge.contact_number}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Problem Statement */}
                            <div>
                                <label className={styles.formLabel} style={{ fontSize: '0.84rem' }}>
                                    Problem Statement & Solution Architecture
                                </label>
                                <div
                                    style={{
                                        background: '#ffffff',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        fontSize: '0.88rem',
                                        lineHeight: 1.6,
                                        color: '#1e293b',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {selectedChallenge.problem_statement_details || 'No details provided.'}
                                </div>
                            </div>

                            {/* Technical Contribution */}
                            {selectedChallenge.technical_contribution && (
                                <div>
                                    <label className={styles.formLabel} style={{ fontSize: '0.84rem' }}>
                                        Technical Contribution & Implementation
                                    </label>
                                    <div
                                        style={{
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            padding: '0.85rem',
                                            fontSize: '0.84rem',
                                            color: '#334155',
                                        }}
                                    >
                                        {selectedChallenge.technical_contribution}
                                    </div>
                                </div>
                            )}

                            {/* Challenge Reason */}
                            {selectedChallenge.challenge_reason && (
                                <div>
                                    <label className={styles.formLabel} style={{ fontSize: '0.84rem' }}>
                                        Challenge Reason / Motivation
                                    </label>
                                    <div
                                        style={{
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            padding: '0.85rem',
                                            fontSize: '0.84rem',
                                            color: '#334155',
                                        }}
                                    >
                                        {selectedChallenge.challenge_reason}
                                    </div>
                                </div>
                            )}

                            {/* GitHub Link */}
                            {selectedChallenge.github_repo_link && (
                                <div>
                                    <a
                                        href={selectedChallenge.github_repo_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.btnSecondary}
                                        style={{ width: 'fit-content' }}
                                    >
                                        <GithubIcon size={16} /> Open GitHub Project Repository ↗
                                    </a>
                                </div>
                            )}

                            {/* Review Decision Controls */}
                            <div
                                style={{
                                    borderTop: '1px solid #f1f5f9',
                                    paddingTop: '1rem',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem',
                                }}
                            >
                                <div>
                                    <label className={styles.formLabel}>Web Team Decision</label>
                                    <select
                                        className={styles.formSelect}
                                        value={selectedChallenge.web_team_review_status || 'Pending'}
                                        disabled={!canUpdate('idea_hub') || isAnalyst()}
                                        onChange={(e) =>
                                            handleUpdateWebReview(selectedChallenge.id, e.target.value)
                                        }
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={styles.formLabel}>Faculty Review Decision</label>
                                    <select
                                        className={styles.formSelect}
                                        value={selectedChallenge.faculty_review_status || 'Pending'}
                                        disabled={!canUpdate('idea_hub') || isAnalyst()}
                                        onChange={(e) =>
                                            handleUpdateFacultyReview(selectedChallenge.id, e.target.value)
                                        }
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className={styles.btnSecondary}
                                onClick={() => setSelectedChallenge(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
