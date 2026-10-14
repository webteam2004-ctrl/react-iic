import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    CalendarDays,
    Users,
    Award,
    ShieldCheck,
    RefreshCw,
    Sparkles,
    ArrowRight,
    TrendingUp,
    Image,
    Clock,
    MapPin,
    AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import styles from './AdminOverview.module.css';

export default function AdminOverview() {
    const [analytics, setAnalytics] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const loadData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const [analyticsRes, eventsRes] = await Promise.allSettled([
                api.analytics.getDashboard(),
                api.events.getAll(),
            ]);

            if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.success) {
                setAnalytics(analyticsRes.value.analytics);
            } else if (analyticsRes.status === 'rejected') {
                throw new Error(analyticsRes.reason?.message || 'Failed to fetch analytics');
            }

            if (eventsRes.status === 'fulfilled' && eventsRes.value?.success) {
                const allEvts = eventsRes.value.events || [];
                // Filter upcoming or ongoing
                const upcoming = allEvts
                    .filter((e) => e.status === 'upcoming' || e.status === 'ongoing')
                    .slice(0, 5);
                setUpcomingEvents(upcoming);
            }
        } catch (err) {
            console.error('[AdminOverview] Error loading overview data:', err);
            setError(err.message || 'Unable to load real-time analytics from backend');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Derived calculations from real backend data
    const eventStats = analytics?.events || { total: 0, upcoming: 0, completed: 0, synced_to_calendar: 0 };
    const ideaStats = analytics?.idea_hub || { total_submissions: 0, pending: 0, under_review: 0, fully_reviewed: 0 };
    const participantStats = analytics?.participants || { total_registered: 0, by_branch: {} };
    const systemStats = analytics?.system || { active_admins: 0, total_admins: 0, total_gallery_media: 0 };

    // Calculate branch distribution
    const branchEntries = Object.entries(participantStats.by_branch || {});
    const maxBranchCount = Math.max(...branchEntries.map(([, count]) => count), 1);
    const totalBranchRegistrations = branchEntries.reduce((sum, [, count]) => sum + count, 0);

    // Review status percentages
    const totalSubmissions = ideaStats.total_submissions || 0;
    const pendingPct = totalSubmissions > 0 ? (ideaStats.pending / totalSubmissions) * 100 : 0;
    const underReviewPct = totalSubmissions > 0 ? (ideaStats.under_review / totalSubmissions) * 100 : 0;
    const reviewedPct = totalSubmissions > 0 ? (ideaStats.fully_reviewed / totalSubmissions) * 100 : 0;

    return (
        <div className={styles.overviewContainer}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerText}>
                    <h1>Institutional Overview</h1>
                    <p>
                        Real-time management console for IIC events, student innovations, registrations, and council operations.
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.refreshBtn}
                        onClick={() => loadData(true)}
                        disabled={loading || refreshing}
                    >
                        <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
                    </button>

                    <Link to="/admin/pipeline" className={styles.actionBtn}>
                        <Sparkles size={16} />
                        <span>Publish Pipeline</span>
                    </Link>
                </div>
            </div>

            {/* Error state if any */}
            {error && (
                <div className={styles.errorBanner}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                    <button type="button" onClick={() => loadData(true)} className={styles.refreshBtn}>
                        Retry Connection
                    </button>
                </div>
            )}

            {/* Metric KPI Cards */}
            <div className={styles.metricsGrid}>
                {loading ? (
                    <>
                        <div className={`${styles.skeleton} ${styles.skeletonMetric}`} />
                        <div className={`${styles.skeleton} ${styles.skeletonMetric}`} />
                        <div className={`${styles.skeleton} ${styles.skeletonMetric}`} />
                        <div className={`${styles.skeleton} ${styles.skeletonMetric}`} />
                    </>
                ) : (
                    <>
                        {/* Total Events */}
                        <div className={styles.metricCard}>
                            <div className={styles.metricTop}>
                                <span className={styles.metricLabel}>Total Events</span>
                                <div className={`${styles.metricIcon} ${styles.metricIconIndigo}`}>
                                    <CalendarDays size={20} />
                                </div>
                            </div>
                            <div className={styles.metricValue}>{eventStats.total}</div>
                            <div className={styles.metricSubtext}>
                                <span className={styles.metricHighlight}>{eventStats.upcoming} upcoming</span>
                                <span>• {eventStats.synced_to_calendar} calendar synced</span>
                            </div>
                        </div>

                        {/* Registrations */}
                        <div className={styles.metricCard}>
                            <div className={styles.metricTop}>
                                <span className={styles.metricLabel}>Participants</span>
                                <div className={`${styles.metricIcon} ${styles.metricIconEmerald}`}>
                                    <Users size={20} />
                                </div>
                            </div>
                            <div className={styles.metricValue}>{participantStats.total_registered}</div>
                            <div className={styles.metricSubtext}>
                                <span className={styles.metricHighlight}>
                                    {branchEntries.length} branches represented
                                </span>
                            </div>
                        </div>

                        {/* SIH Idea Reviews */}
                        <div className={styles.metricCard}>
                            <div className={styles.metricTop}>
                                <span className={styles.metricLabel}>SIH Idea Reviews</span>
                                <div className={`${styles.metricIcon} ${styles.metricIconAmber}`}>
                                    <Award size={20} />
                                </div>
                            </div>
                            <div className={styles.metricValue}>{ideaStats.total_submissions}</div>
                            <div className={styles.metricSubtext}>
                                <span style={{ color: '#d97706', fontWeight: 600 }}>{ideaStats.pending} pending</span>
                                <span>• {ideaStats.fully_reviewed} reviewed</span>
                            </div>
                        </div>

                        {/* Active Administrators */}
                        <div className={styles.metricCard}>
                            <div className={styles.metricTop}>
                                <span className={styles.metricLabel}>Active Council Admins</span>
                                <div className={`${styles.metricIcon} ${styles.metricIconRose}`}>
                                    <ShieldCheck size={20} />
                                </div>
                            </div>
                            <div className={styles.metricValue}>{systemStats.active_admins}</div>
                            <div className={styles.metricSubtext}>
                                <span>{systemStats.total_gallery_media} media items in gallery</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Two Column Visualizations */}
            <div className={styles.chartsSection}>
                {/* Branch Distribution */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <div>
                            <h2 className={styles.cardTitle}>
                                <TrendingUp size={18} color="#4f46e5" />
                                Registrations by Academic Branch
                            </h2>
                            <span className={styles.cardSubtitle}>
                                Live participant enrollment across engineering streams ({totalBranchRegistrations} total)
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                            <div className={styles.skeleton} style={{ height: '24px' }} />
                            <div className={styles.skeleton} style={{ height: '24px' }} />
                            <div className={styles.skeleton} style={{ height: '24px' }} />
                        </div>
                    ) : branchEntries.length === 0 ? (
                        <div className={styles.emptyState}>No registration branch data recorded yet</div>
                    ) : (
                        <div className={styles.branchList}>
                            {branchEntries.map(([branch, count]) => {
                                const pct = Math.round((count / maxBranchCount) * 100);
                                const sharePct = totalBranchRegistrations > 0
                                    ? Math.round((count / totalBranchRegistrations) * 100)
                                    : 0;

                                return (
                                    <div key={branch} className={styles.branchItem}>
                                        <div className={styles.branchMeta}>
                                            <span className={styles.branchName}>{branch}</span>
                                            <span className={styles.branchCount}>
                                                {count} <span style={{ color: '#64748b', fontWeight: 400 }}>({sharePct}%)</span>
                                            </span>
                                        </div>
                                        <div className={styles.barTrack}>
                                            <div className={styles.barFill} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Idea Hub Review Breakdown */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <div>
                            <h2 className={styles.cardTitle}>
                                <Award size={18} color="#d97706" />
                                SIH Review Status
                            </h2>
                            <span className={styles.cardSubtitle}>Evaluation breakdown across submissions</span>
                        </div>
                    </div>

                    <div className={styles.statusRingContainer}>
                        {/* Multi-segment Progress Bar */}
                        <div className={styles.statusSegments}>
                            <div
                                className={styles.segmentPending}
                                style={{ width: `${pendingPct}%` }}
                                title={`Pending: ${ideaStats.pending}`}
                            />
                            <div
                                className={styles.segmentUnderReview}
                                style={{ width: `${underReviewPct}%` }}
                                title={`Under Review: ${ideaStats.under_review}`}
                            />
                            <div
                                className={styles.segmentReviewed}
                                style={{ width: `${reviewedPct}%` }}
                                title={`Fully Reviewed: ${ideaStats.fully_reviewed}`}
                            />
                        </div>

                        {/* Legend Details */}
                        <div className={styles.statusLegend}>
                            <div className={styles.legendItem}>
                                <div className={styles.legendLabel}>
                                    <span className={styles.legendDot} style={{ background: '#f59e0b' }} />
                                    <span>Pending Evaluation</span>
                                </div>
                                <span className={styles.legendValue}>{ideaStats.pending}</span>
                            </div>

                            <div className={styles.legendItem}>
                                <div className={styles.legendLabel}>
                                    <span className={styles.legendDot} style={{ background: '#3b82f6' }} />
                                    <span>Under Review</span>
                                </div>
                                <span className={styles.legendValue}>{ideaStats.under_review}</span>
                            </div>

                            <div className={styles.legendItem}>
                                <div className={styles.legendLabel}>
                                    <span className={styles.legendDot} style={{ background: '#10b981' }} />
                                    <span>Fully Reviewed</span>
                                </div>
                                <span className={styles.legendValue}>{ideaStats.fully_reviewed}</span>
                            </div>

                            <div
                                style={{
                                    borderTop: '1px solid #f1f5f9',
                                    paddingTop: '0.65rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.82rem',
                                }}
                            >
                                <span style={{ color: '#64748b', fontWeight: 600 }}>Total Submissions</span>
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>{ideaStats.total_submissions}</span>
                            </div>
                        </div>

                        <Link
                            to="/admin/ideahub"
                            style={{
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#312e81',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                alignSelf: 'flex-start',
                            }}
                        >
                            Open Idea Hub Reviews <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Upcoming Events & Quick Actions */}
            <div className={styles.bottomGrid}>
                {/* Upcoming Events */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <div>
                            <h2 className={styles.cardTitle}>Upcoming & Active Events</h2>
                            <span className={styles.cardSubtitle}>Directly derived from the institutional calendar</span>
                        </div>
                        <Link
                            to="/admin/events"
                            style={{ fontSize: '0.82rem', fontWeight: 600, color: '#312e81', textDecoration: 'none' }}
                        >
                            View All ↗
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div className={styles.skeleton} style={{ height: '48px' }} />
                            <div className={styles.skeleton} style={{ height: '48px' }} />
                        </div>
                    ) : upcomingEvents.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No upcoming events scheduled at this time.</p>
                            <Link to="/admin/pipeline" className={styles.actionBtn} style={{ marginTop: '0.5rem' }}>
                                <Sparkles size={14} /> Publish First Event
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.eventsList}>
                            {upcomingEvents.map((evt) => {
                                const dateStr = evt.start_time
                                    ? new Date(evt.start_time).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })
                                    : 'Date TBA';

                                return (
                                    <div key={evt.id} className={styles.eventRow}>
                                        <div className={styles.eventInfo}>
                                            <span className={styles.eventTitle}>{evt.title}</span>
                                            <div className={styles.eventMeta}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={13} /> {dateStr}
                                                </span>
                                                {evt.location && (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <MapPin size={13} /> {evt.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className={`${styles.eventStatusBadge} ${evt.status === 'upcoming'
                                                ? styles.badgeUpcoming
                                                : evt.status === 'ongoing'
                                                    ? styles.badgeOngoing
                                                    : styles.badgeCompleted
                                                }`}
                                        >
                                            {evt.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Management Shortcuts */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <div>
                            <h2 className={styles.cardTitle}>Quick Operations</h2>
                            <span className={styles.cardSubtitle}>Fast administrative workflows</span>
                        </div>
                    </div>

                    <div className={styles.quickActionsList}>
                        <Link to="/admin/pipeline" className={styles.quickActionItem}>
                            <div className={styles.quickActionIcon}>
                                <Sparkles size={17} />
                            </div>
                            <div>
                                <div>Publish to Pipeline</div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 400 }}>
                                    Sync event, calendar & gallery media
                                </div>
                            </div>
                        </Link>

                        <Link to="/admin/ideahub" className={styles.quickActionItem}>
                            <div className={styles.quickActionIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
                                <Award size={17} />
                            </div>
                            <div>
                                <div>Review SIH Ideas</div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 400 }}>
                                    Evaluate submissions & approvals
                                </div>
                            </div>
                        </Link>

                        <Link to="/admin/gallery" className={styles.quickActionItem}>
                            <div className={styles.quickActionIcon} style={{ background: '#ecfeff', color: '#0891b2' }}>
                                <Image size={17} />
                            </div>
                            <div>
                                <div>Manage Gallery Media</div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 400 }}>
                                    Upload photos & associate events
                                </div>
                            </div>
                        </Link>

                        <Link to="/admin/teams" className={styles.quickActionItem}>
                            <div className={styles.quickActionIcon} style={{ background: '#fdf2f8', color: '#db2777' }}>
                                <Users size={17} />
                            </div>
                            <div>
                                <div>Council Directory</div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 400 }}>
                                    Update student and faculty leaders
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
