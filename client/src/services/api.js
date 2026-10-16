/**
 * Centralized API service for IIC Admin Dashboard and client integrations.
 * Automatically attaches Authorization headers and provides structured error handling.
 */

const getApiBaseUrl = () => {
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL.replace(/\/+$/, '');
    }
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:5000/api';
    }
    return 'https://react-iic.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
export const resolveMediaUrl = (value) => {
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    return `${API_ORIGIN}${value.startsWith('/') ? value : `/${value}`}`;
};

/**
 * Universal request wrapper
 */
async function request(endpoint, options = {}) {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

    const defaultHeaders = {};
    if (!(options.body instanceof FormData)) defaultHeaders['Content-Type'] = 'application/json';

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
        const response = await fetch(url, config);

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { message: text };
        }

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin-portal-login')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('isAdmin');
                    localStorage.removeItem('adminUser');
                    window.dispatchEvent(new CustomEvent('auth:expired', { detail: data.message || 'Session expired' }));
                }
            }

            const error = new Error(data.message || `Request failed with status ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (error) {
        console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error.message);
        throw error;
    }
}

export const api = {
    // Authentication
    auth: {
        login: (email, password) =>
            request('/admin/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }),
        getMe: () => request('/admin/me'),
    },

    // Analytics
    analytics: {
        getDashboard: () => request('/admin/analytics'),
    },

    // Events Management
    events: {
        getAll: (params = {}) => {
            const query = new URLSearchParams();
            if (params.status) query.append('status', params.status);
            if (params.calendar_only) query.append('calendar_only', params.calendar_only);
            const qs = query.toString() ? `?${query.toString()}` : '';
            return request(`/events${qs}`);
        },
        getById: (id) => request(`/events/${id}`),
        create: (eventData) =>
            request('/events', {
                method: 'POST',
                body: JSON.stringify(eventData),
            }),
        update: (id, eventData) =>
            request(`/events/${id}`, {
                method: 'PUT',
                body: JSON.stringify(eventData),
            }),
        delete: (id, softDelete = false) => {
            const qs = softDelete ? '?soft_delete=true' : '';
            return request(`/events/${id}${qs}`, {
                method: 'DELETE',
            });
        },
    },

    // Calendar Management
    calendar: {
        getSchedule: (params = {}) => {
            const query = new URLSearchParams();
            if (params.start_date) query.append('start_date', params.start_date);
            if (params.end_date) query.append('end_date', params.end_date);
            const qs = query.toString() ? `?${query.toString()}` : '';
            return request(`/calendar${qs}`);
        },
        updateSchedule: (id, data) =>
            request(`/calendar/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
    },

    // Gallery Management
    gallery: {
        getAll: (params = {}) => {
            const query = new URLSearchParams();
            if (params.event_id) query.append('event_id', params.event_id);
            const qs = query.toString() ? `?${query.toString()}` : '';
            return request(`/gallery${qs}`);
        },
        create: (data) =>
            request('/gallery', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        upload: (files, eventId = null) => {
            const body = new FormData();
            files.forEach(({ file, caption }) => body.append('images', file));
            body.append('captions', JSON.stringify(files.map(({ caption }) => caption || '')));
            if (eventId) body.append('event_id', String(eventId));
            return request('/gallery/upload', {
                method: 'POST',
                body,
                headers: {},
            });
        },
        update: (id, data) =>
            request(`/gallery/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        delete: (id) =>
            request(`/gallery/${id}`, {
                method: 'DELETE',
            }),
    },

    contact: {
        create: (data) =>
            request('/contact', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        list: (params = {}) => {
            const query = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') query.append(key, value);
            });
            const qs = query.toString() ? `?${query.toString()}` : '';
            return request(`/admin/contact-messages${qs}`);
        },
        getById: (id) => request(`/admin/contact-messages/${id}`),
        update: (id, data) =>
            request(`/admin/contact-messages/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),
        delete: (id) =>
            request(`/admin/contact-messages/${id}`, { method: 'DELETE' }),
    },

    // Unified Shared Pipeline
    pipeline: {
        publish: (pipelineData, files = []) => {
            if (files.length > 0) {
                const body = new FormData();
                Object.entries(pipelineData).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) body.append(key, String(value));
                });
                files.forEach(({ file }) => body.append('images', file));
                body.append('captions', JSON.stringify(files.map(({ caption }) => caption || '')));
                return request('/pipeline/publish', { method: 'POST', body });
            }
            return request('/pipeline/publish', {
                method: 'POST',
                body: JSON.stringify(pipelineData),
            });
        },
    },

    // Idea Hub & SIH Challenges
    challenges: {
        getAll: () => request('/challenges'),
        updateWebReview: (id, status) =>
            request(`/challenges/${id}/web-review`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
            }),
        updateFacultyReview: (id, status) =>
            request(`/challenges/${id}/faculty-review`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
            }),
    },

    // Team Management
    team: {
        getAll: (params = {}) => {
            const query = new URLSearchParams();
            if (params.teams_version) query.append('teams_version', params.teams_version);
            const qs = query.toString() ? `?${query.toString()}` : '';
            return request(`/team${qs}`);
        },
        getById: (id) => request(`/team/${id}`),
        create: (data, file) => {
            if (!file) return request('/team', { method: 'POST', body: JSON.stringify(data) });
            const body = new FormData();
            Object.entries(data).forEach(([key, value]) => body.append(key, value ?? ''));
            body.append('image', file);
            return request('/team', { method: 'POST', body });
        },
        update: (id, data, file) => {
            if (!file) return request(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) });
            const body = new FormData();
            Object.entries(data).forEach(([key, value]) => body.append(key, value ?? ''));
            body.append('image', file);
            return request(`/team/${id}`, { method: 'PUT', body });
        },
        delete: (id) =>
            request(`/team/${id}`, {
                method: 'DELETE',
            }),
    },

    // Homepage content management
    homepage: {
        getPublic: () => request('/homepage'),
        getAdmin: () => request('/homepage/admin'),
        updateHero: (file) => {
            const body = new FormData();
            body.append('image', file);
            return request('/homepage/admin/hero', { method: 'PUT', body });
        },
        updateTeamBanner: (file) => {
            const body = new FormData();
            body.append('image', file);
            return request('/homepage/admin/team-banner', { method: 'PUT', body });
        },
        createStory: (data, file) => {
            const body = new FormData();
            Object.entries(data).forEach(([key, value]) => body.append(key, value ?? ''));
            if (file) body.append('image', file);
            return request('/homepage/admin/stories', { method: 'POST', body });
        },
        updateStory: (id, data, file) => {
            const body = new FormData();
            Object.entries(data).forEach(([key, value]) => body.append(key, value ?? ''));
            if (file) body.append('image', file);
            return request(`/homepage/admin/stories/${id}`, { method: 'PUT', body });
        },
        deleteStory: (id) =>
            request(`/homepage/admin/stories/${id}`, { method: 'DELETE' }),
        reorderStories: (order) =>
            request('/homepage/admin/stories/order', {
                method: 'PUT',
                body: JSON.stringify({ order }),
            }),
    },

    // Super Admin User Management
    adminUsers: {
        getAll: () => request('/admin/users'),
        create: (userData) =>
            request('/admin/users', {
                method: 'POST',
                body: JSON.stringify(userData),
            }),
        update: (id, data) => {
            if (Object.keys(data).length === 1 && typeof data.is_active === 'boolean') {
                return request(`/admin/users/${id}/status`, {
                    method: 'PUT',
                    body: JSON.stringify({ is_active: data.is_active }),
                });
            }
            return request(`/admin/users/${id}/permissions`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        },
        updatePermissions: (id, data) =>
            request(`/admin/users/${id}/permissions`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        updateStatus: (id, isActive) =>
            request(`/admin/users/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ is_active: isActive }),
            }),
        delete: (id) =>
            request(`/admin/users/${id}`, {
                method: 'DELETE',
            }),
    },
};

// Aliases for route consistency
api.teams = api.team;

export default api;
