import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Sparkles,
    Image,
    Layers,
    CheckCircle2,
    AlertCircle,
    Clock,
    MapPin,
    ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MultiImageUploader from '../../components/admin/MultiImageUploader';
import styles from './AdminCommon.module.css';

export default function AdminPipeline() {
    const { canCreate, canUpdate } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const eventIdParam = searchParams.get('eventId');

    const [existingEvents, setExistingEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(eventIdParam || '');
    const [loadingInitial, setLoadingInitial] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('Main Campus Auditorium, VVIT');
    const [status, setStatus] = useState('upcoming');
    const [calendarSync, setCalendarSync] = useState(true);

    // Newly selected media files; existing event media remains attached on update.
    const [mediaItems, setMediaItems] = useState([]);

    // Load existing events list for dropdown
    useEffect(() => {
        async function fetchEventsList() {
            try {
                const res = await api.events.getAll();
                if (res && res.success) {
                    setExistingEvents(res.events || []);
                }
            } catch (e) {
                console.error('Failed to load events for pipeline dropdown:', e);
            }
        }
        fetchEventsList();
    }, []);

    // If eventIdParam or selectedEventId changes, populate details
    useEffect(() => {
        if (!selectedEventId) {
            // Reset to blank for new creation
            setTitle('');
            setDescription('');
            setStartTime(new Date().toISOString().slice(0, 16));
            setEndTime('');
            setLocation('Main Campus Auditorium, VVIT');
            setStatus('upcoming');
            setCalendarSync(true);
            return;
        }

        async function loadEventDetails() {
            setLoadingInitial(true);
            setError(null);
            try {
                const res = await api.events.getById(selectedEventId);
                if (res && res.success && res.event) {
                    const ev = res.event;
                    setTitle(ev.title || '');
                    setDescription(ev.description || '');
                    setStartTime(ev.start_time ? new Date(ev.start_time).toISOString().slice(0, 16) : '');
                    setEndTime(ev.end_time ? new Date(ev.end_time).toISOString().slice(0, 16) : '');
                    setLocation(ev.location || '');
                    setStatus(ev.status || 'upcoming');
                    setCalendarSync(ev.calendar_sync !== false);

                    setMediaItems([]);
                }
            } catch (err) {
                setError('Failed to load event details: ' + err.message);
            } finally {
                setLoadingInitial(false);
            }
        }

        loadEventDetails();
    }, [selectedEventId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Event Title is required for the publishing pipeline.');
            return;
        }
        if (!startTime) {
            setError('Event Start Date & Time is required.');
            return;
        }

        setSubmitting(true);
        setError(null);
        setResult(null);

        const payload = {
            event_id: selectedEventId || undefined,
            title: title.trim(),
            description: description.trim(),
            start_time: new Date(startTime).toISOString(),
            end_time: endTime ? new Date(endTime).toISOString() : null,
            location: location.trim(),
            status,
            calendar_sync: Boolean(calendarSync),
        };

        try {
            const response = await api.pipeline.publish(payload, mediaItems);
            if (response && response.success) {
                setResult(response);
            } else {
                throw new Error(response.message || 'Pipeline publication failed');
            }
        } catch (err) {
            console.error('[AdminPipeline] Publication error:', err);
            setError(err.message || 'Error occurred while executing pipeline transaction');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.headerTitle}>
                        <span style={{ color: '#4338ca' }}>Unified</span> Publishing Pipeline
                    </h1>
                    <p className={styles.headerSubtitle}>
                        Single Source of Truth (SSOT) engine: publish once to synchronize Events, Public Calendar, and Gallery Media simultaneously.
                    </p>
                </div>
            </div>

            {/* Target Selector */}
            <div className={styles.filterBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', flexWrap: 'wrap' }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                        Pipeline Target:
                    </label>
                    <select
                        className={styles.selectInput}
                        style={{ minWidth: '320px', flex: 1 }}
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                        <option value="">+ Create Brand New Event & Synchronize Pipeline</option>
                        {existingEvents.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                                Update: {ev.title} ({ev.status})
                            </option>
                        ))}
                    </select>

                    {selectedEventId && (
                        <button
                            type="button"
                            className={styles.btnSecondary}
                            onClick={() => setSelectedEventId('')}
                        >
                            Reset to New Event
                        </button>
                    )}
                </div>
            </div>

            {/* Success Notification Result */}
            {result && (
                <div className={styles.toastSuccess} style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, fontSize: '0.98rem' }}>
                        <CheckCircle2 size={20} color="#059669" />
                        <span>{result.message}</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.84rem', lineHeight: 1.6, color: '#065f46' }}>
                        <div>• Event ID: <strong>{result.event?.id}</strong> ("{result.event?.title}")</div>
                        <div>• Calendar Status: <strong>{result.event?.calendar_sync ? 'Synced to Public Calendar' : 'Unsynced'}</strong></div>
                        <div>• Gallery Media Attached: <strong>{result.gallery_items_created || 0} media items</strong></div>
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                        <button
                            type="button"
                            className={styles.btnPrimary}
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                            onClick={() => navigate('/admin/events')}
                        >
                            View in Events Manager <ArrowRight size={14} />
                        </button>
                        <button
                            type="button"
                            className={styles.btnSecondary}
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                            onClick={() => setResult(null)}
                        >
                            Dismiss Receipt
                        </button>
                    </div>
                </div>
            )}

            {/* Error alert */}
            {error && (
                <div className={styles.toastError}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Publishing Form */}
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
                    {/* Left Column: Event Core Data */}
                    <div className={styles.tableCard} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Layers size={18} color="#4338ca" />
                                1. Event Metadata & Schedule
                            </h2>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>Event Title</label>
                            <input
                                type="text"
                                className={styles.formInput}
                                placeholder="e.g. Astrion 2026 Space Innovation Bootcamp"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Description</label>
                            <textarea
                                className={styles.formTextarea}
                                rows={3}
                                placeholder="Detailed objectives, registration guidelines, or problem statement hints..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className={styles.formInput}
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className={styles.formInput}
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Venue / Location</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Status</label>
                                <select
                                    className={styles.formSelect}
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        {/* Calendar Synchronization Toggle */}
                        <div
                            style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.4rem',
                            }}
                        >
                            <label className={styles.checkboxLabel} style={{ fontWeight: 600 }}>
                                <input
                                    type="checkbox"
                                    checked={calendarSync}
                                    onChange={(e) => setCalendarSync(e.target.checked)}
                                />
                                <span style={{ color: '#0f172a' }}>Sync to Academic Calendar</span>
                            </label>
                            <span className={styles.formHelper}>
                                Public `/calendar` route will automatically pull and render this event in monthly/weekly views.
                            </span>
                        </div>

                        {/* Media Attachment section */}
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Image size={17} color="#0891b2" />
                                    2. Gallery Media Attachments ({mediaItems.length} items)
                                </h3>
                            </div>
                            <MultiImageUploader
                                files={mediaItems}
                                onChange={setMediaItems}
                                uploading={submitting}
                            />
                            <span className={styles.formHelper}>
                                Select one or more images from your laptop. Captions are optional and the first uploaded image becomes the event cover.
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Live Pipeline Preview & Submission */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className={styles.tableCard} style={{ padding: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
                                Pipeline Live Preview
                            </h2>

                            <div
                                style={{
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span
                                        className={`${styles.badge} ${status === 'upcoming'
                                            ? styles.badgeUpcoming
                                            : status === 'ongoing'
                                                ? styles.badgeOngoing
                                                : styles.badgeCompleted
                                            }`}
                                    >
                                        {status}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: calendarSync ? '#059669' : '#94a3b8', fontWeight: 600 }}>
                                        {calendarSync ? '✓ Calendar Synced' : '✕ No Calendar'}
                                    </span>
                                </div>

                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                                    {title || 'Untitled Event'}
                                </div>

                                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                                    {description || 'Event description will appear here on public cards.'}
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} color="#64748b" />
                                        <span>
                                            {startTime
                                                ? new Date(startTime).toLocaleString(undefined, {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })
                                                : 'Date TBA'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MapPin size={14} color="#64748b" />
                                        <span>{location || 'Location TBA'}</span>
                                    </div>
                                </div>

                                {/* Media thumbnail previews */}
                                {mediaItems.length > 0 && (
                                    <div style={{ marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>
                                            Attached Media Previews:
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {mediaItems
                                                .map((m, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            width: '64px',
                                                            height: '50px',
                                                            borderRadius: '6px',
                                                            overflow: 'hidden',
                                                            border: '1px solid #cbd5e1',
                                                            background: '#e2e8f0',
                                                        }}
                                                    >
                                                        <img
                                                            src={m.preview}
                                                            alt={m.file.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div style={{ marginTop: '1.5rem' }}>
                                <button
                                    type="submit"
                                    className={styles.btnPrimary}
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.8rem 1rem' }}
                                    disabled={
                                        submitting ||
                                        loadingInitial ||
                                        (!selectedEventId ? !canCreate('events') : !canUpdate('events'))
                                    }
                                >
                                    <Sparkles size={17} />
                                    <span>
                                        {submitting
                                            ? 'Publishing Pipeline Transaction...'
                                            : selectedEventId
                                                ? 'Update & Synchronize Pipeline'
                                                : 'Publish to Unified Pipeline'}
                                    </span>
                                </button>
                                <div style={{ fontSize: '0.74rem', color: '#64748b', textAlign: 'center', marginTop: '0.6rem' }}>
                                    Atomic transaction: updates database event and calendar sync safely.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
