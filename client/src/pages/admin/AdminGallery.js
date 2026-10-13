import React, { useState, useEffect, useCallback } from 'react';
import {
    Image as ImageIcon,
    Plus,
    Search,
    Trash2,
    Edit2,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    X,
    Eye,
    Layers
} from 'lucide-react';
import { api, resolveMediaUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MultiImageUploader from '../../components/admin/MultiImageUploader';
import styles from './AdminCommon.module.css';

export default function AdminGallery() {
    const { canCreate, canUpdate, canDelete } = useAuth();
    const [items, setItems] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploadFiles, setUploadFiles] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        image_url: '',
        caption: '',
        event_id: '',
    });

    const loadGalleryAndEvents = useCallback(async () => {
        setLoading(true);
        try {
            const [galleryRes, eventsRes] = await Promise.allSettled([
                api.gallery.getAll(),
                api.events.getAll(),
            ]);

            if (galleryRes.status === 'fulfilled' && galleryRes.value?.success) {
                setItems(galleryRes.value.gallery || []);
            }
            if (eventsRes.status === 'fulfilled' && eventsRes.value?.success) {
                setEvents(eventsRes.value.events || []);
            }
        } catch (err) {
            console.error('[AdminGallery] Load error:', err);
            showToast(err.message || 'Error loading gallery assets', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadGalleryAndEvents();
    }, [loadGalleryAndEvents]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleOpenCreate = () => {
        setEditingItem(null);
        setFormData({
            image_url: '',
            caption: '',
            event_id: '',
        });
        setUploadFiles([]);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setFormData({
            image_url: item.image_url || '',
            caption: item.caption || '',
            event_id: item.event_id || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingItem && uploadFiles.length === 0 && !formData.image_url.trim()) {
            showToast('Select at least one image', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                image_url: formData.image_url.trim(),
                caption: formData.caption?.trim() || 'IIC Event Highlight',
                event_id: formData.event_id ? parseInt(formData.event_id, 10) : null,
            };

            if (editingItem) {
                await api.gallery.update(editingItem.id, payload);
                showToast('Gallery image updated successfully');
            } else {
                await api.gallery.upload(uploadFiles, payload.event_id);
                showToast(`${uploadFiles.length} image${uploadFiles.length === 1 ? '' : 's'} added to gallery`);
            }
            setUploadFiles([]);
            setIsModalOpen(false);
            loadGalleryAndEvents();
        } catch (err) {
            showToast(err.message || 'Failed to save gallery item', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePermanent = async () => {
        if (!deleteConfirmItem) return;
        try {
            await api.gallery.delete(deleteConfirmItem.id);
            showToast('Image removed from gallery showcase');
            setDeleteConfirmItem(null);
            loadGalleryAndEvents();
        } catch (err) {
            showToast(err.message || 'Failed to remove image', 'error');
        }
    };

    // Build event ID lookup map
    const eventLookup = {};
    events.forEach((ev) => {
        eventLookup[ev.id] = ev.title;
    });

    const filteredItems = items.filter((item) =>
        (item.caption || '').toLowerCase().includes(search.toLowerCase()) ||
        (eventLookup[item.event_id] || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.headerTitle}>Gallery & Media Assets</h1>
                    <p className={styles.headerSubtitle}>
                        Manage visual documentation, event highlight reels, and council photo archives.
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={loadGalleryAndEvents}
                        disabled={loading}
                    >
                        <RefreshCw size={15} />
                        <span>Refresh</span>
                    </button>
                    {canCreate('gallery') && (
                        <button type="button" className={styles.btnPrimary} onClick={handleOpenCreate}>
                            <Plus size={16} />
                            <span>Add Media</span>
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

            {/* Filter Bar */}
            <div className={styles.filterBar}>
                <div className={styles.searchGroup}>
                    <Search size={16} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by caption, associated event..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                    Showing <strong>{filteredItems.length}</strong> of {items.length} media assets
                </div>
            </div>

            {/* Responsive Media Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Loading gallery assets...
                </div>
            ) : filteredItems.length === 0 ? (
                <div className={styles.tableCard} style={{ padding: '3.5rem', textAlign: 'center' }}>
                    <ImageIcon size={44} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>
                        No gallery images found
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.86rem', marginTop: '0.4rem' }}>
                        Add showcase photos or use the Unified Publishing Pipeline to link images to events.
                    </p>
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.25rem',
                    }}
                >
                    {filteredItems.map((item) => {
                        const eventTitle = item.event_id ? eventLookup[item.event_id] : null;

                        return (
                            <div
                                key={item.id}
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.15s ease',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                }}
                            >
                                {/* Image Frame */}
                                <div
                                    style={{
                                        position: 'relative',
                                        height: '190px',
                                        background: '#f1f5f9',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <img
                                        src={resolveMediaUrl(item.public_url || item.image_url)}
                                        alt={item.caption || 'Gallery photo'}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block',
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.style.visibility = 'hidden';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPreviewImage(item)}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'rgba(15, 23, 42, 0.75)',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            width: '30px',
                                            height: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                        }}
                                        title="View Full Resolution"
                                    >
                                        <Eye size={15} />
                                    </button>
                                </div>

                                {/* Card Content */}
                                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div
                                        style={{
                                            fontSize: '0.88rem',
                                            fontWeight: 600,
                                            color: '#0f172a',
                                            marginBottom: '0.4rem',
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {item.caption || 'Untitled Media'}
                                    </div>

                                    {eventTitle && (
                                        <div
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '0.74rem',
                                                color: '#4338ca',
                                                background: '#eef2ff',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                width: 'fit-content',
                                                marginBottom: '0.75rem',
                                                fontWeight: 600,
                                            }}
                                        >
                                            <Layers size={12} />
                                            <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {eventTitle}
                                            </span>
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            marginTop: 'auto',
                                            paddingTop: '0.75rem',
                                            borderTop: '1px solid #f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                            {item.created_at
                                                ? new Date(item.created_at).toLocaleDateString()
                                                : 'Archived asset'}
                                        </span>

                                        <div className={styles.actionBtnGroup}>
                                            {canUpdate('gallery') && (
                                                <button
                                                    type="button"
                                                    className={styles.actionIconBtn}
                                                    onClick={() => handleOpenEdit(item)}
                                                    title="Edit Caption / Link"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                            )}
                                            {canDelete('gallery') && (
                                                <button
                                                    type="button"
                                                    className={`${styles.actionIconBtn} ${styles.actionIconBtnDanger}`}
                                                    onClick={() => setDeleteConfirmItem(item)}
                                                    title="Delete Photo"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Full Preview Modal */}
            {previewImage && (
                <div className={styles.modalBackdrop} onClick={() => setPreviewImage(null)}>
                    <div
                        className={styles.modalBox}
                        style={{ maxWidth: '800px', background: 'transparent', border: 'none', boxShadow: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ position: 'relative', textAlign: 'center' }}>
                            <img
                                src={resolveMediaUrl(previewImage.public_url || previewImage.image_url)}
                                alt={previewImage.caption}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '75vh',
                                    borderRadius: '12px',
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setPreviewImage(null)}
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <X size={20} />
                            </button>
                            <div
                                style={{
                                    background: '#ffffff',
                                    color: '#0f172a',
                                    padding: '0.85rem 1.25rem',
                                    borderRadius: '8px',
                                    marginTop: '0.75rem',
                                    textAlign: 'left',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                }}
                            >
                                {previewImage.caption}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {editingItem ? 'Edit Media Asset' : 'Add Showcase Image'}
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
                                {!editingItem && (
                                    <MultiImageUploader files={uploadFiles} onChange={setUploadFiles} uploading={submitting} />
                                )}
                                {editingItem && <div className={styles.formGroup}><label className={styles.formLabel}>Image URL</label><input type="url" className={styles.formInput} value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} /></div>}

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Caption / Description</label>
                                    <input
                                        type="text"
                                        className={styles.formInput}
                                        placeholder="e.g. Winners of Hackathon 2026 Receiving Grand Prize"
                                        value={formData.caption}
                                        onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Associated Event</label>
                                    <select
                                        className={styles.formSelect}
                                        value={formData.event_id}
                                        onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                                    >
                                        <option value="">(None / General Council Media)</option>
                                        {events.map((ev) => (
                                            <option key={ev.id} value={ev.id}>
                                                {ev.title} ({ev.status})
                                            </option>
                                        ))}
                                    </select>
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
                                    {submitting ? 'Saving...' : editingItem ? 'Update Asset' : 'Add Image'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirmItem && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox} style={{ maxWidth: '440px' }}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle} style={{ color: '#dc2626' }}>
                                Confirm Media Removal
                            </h2>
                            <button
                                type="button"
                                className={styles.modalCloseBtn}
                                onClick={() => setDeleteConfirmItem(null)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <p style={{ color: '#334155', fontSize: '0.9rem', margin: 0 }}>
                                Are you sure you want to remove this photo from the showcase?
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
                                <strong>Safe Retention Policy:</strong> Removing this asset only unlinks it from the public gallery showcase. It will not destroy associated events or student registrations.
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className={styles.btnSecondary}
                                onClick={() => setDeleteConfirmItem(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={styles.btnDanger}
                                onClick={handleDeletePermanent}
                            >
                                Remove from Gallery
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
