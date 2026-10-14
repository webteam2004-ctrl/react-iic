import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Archive,
    RefreshCw,
    Sparkles,
    MapPin,
    Clock,
    CheckCircle,
    AlertTriangle,
    X
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MultiImageUploader from '../../components/admin/MultiImageUploader';
import styles from './AdminCommon.module.css';

export default function AdminEvents() {
    const { canCreate, canUpdate, canDelete } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [toast, setToast] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [deleteConfirmEvent, setDeleteConfirmEvent] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploadFiles, setUploadFiles] = useState([]);

    // Form Fields
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: 'Campus / Online',
        status: 'upcoming',
        calendar_sync: true,
    });

    const loadEvents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.events.getAll({
                status: statusFilter === 'all' ? undefined : statusFilter,
            });
            if (res && res.success) {
                setEvents(res.events || []);
            }
        } catch (err) {
            console.error('[AdminEvents] Failed to load events:', err);
            showToast(err.message || 'Error loading events', 'error');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleOpenCreate = () => {
        setEditingEvent(null);
        setFormData({
            title: '',
            description: '',
            start_time: new Date().toISOString().slice(0, 16),
            end_time: '',
            location: 'Main Auditorium / Campus',
            status: 'upcoming',
            calendar_sync: true,
        });
        setUploadFiles([]);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (evt) => {
        setEditingEvent(evt);
        setFormData({
            title: evt.title || '',
            description: evt.description || '',
            start_time: evt.start_time ? new Date(evt.start_time).toISOString().slice(0, 16) : '',
            end_time: evt.end_time ? new Date(evt.end_time).toISOString().slice(0, 16) : '',
            location: evt.location || '',
            status: evt.status || 'upcoming',
            calendar_sync: evt.calendar_sync !== false,
        });
        setUploadFiles([]);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            showToast('Event title is required', 'error');
            return;
        }
        if (!formData.start_time) {
            showToast('Event start date and time is required', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                start_time: new Date(formData.start_time).toISOString(),
                end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
            };

            let savedEvent;
            if (editingEvent) {
                const response = await api.events.update(editingEvent.id, payload);
                savedEvent = response.event;
                showToast('Event updated successfully');
            } else {
                const response = await api.events.create(payload);
                savedEvent = response.event;
                showToast('Event created successfully');
            }
            if (uploadFiles.length > 0 && savedEvent?.id) {
                await api.gallery.upload(uploadFiles, savedEvent.id);
            }
            setUploadFiles([]);
            setIsModalOpen(false);
            loadEvents();
        } catch (err) {
            showToast(err.message || 'Failed to save event', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleArchive = async (id) => {
        try {
            await api.events.delete(id, true); // soft delete
            showToast('Event marked as archived');
            loadEvents();
        } catch (err) {
            showToast(err.message || 'Failed to archive event', 'error');
        }
    };

    const handleDeletePermanent = async () => {
        if (!deleteConfirmEvent) return;
        try {
            await api.events.delete(deleteConfirmEvent.id, false);
            showToast('Event deleted permanently');
            setDeleteConfirmEvent(null);
            loadEvents();
        } catch (err) {
            showToast(err.message || 'Failed to delete event', 'error');
        }
    };

    // Filtered list by client-side search
    const filteredEvents = events.filter((e) =>
        (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.location || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.headerTitle}>Events Management</h1>
                    <p className={styles.headerSubtitle}>
                        Create, schedule, and curate institutional hackathons, workshops, and competitions.
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={loadEvents}
                        disabled={loading}
                    >
                        <RefreshCw size={15} />
                        <span>Refresh</span>
                    </button>

                    <Link to="/admin/pipeline" className={styles.btnSecondary}>
                        <Sparkles size={15} color="#4338ca" />
                        <span>Unified Pipeline</span>
                    </Link>

                    {canCreate('events') && (
                        <button type="button" className={styles.btnPrimary} onClick={handleOpenCreate}>
                            <Plus size={16} />
                            <span>New Event</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Toast Alert */}
            {toast && (
                <div className={toast.type === 'error' ? styles.toastError : styles.toastSuccess}>
                    {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Search and Filters */}
            <div className={styles.filterBar}>
                <div className={styles.searchGroup}>
                    <Search size={16} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by event title, location..."
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
                        <option value="all">All Statuses</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            {/* Events Table Card */}
            <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Event Title</th>
                                <th>Date & Schedule</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Calendar Sync</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                                        Loading events records...
                                    </td>
                                </tr>
                            ) : filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                        No events found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredEvents.map((evt) => {
                                    const dateStr = evt.start_time
                                        ? new Date(evt.start_time).toLocaleString(undefined, {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })
                                        : 'Unscheduled';

                                    const statusClass =
                                        evt.status === 'upcoming'
                                            ? styles.badgeUpcoming
                                            : evt.status === 'ongoing'
                                                ? styles.badgeOngoing
                                                : evt.status === 'completed'
                                                    ? styles.badgeCompleted
                                                    : evt.status === 'cancelled'
                                                        ? styles.badgeCancelled
                                                        : styles.badgeArchived;

                                    return (
                                        <tr key={evt.id}>
                                            <td>
                                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{evt.title}</div>
                                                {evt.description && (
                                                    <div
                                                        style={{
                                                            fontSize: '0.78rem',
                                                            color: '#64748b',
                                                            maxWidth: '320px',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {evt.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem' }}>
                                                    <Clock size={13} color="#64748b" />
                                                    <span>{dateStr}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem' }}>
                                                    <MapPin size={13} color="#64748b" />
                                                    <span>{evt.location || 'Campus / Online'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.badge} ${statusClass}`}>{evt.status}</span>
                                            </td>
                                            <td>
                                                {evt.calendar_sync ? (
                                                    <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                                                        ✓ Active
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Disabled</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles.actionBtnGroup} style={{ justifyContent: 'flex-end' }}>
                                                    {/* Open in Unified Pipeline */}
                                                    <Link
                                                        to={`/admin/pipeline?eventId=${evt.id}`}
                                                        className={styles.actionIconBtn}
                                                        title="Open in Unified Publishing Pipeline"
                                                    >
                                                        <Sparkles size={14} color="#4338ca" />
                                                    </Link>

                                                    {/* Edit */}
                                                    {canUpdate('events') && (
                                                        <button
                                                            type="button"
                                                            className={styles.actionIconBtn}
                                                            onClick={() => handleOpenEdit(evt)}
                                                            title="Edit Event"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                    )}

                                                    {/* Soft Archive */}
                                                    {canUpdate('events') && evt.status !== 'archived' && (
                                                        <button
                                                            type="button"
                                                            className={styles.actionIconBtn}
                                                            onClick={() => handleArchive(evt.id)}
                                                            title="Archive Event (Soft Delete)"
                                                        >
                                                            <Archive size={14} />
                                                        </button>
                                                    )}

                                                    {/* Delete */}
                                                    {canDelete('events') && (
                                                        <button
                                                            type="button"
                                                            className={`${styles.actionIconBtn} ${styles.actionIconBtnDanger}`}
                                                            onClick={() => setDeleteConfirmEvent(evt)}
                                                            title="Delete Event"
                                                        >
                                                            <Trash2 size={14} />
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

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {editingEvent ? 'Edit Event Details' : 'Create New Event'}
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
                                        Event Title
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.formInput}
                                        placeholder="e.g. Smart India Hackathon 2026 Internal Round"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Description</label>
                                    <textarea
                                        className={styles.formTextarea}
                                        placeholder="Details about participation criteria, prizes, or schedules..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                                            Start Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className={styles.formInput}
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>End Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            className={styles.formInput}
                                            value={formData.end_time}
                                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Location / Venue</label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            placeholder="e.g. SAC Auditorium, VVIT"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Event Status</label>
                                        <select
                                            className={styles.formSelect}
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="upcoming">Upcoming</option>
                                            <option value="ongoing">Ongoing</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGroup} style={{ marginTop: '0.5rem' }}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={formData.calendar_sync}
                                            onChange={(e) => setFormData({ ...formData, calendar_sync: e.target.checked })}
                                        />
                                        <span>Synchronize to Institutional Academic Calendar</span>
                                    </label>
                                    <span className={styles.formHelper}>
                                        When checked, this event automatically appears on the public website calendar.
                                    </span>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Event Images</label>
                                    <MultiImageUploader files={uploadFiles} onChange={setUploadFiles} uploading={submitting} />
                                    <span className={styles.formHelper}>The first uploaded image is used as the event cover. Existing event images remain attached when editing.</span>
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
                                    {submitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmEvent && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox} style={{ maxWidth: '440px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle} style={{ color: '#dc2626' }}>
                                Confirm Permanent Deletion
                            </h2>
                            <button
                                type="button"
                                className={styles.modalCloseBtn}
                                onClick={() => setDeleteConfirmEvent(null)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                                Are you sure you want to permanently delete <strong>{deleteConfirmEvent.title}</strong>?
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
                                <strong>Safe Retention Note:</strong> Deleting this event automatically unlinks any attached gallery media without destroying the media files themselves.
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className={styles.btnSecondary}
                                onClick={() => setDeleteConfirmEvent(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.btnDanger}
                                onClick={handleDeletePermanent}
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
