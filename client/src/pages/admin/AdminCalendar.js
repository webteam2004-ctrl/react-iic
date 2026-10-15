import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Sparkles,
    RefreshCw,
    Edit3,
    CheckCircle,
    AlertTriangle,
    X
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminCommon.module.css';

export default function AdminCalendar() {
    const { canUpdate } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month'); // 'month' | 'agenda'
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Selected event modal
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [rescheduleData, setRescheduleData] = useState({
        start_time: '',
        end_time: '',
        calendar_sync: true,
    });
    const [updating, setUpdating] = useState(false);

    const loadCalendarEvents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.calendar.getSchedule();
            if (res && res.success) {
                setEvents(res.events || []);
            }
        } catch (err) {
            console.error('[AdminCalendar] Error fetching calendar:', err);
            showToast(err.message || 'Failed to load calendar events', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCalendarEvents();
    }, [loadCalendarEvents]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleSelectEvent = (evt) => {
        setSelectedEvent(evt);
        setRescheduleData({
            start_time: evt.start_time ? new Date(evt.start_time).toISOString().slice(0, 16) : '',
            end_time: evt.end_time ? new Date(evt.end_time).toISOString().slice(0, 16) : '',
            calendar_sync: evt.calendar_sync !== false,
        });
    };

    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        setUpdating(true);

        try {
            const payload = {
                start_time: new Date(rescheduleData.start_time).toISOString(),
                end_time: rescheduleData.end_time ? new Date(rescheduleData.end_time).toISOString() : null,
                calendar_sync: Boolean(rescheduleData.calendar_sync),
            };

            const res = await api.calendar.updateSchedule(selectedEvent.id, payload);
            if (res && res.success) {
                showToast('Event schedule updated in calendar');
                setSelectedEvent(null);
                loadCalendarEvents();
            }
        } catch (err) {
            showToast(err.message || 'Failed to update schedule', 'error');
        } finally {
            setUpdating(false);
        }
    };

    // Calendar matrix calculations
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Group events by day of current month
    const eventsByDay = {};
    events.forEach((evt) => {
        if (!evt.start_time) return;
        const d = new Date(evt.start_time);
        if (d.getFullYear() === year && d.getMonth() === month) {
            const dateNum = d.getDate();
            if (!eventsByDay[dateNum]) eventsByDay[dateNum] = [];
            eventsByDay[dateNum].push(evt);
        }
    });

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.headerTitle}>Academic Calendar Management</h1>
                    <p className={styles.headerSubtitle}>
                        Centralized schedule synchronized automatically with all published innovation council events.
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={loadCalendarEvents}
                        disabled={loading}
                    >
                        <RefreshCw size={15} />
                        <span>Sync</span>
                    </button>
                    <Link to="/admin/pipeline" className={styles.btnPrimary}>
                        <Sparkles size={16} />
                        <span>Publish to Calendar</span>
                    </Link>
                </div>
            </div>

            {toast && (
                <div className={toast.type === 'error' ? styles.toastError : styles.toastSuccess}>
                    {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Calendar Controls */}
            <div className={styles.filterBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0, minWidth: '180px' }}>
                        {monthName}
                    </h2>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button type="button" className={styles.actionIconBtn} onClick={handlePrevMonth} title="Previous Month">
                            <ChevronLeft size={16} />
                        </button>
                        <button type="button" className={styles.actionIconBtn} onClick={handleNextMonth} title="Next Month">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <button type="button" className={styles.btnSecondary} onClick={handleToday} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                        Today
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        type="button"
                        className={viewMode === 'month' ? styles.btnPrimary : styles.btnSecondary}
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                        onClick={() => setViewMode('month')}
                    >
                        Month Grid
                    </button>
                    <button
                        type="button"
                        className={viewMode === 'agenda' ? styles.btnPrimary : styles.btnSecondary}
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                        onClick={() => setViewMode('agenda')}
                    >
                        Agenda View ({events.length})
                    </button>
                </div>
            </div>

            {/* Month View Matrix */}
            {viewMode === 'month' ? (
                <div className={styles.tableCard} style={{ padding: '1rem' }}>
                    {/* Days of week header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                            <div key={d} style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', padding: '6px 0' }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Grid cells */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                        {/* Empty offset days */}
                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                style={{
                                    minHeight: '100px',
                                    background: '#fafaf9',
                                    borderRadius: '8px',
                                    border: '1px dashed #e2e8f0',
                                    opacity: 0.5,
                                }}
                            />
                        ))}

                        {/* Days of the month */}
                        {Array.from({ length: totalDays }).map((_, i) => {
                            const dayNum = i + 1;
                            const isToday =
                                new Date().getDate() === dayNum &&
                                new Date().getMonth() === month &&
                                new Date().getFullYear() === year;

                            const dayEvents = eventsByDay[dayNum] || [];

                            return (
                                <div
                                    key={`day-${dayNum}`}
                                    style={{
                                        minHeight: '100px',
                                        background: isToday ? '#eef2ff' : '#ffffff',
                                        border: isToday ? '1px solid #818cf8' : '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span
                                            style={{
                                                fontSize: '0.8rem',
                                                fontWeight: isToday ? 700 : 600,
                                                color: isToday ? '#312e81' : '#334155',
                                            }}
                                        >
                                            {dayNum}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <span
                                                style={{
                                                    fontSize: '0.68rem',
                                                    background: '#c7d2fe',
                                                    color: '#312e81',
                                                    padding: '1px 5px',
                                                    borderRadius: '9999px',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {dayEvents.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Day Events Pills */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                                        {dayEvents.map((ev) => (
                                            <div
                                                key={ev.id}
                                                onClick={() => handleSelectEvent(ev)}
                                                style={{
                                                    background: '#312e81',
                                                    color: '#ffffff',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 600,
                                                    padding: '3px 6px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                }}
                                                title={`${ev.title} (Click to manage schedule)`}
                                            >
                                                {ev.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* Agenda View List */
                <div className={styles.tableCard}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Event Title</th>
                                    <th>Date & Time</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Sync Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                            No active calendar events found.
                                        </td>
                                    </tr>
                                ) : (
                                    events.map((ev) => (
                                        <tr key={ev.id}>
                                            <td style={{ fontWeight: 600, color: '#0f172a' }}>{ev.title}</td>
                                            <td>
                                                <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                                                    {ev.start_time
                                                        ? new Date(ev.start_time).toLocaleString(undefined, {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short',
                                                        })
                                                        : 'Unscheduled'}
                                                </span>
                                            </td>
                                            <td>{ev.location || 'Campus / Online'}</td>
                                            <td>
                                                <span className={`${styles.badge} ${styles.badgeUpcoming}`}>
                                                    {ev.status || 'scheduled'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                                                    ✓ Academic Calendar
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    type="button"
                                                    className={styles.actionIconBtn}
                                                    onClick={() => handleSelectEvent(ev)}
                                                    title="Manage schedule"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {selectedEvent && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Manage Calendar Schedule</h2>
                            <button
                                type="button"
                                className={styles.modalCloseBtn}
                                onClick={() => setSelectedEvent(null)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSchedule}>
                            <div className={styles.modalBody}>
                                <div>
                                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                                        {selectedEvent.title}
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                                        {selectedEvent.location || 'Campus Auditorium'}
                                    </div>
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                                            Start Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className={styles.formInput}
                                            value={rescheduleData.start_time}
                                            onChange={(e) =>
                                                setRescheduleData({ ...rescheduleData, start_time: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>End Time</label>
                                        <input
                                            type="datetime-local"
                                            className={styles.formInput}
                                            value={rescheduleData.end_time}
                                            onChange={(e) =>
                                                setRescheduleData({ ...rescheduleData, end_time: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={rescheduleData.calendar_sync}
                                            onChange={(e) =>
                                                setRescheduleData({ ...rescheduleData, calendar_sync: e.target.checked })
                                            }
                                        />
                                        <span>Show on Public Calendar</span>
                                    </label>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <Link
                                    to={`/admin/pipeline?eventId=${selectedEvent.id}`}
                                    className={styles.btnSecondary}
                                    style={{ marginRight: 'auto' }}
                                >
                                    <Sparkles size={14} /> Full Pipeline Editor
                                </Link>

                                <button
                                    type="button"
                                    className={styles.btnSecondary}
                                    onClick={() => setSelectedEvent(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.btnPrimary}
                                    disabled={updating || !canUpdate('calendar')}
                                >
                                    {updating ? 'Updating...' : 'Save Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
