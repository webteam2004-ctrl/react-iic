import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Users,
    Award,
    Calendar,
    Layers,
    RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import styles from './AdminOverview.module.css';

export default function AdminAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [branchFilter, setBranchFilter] = useState('');

    const fetchAnalytics = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await api.analytics.getDashboard();
            if (res && res.success) {
                setData(res.analytics);
            }
        } catch (err) {
            console.error('[AdminAnalytics] Fetch failed:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const branchData = Object.entries(data?.participants?.by_branch || {});
    const filteredBranches = branchData.filter(([branch]) =>
        branch.toLowerCase().includes(branchFilter.toLowerCase())
    );
    const totalRegistrations = branchData.reduce((sum, [, count]) => sum + count, 0);

    return (
        <div className={styles.overviewContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.headerText}>
                    <h1>Analytics & Operational Intelligence</h1>
                    <p>Institutional metrics and participation breakdown across academic branches</p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.refreshBtn}
                        onClick={() => fetchAnalytics(true)}
                        disabled={loading || refreshing}
                    >
                        <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                    </button>
                </div>
            </div>

            {/* Primary KPI Row */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricTop}>
                        <span className={styles.metricLabel}>Total Registrations</span>
                        <div className={`${styles.metricIcon} ${styles.metricIconEmerald}`}>
                            <Users size={20} />
                        </div>
                    </div>
                    <div className={styles.metricValue}>{data?.participants?.total_registered || 0}</div>
                    <div className={styles.metricSubtext}>Across all recorded institutional events</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricTop}>
                        <span className={styles.metricLabel}>Total Events</span>
                        <div className={`${styles.metricIcon} ${styles.metricIconIndigo}`}>
                            <Calendar size={20} />
                        </div>
                    </div>
                    <div className={styles.metricValue}>{data?.events?.total || 0}</div>
                    <div className={styles.metricSubtext}>
                        {data?.events?.synced_to_calendar || 0} active on college calendar
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricTop}>
                        <span className={styles.metricLabel}>Idea Submissions</span>
                        <div className={`${styles.metricIcon} ${styles.metricIconAmber}`}>
                            <Award size={20} />
                        </div>
                    </div>
                    <div className={styles.metricValue}>{data?.idea_hub?.total_submissions || 0}</div>
                    <div className={styles.metricSubtext}>
                        {data?.idea_hub?.fully_reviewed || 0} evaluated by review panel
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricTop}>
                        <span className={styles.metricLabel}>Gallery Assets</span>
                        <div className={`${styles.metricIcon} ${styles.metricIconCyan}`}>
                            <Layers size={20} />
                        </div>
                    </div>
                    <div className={styles.metricValue}>{data?.system?.total_gallery_media || 0}</div>
                    <div className={styles.metricSubtext}>Media items linked to college events</div>
                </div>
            </div>

            {/* Comprehensive Branch Data Table */}
            <div className={styles.dashboardCard}>
                <div className={styles.cardHeader} style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h2 className={styles.cardTitle}>
                            <BarChart3 size={18} color="#4f46e5" />
                            Branch Enrollment Breakdown
                        </h2>
                        <span className={styles.cardSubtitle}>
                            Detailed distribution of participants per engineering branch
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Search branch..."
                            value={branchFilter}
                            onChange={(e) => setBranchFilter(e.target.value)}
                            style={{
                                padding: '0.45rem 0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.84rem',
                                outline: 'none',
                            }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        Loading branch data...
                    </div>
                ) : filteredBranches.length === 0 ? (
                    <div className={styles.emptyState}>No branches match the search criteria</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', color: '#64748b' }}>
                                    <th style={{ padding: '0.75rem 1rem' }}>Academic Branch</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Registered Students</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Share of Total</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Distribution Bar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBranches.map(([branch, count]) => {
                                    const pct = totalRegistrations > 0
                                        ? Math.round((count / totalRegistrations) * 100)
                                        : 0;
                                    return (
                                        <tr
                                            key={branch}
                                            style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                                        >
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                                                {branch}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                                                {count}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                                                {pct}%
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', minWidth: '160px' }}>
                                                <div className={styles.barTrack}>
                                                    <div className={styles.barFill} style={{ width: `${pct}%` }} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
