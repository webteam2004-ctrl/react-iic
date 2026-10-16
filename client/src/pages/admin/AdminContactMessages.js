import React, { useCallback, useEffect, useState } from 'react';
import { Eye, RefreshCw, Search, Trash2, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminCommon.module.css';

const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In progress' },
    { value: 'resolved', label: 'Resolved' }
];

const formatDate = (value) => value ? new Date(value).toLocaleString() : '—';

export default function AdminContactMessages() {
    const { canUpdate, canDelete } = useAuth();
    const [messages, setMessages] = useState([]);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 4000);
    };

    const loadMessages = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.contact.list({ search, status, page, limit: 20 });
            setMessages(response.messages || []);
            setPagination(response.pagination || { pages: 1, total: 0 });
        } catch (error) {
            showToast(error.message || 'Failed to load contact messages', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const openMessage = async (id) => {
        try {
            const response = await api.contact.getById(id);
            setSelected(response.message);
        } catch (error) {
            showToast(error.message || 'Failed to load message details', 'error');
        }
    };

    const saveMessage = async () => {
        if (!selected || saving) return;
        setSaving(true);
        try {
            const response = await api.contact.update(selected.id, {
                status: selected.status,
                admin_notes: selected.admin_notes || ''
            });
            setSelected(response.message);
            await loadMessages();
            showToast('Contact message updated');
        } catch (error) {
            showToast(error.message || 'Failed to update message', 'error');
        } finally {
            setSaving(false);
        }
    };

    const deleteMessage = async () => {
        if (!selected || !window.confirm('Delete this contact message permanently?')) return;
        try {
            await api.contact.delete(selected.id);
            setSelected(null);
            await loadMessages();
            showToast('Contact message deleted');
        } catch (error) {
            showToast(error.message || 'Failed to delete message', 'error');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.headerTitle}>Contact Messages</h1>
                    <p className={styles.headerSubtitle}>Review visitor enquiries and manage follow-up status privately.</p>
                </div>
                <button type="button" className={styles.btnSecondary} onClick={loadMessages} disabled={loading}>
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            {toast && (
                <div className={toast.type === 'error' ? styles.toastError : styles.toastSuccess}>
                    {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    {toast.message}
                </div>
            )}

            <div className={styles.filterBar}>
                <div className={styles.searchGroup}>
                    <Search size={16} />
                    <input
                        className={styles.searchInput}
                        placeholder="Search name, email, or subject..."
                        value={search}
                        onChange={(event) => { setPage(1); setSearch(event.target.value); }}
                    />
                </div>
                <select className={styles.formSelect} value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
                    {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <span style={{ color: '#64748b', fontSize: '0.84rem' }}>{pagination.total || 0} messages</span>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead><tr><th>Sender</th><th>Subject</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Loading contact messages...</td></tr>
                            ) : messages.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No contact messages found.</td></tr>
                            ) : messages.map((message) => (
                                <tr key={message.id}>
                                    <td><strong>{message.full_name}</strong><br /><small>{message.email}</small></td>
                                    <td>{message.subject}</td>
                                    <td>{formatDate(message.created_at)}</td>
                                    <td><span style={{ color: '#27358f', fontWeight: 700 }}>{message.status}</span></td>
                                    <td><button type="button" className={styles.actionIconBtn} title="View message" onClick={() => openMessage(message.id)}><Eye size={15} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '1rem' }}>
                    <button type="button" className={styles.btnSecondary} disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
                    <span style={{ alignSelf: 'center' }}>Page {page} of {pagination.pages}</span>
                    <button type="button" className={styles.btnSecondary} disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)}>Next</button>
                </div>
            )}

            {selected && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Message details</h2>
                            <button type="button" className={styles.modalCloseBtn} onClick={() => setSelected(null)}><X size={18} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <p><strong>{selected.full_name}</strong> · {selected.email}</p>
                            <p>{selected.department_year || 'Department/year not provided'} · {formatDate(selected.created_at)}</p>
                            <h3>{selected.subject}</h3>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{selected.message}</p>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Status</label>
                                <select className={styles.formSelect} disabled={!canUpdate('contact_messages')} value={selected.status} onChange={(event) => setSelected({ ...selected, status: event.target.value })}>
                                    {STATUS_OPTIONS.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Private admin notes</label>
                                <textarea className={styles.formInput} rows="5" disabled={!canUpdate('contact_messages')} value={selected.admin_notes || ''} onChange={(event) => setSelected({ ...selected, admin_notes: event.target.value })} />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.btnSecondary} onClick={() => setSelected(null)}>Close</button>
                            {canDelete('contact_messages') && <button type="button" className={styles.btnSecondary} onClick={deleteMessage}><Trash2 size={15} /> Delete</button>}
                            {canUpdate('contact_messages') && <button type="button" className={styles.btnPrimary} disabled={saving} onClick={saveMessage}>{saving ? 'Saving...' : 'Save changes'}</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
