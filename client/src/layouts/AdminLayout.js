import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    CalendarDays,
    Image,
    FolderGit2,
    Users,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    LogOut,
    Bell,
    Sparkles,
    ExternalLink,
    ChevronDown,
    Layers,
    Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
    const { user, logout, isSuperAdmin, canRead } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileOpen(false);
        setProfileDropdownOpen(false);
        setNotificationsOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/admin-portal-login');
    };

    // Determine current breadcrumb label
    const getBreadcrumbTitle = () => {
        const path = location.pathname;
        if (path === '/admin') return 'Events Management';
        if (path.startsWith('/admin/events')) return 'Events Management';
        if (path.startsWith('/admin/pipeline')) return 'Publishing Pipeline';
        if (path.startsWith('/admin/calendar')) return 'Calendar Management';
        if (path.startsWith('/admin/gallery')) return 'Gallery Management';
        if (path.startsWith('/admin/ideahub')) return 'Idea Hub / SIH Reviews';
        if (path.startsWith('/admin/teams')) return 'Team Management';
        if (path.startsWith('/admin/users')) return 'Super Admin User Management';
        return 'Dashboard';
    };

    // Nav link items with RBAC visibility checks
    const navSections = [
        {
            title: 'Content Pipeline',
            items: [
                {
                    to: '/admin/events',
                    label: 'Events',
                    icon: Layers,
                    visible: isSuperAdmin() || canRead('events'),
                },
                {
                    to: '/admin/pipeline',
                    label: 'Unified Pipeline',
                    icon: Sparkles,
                    visible: isSuperAdmin() || canRead('events'),
                    badge: 'SSOT',
                },
                {
                    to: '/admin/calendar',
                    label: 'Calendar',
                    icon: CalendarDays,
                    visible: isSuperAdmin() || canRead('calendar'),
                },
                {
                    to: '/admin/gallery',
                    label: 'Gallery',
                    icon: Image,
                    visible: isSuperAdmin() || canRead('gallery'),
                },
            ],
        },
        {
            title: 'Innovation & Review',
            items: [
                {
                    to: '/admin/ideahub',
                    label: 'Idea Hub / SIH',
                    icon: Award,
                    visible: isSuperAdmin() || canRead('idea_hub'),
                },
                {
                    to: '/admin-challenges',
                    label: 'SIH Review Portal',
                    icon: FolderGit2,
                    visible: true,
                },
            ],
        },
        {
            title: 'Administration',
            items: [
                {
                    to: '/admin/teams',
                    label: 'Council Teams',
                    icon: Users,
                    visible: isSuperAdmin() || canRead('teams') || canRead('team'),
                },
                {
                    to: '/admin/users',
                    label: 'User Management',
                    icon: UserCheck,
                    visible: isSuperAdmin(),
                    badge: 'Super Admin',
                },
            ],
        },
    ];

    const roleClass = user?.role === 'super_admin'
        ? styles.roleSuperAdmin
        : user?.role === 'analyst'
            ? styles.roleAnalyst
            : '';

    return (
        <div className={styles.adminWrapper}>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className={styles.backdrop}
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ================= SIDEBAR ================= */}
            <aside
                className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${mobileOpen ? styles.sidebarOpen : ''
                    }`}
            >
                {/* Brand */}
                <div className={styles.sidebarBrand}>
                    <Link to="/admin" className={styles.brandLink}>
                        <div className={styles.brandLogo}>IIC</div>
                        {!collapsed && (
                            <div className={styles.brandMeta}>
                                <span className={styles.brandTitle}>IIC VVIT</span>
                                <span className={styles.brandSubtitle}>Admin Console</span>
                            </div>
                        )}
                    </Link>
                    <button
                        type="button"
                        className={styles.collapseBtn}
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-label="Toggle sidebar collapse"
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation list */}
                <nav className={styles.sidebarNav}>
                    {navSections.map((sec) => {
                        const visibleItems = sec.items.filter((item) => item.visible);
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={sec.title} className={styles.navSection}>
                                {!collapsed && (
                                    <div className={styles.navSectionTitle}>{sec.title}</div>
                                )}
                                {visibleItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            end={item.end}
                                            className={({ isActive }) =>
                                                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                                            }
                                            title={collapsed ? item.label : undefined}
                                        >
                                            <Icon size={19} className={styles.navIcon} />
                                            {!collapsed && <span>{item.label}</span>}
                                            {!collapsed && item.badge && (
                                                <span
                                                    className={`${styles.navBadge} ${location.pathname === item.to ? styles.navBadgeActive : ''
                                                        }`}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* Quick link to public website */}
                    <div className={styles.navSection}>
                        <Link
                            to="/"
                            className={styles.navItem}
                            title={collapsed ? 'View Public Website' : undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink size={18} className={styles.navIcon} />
                            {!collapsed && <span>Public Website ↗</span>}
                        </Link>
                    </div>
                </nav>

                {/* Sidebar Footer: Profile */}
                <div className={styles.sidebarFooter}>
                    <div className={styles.userCard}>
                        <div className={styles.userAvatar}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        {!collapsed && (
                            <div className={styles.userInfo}>
                                <div className={styles.userName}>{user?.name || 'Administrator'}</div>
                                <span className={`${styles.userRoleBadge} ${roleClass}`}>
                                    {user?.role ? user.role.replace('_', ' ') : 'Admin'}
                                </span>
                            </div>
                        )}
                        <button
                            type="button"
                            className={styles.logoutBtn}
                            onClick={handleLogout}
                            title="Sign Out"
                            aria-label="Sign Out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ================= MAIN LAYOUT ================= */}
            <div className={`${styles.mainLayout} ${collapsed ? styles.mainLayoutCollapsed : ''}`}>
                {/* Top Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button
                            type="button"
                            className={styles.mobileMenuBtn}
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle mobile menu"
                        >
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>

                        {/* Breadcrumb */}
                        <div className={styles.breadcrumbs}>
                            <Link to="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>
                                Admin
                            </Link>
                            <span className={styles.breadcrumbSeparator}>/</span>
                            <span className={styles.breadcrumbCurrent}>{getBreadcrumbTitle()}</span>
                        </div>
                    </div>

                    <div className={styles.headerRight}>
                        {/* System Status Indicator */}
                        <div className={styles.statusIndicator}>
                            <span className={styles.pulseDot} />
                            <span>Live System</span>
                        </div>

                        {/* Quick Publish Pipeline Action */}
                        <Link to="/admin/pipeline" className={styles.quickPublishBtn}>
                            <Sparkles size={15} />
                            <span>Publish Event</span>
                        </Link>

                        {/* Notifications Toggle */}
                        <div style={{ position: 'relative' }}>
                            <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                title="System Notifications"
                                aria-label="System Notifications"
                            >
                                <Bell size={18} />
                                <span className={styles.notificationBadge} />
                            </button>

                            {notificationsOpen && (
                                <div className={styles.dropdownMenu}>
                                    <div className={styles.dropdownHeader}>
                                        <div className={styles.dropdownName}>System Activity</div>
                                        <div className={styles.dropdownEmail}>Synchronized across all modules</div>
                                    </div>
                                    <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                                        <p style={{ margin: '0 0 0.5rem 0' }}>✓ Single Source of Truth active</p>
                                        <p style={{ margin: 0 }}>✓ Supabase PostgreSQL connected</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                type="button"
                                className={styles.profileTrigger}
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                aria-label="User profile options"
                            >
                                <div className={styles.userAvatar} style={{ width: 32, height: 32 }}>
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <ChevronDown size={14} color="#64748b" />
                            </button>

                            {profileDropdownOpen && (
                                <div className={styles.dropdownMenu}>
                                    <div className={styles.dropdownHeader}>
                                        <div className={styles.dropdownName}>{user?.name || 'Administrator'}</div>
                                        <div className={styles.dropdownEmail}>{user?.email}</div>
                                        <span className={`${styles.userRoleBadge} ${roleClass}`} style={{ marginTop: '4px' }}>
                                            {user?.role ? user.role.replace('_', ' ') : 'Admin'}
                                        </span>
                                    </div>

                                    {isSuperAdmin() && (
                                        <Link to="/admin/users" className={styles.dropdownItem}>
                                            <UserCheck size={15} />
                                            <span>Admin Users</span>
                                        </Link>
                                    )}

                                    <Link to="/admin-challenges" className={styles.dropdownItem}>
                                        <FolderGit2 size={15} />
                                        <span>SIH Review Portal</span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
                                    >
                                        <LogOut size={15} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <main className={styles.pageContent}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
