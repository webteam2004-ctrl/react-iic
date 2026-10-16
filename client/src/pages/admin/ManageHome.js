import React, { useCallback, useEffect, useState } from 'react';
import {
    ArrowDown,
    ArrowUp,
    CheckCircle,
    Edit2,
    Image as ImageIcon,
    Plus,
    RefreshCw,
    Save,
    Trash2,
    Upload,
    AlertTriangle
} from 'lucide-react';
import { api, resolveMediaUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './ManageHome.module.css';

const emptyStory = {
    title: '',
    description: '',
    alt_text: '',
    display_order: ''
};

function ImagePreview({ src, alt, className }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) {
        return <div className={`${styles.imagePlaceholder} ${className || ''}`}><ImageIcon size={28} /><span>No image preview</span></div>;
    }
    return (
        <img
            className={className}
            src={resolveMediaUrl(src)}
            alt={alt}
            onError={() => setFailed(true)}
        />
    );
}

export default function ManageHome() {
    const { canCreate, canUpdate, canDelete } = useAuth();
    const canCreateHome = canCreate('manage_home');
    const canUpdateHome = canUpdate('manage_home');
    const canDeleteHome = canDelete('manage_home');
    const [homepage, setHomepage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState('');
    const [toast, setToast] = useState(null);
    const [heroFile, setHeroFile] = useState(null);
    const [teamFile, setTeamFile] = useState(null);
    const [storyFile, setStoryFile] = useState(null);
    const [storyForm, setStoryForm] = useState(emptyStory);
    const [editingStory, setEditingStory] = useState(null);
    const [storyPreview, setStoryPreview] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 4500);
    }, []);

    const loadHomepage = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.homepage.getAdmin();
            setHomepage(response.homepage);
        } catch (error) {
            showToast(error.message || 'Failed to load homepage content', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadHomepage();
    }, [loadHomepage]);

    const saveBanner = async (type) => {
        const file = type === 'hero' ? heroFile : teamFile;
        if (!file) {
            showToast('Choose an image before saving', 'error');
            return;
        }
        setSaving(type);
        try {
            const response = type === 'hero'
                ? await api.homepage.updateHero(file)
                : await api.homepage.updateTeamBanner(file);
            setHomepage((current) => ({ ...current, ...response.homepage }));
            type === 'hero' ? setHeroFile(null) : setTeamFile(null);
            showToast(`${type === 'hero' ? 'Hero background' : 'Team banner'} updated`);
        } catch (error) {
            showToast(error.message || 'Failed to save image', 'error');
        } finally {
            setSaving('');
        }
    };

    const resetStoryForm = () => {
        setEditingStory(null);
        setStoryForm(emptyStory);
        setStoryFile(null);
        setStoryPreview(null);
    };

    const editStory = (story) => {
        setEditingStory(story);
        setStoryForm({
            title: story.title || '',
            description: story.description || '',
            alt_text: story.alt_text || '',
            display_order: story.display_order || 0
        });
        setStoryFile(null);
        setStoryPreview(story.image_url);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const submitStory = async (event) => {
        event.preventDefault();
        if (saving === 'story') return;
        if (!storyForm.title.trim() || (!editingStory && !storyFile)) {
            showToast(editingStory ? 'A story title is required' : 'A title and image are required', 'error');
            return;
        }
        setSaving('story');
        try {
            const response = editingStory
                ? await api.homepage.updateStory(editingStory.id, storyForm, storyFile)
                : await api.homepage.createStory(storyForm, storyFile);
            setHomepage((current) => ({
                ...current,
                startup_stories: editingStory
                    ? current.startup_stories.map((story) =>
                        story.id === response.story.id ? response.story : story
                    )
                    : [...current.startup_stories, response.story]
            }));
            resetStoryForm();
            showToast(editingStory ? 'Startup story updated' : 'Startup story added');
            await loadHomepage();
        } catch (error) {
            showToast(error.message || 'Failed to save startup story', 'error');
        } finally {
            setSaving('');
        }
    };

    const deleteStory = async (story) => {
        if (!window.confirm(`Delete "${story.title}"? This cannot be undone.`)) return;
        setSaving(`delete-${story.id}`);
        try {
            await api.homepage.deleteStory(story.id);
            await loadHomepage();
            if (editingStory?.id === story.id) resetStoryForm();
            showToast('Startup story deleted');
        } catch (error) {
            showToast(error.message || 'Failed to delete startup story', 'error');
        } finally {
            setSaving('');
        }
    };

    const moveStory = async (index, direction) => {
        const stories = [...homepage.startup_stories];
        const target = index + direction;
        if (target < 0 || target >= stories.length) return;
        [stories[index], stories[target]] = [stories[target], stories[index]];
        setSaving('order');
        try {
            await api.homepage.reorderStories(stories.map((story) => story.id));
            await loadHomepage();
            showToast('Story order updated');
        } catch (error) {
            showToast(error.message || 'Failed to update story order', 'error');
        } finally {
            setSaving('');
        }
    };

    if (loading) {
        return <div className={styles.loadingState}><RefreshCw className={styles.spin} size={20} /> Loading homepage content...</div>;
    }

    if (!homepage) return null;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.headerTitle}>Manage Home Page</h1>
                    <p className={styles.headerSubtitle}>Update the public homepage without changing source code.</p>
                </div>
                <button className={styles.btnSecondary} type="button" onClick={loadHomepage} disabled={loading}>
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            {toast && (
                <div className={toast.type === 'error' ? styles.toastError : styles.toastSuccess}>
                    {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    {toast.message}
                </div>
            )}

            <section className={styles.sectionCard}>
                <div className={styles.sectionHeading}><div><h2>Hero Background</h2><p>Replace the full-width image at the top of the homepage.</p></div><Upload size={22} /></div>
                <div className={styles.bannerGrid}>
                    <ImagePreview src={heroFile ? URL.createObjectURL(heroFile) : homepage.hero_image_url} alt="Hero background preview" className={styles.heroPreview} />
                    <div className={styles.controls}>
                        <label className={styles.fileLabel}>Choose image<input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(event) => setHeroFile(event.target.files[0] || null)} /></label>
                        {heroFile && <span className={styles.fileName}>{heroFile.name}</span>}
                        <button className={styles.btnPrimary} type="button" disabled={!canUpdateHome || !heroFile || saving === 'hero'} onClick={() => saveBanner('hero')}><Save size={16} />{saving === 'hero' ? 'Saving...' : 'Save Hero Background'}</button>
                    </div>
                </div>
            </section>

            <section className={styles.sectionCard}>
                <div className={styles.sectionHeading}><div><h2>Startup Stories</h2><p>Manage the stories shown in the homepage carousel.</p></div><ImageIcon size={22} /></div>
                <div className={styles.storyList}>
                    {homepage.startup_stories.map((story, index) => (
                        <div className={styles.storyRow} key={story.id}>
                            <ImagePreview src={story.image_url} alt={story.alt_text || story.title} className={styles.storyThumb} />
                            <div className={styles.storyDetails}><strong>{story.title}</strong><span>{story.description || 'No supporting description'}</span></div>
                            <div className={styles.rowActions}>
                                <button className={styles.iconButton} type="button" title="Move up" disabled={!canUpdateHome || index === 0 || saving === 'order'} onClick={() => moveStory(index, -1)}><ArrowUp size={16} /></button>
                                <button className={styles.iconButton} type="button" title="Move down" disabled={!canUpdateHome || index === homepage.startup_stories.length - 1 || saving === 'order'} onClick={() => moveStory(index, 1)}><ArrowDown size={16} /></button>
                                <button className={styles.iconButton} type="button" title="Edit story" disabled={!canUpdateHome} onClick={() => editStory(story)}><Edit2 size={16} /></button>
                                <button className={`${styles.iconButton} ${styles.danger}`} type="button" title="Delete story" disabled={!canDeleteHome || saving === `delete-${story.id}`} onClick={() => deleteStory(story)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {!homepage.startup_stories.length && <p className={styles.emptyState}>No startup stories have been added yet.</p>}
                </div>
                <form className={styles.storyForm} onSubmit={submitStory}>
                    <h3>{editingStory ? 'Edit Startup Story' : 'Add Startup Story'}</h3>
                    <div className={styles.formGrid}>
                        <label>Title<input value={storyForm.title} onChange={(event) => setStoryForm({ ...storyForm, title: event.target.value })} placeholder="Startup or founder name" /></label>
                        <label>Display order<input type="number" min="0" value={storyForm.display_order} onChange={(event) => setStoryForm({ ...storyForm, display_order: event.target.value })} /></label>
                        <label className={styles.fullWidth}>Description<textarea rows="4" value={storyForm.description} onChange={(event) => setStoryForm({ ...storyForm, description: event.target.value })} placeholder="Supporting story content" /></label>
                        <label className={styles.fullWidth}>Image alt text<input value={storyForm.alt_text} onChange={(event) => setStoryForm({ ...storyForm, alt_text: event.target.value })} placeholder="Accessible image description" /></label>
                        <label className={styles.fullWidth}>Story image<input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(event) => { const file = event.target.files[0] || null; setStoryFile(file); setStoryPreview(file ? URL.createObjectURL(file) : editingStory?.image_url || null); }} /></label>
                    </div>
                    {storyPreview && <ImagePreview src={storyPreview} alt="Story preview" className={styles.formPreview} />}
                    <div className={styles.formActions}>
                        {editingStory && <button className={styles.btnSecondary} type="button" onClick={resetStoryForm}>Cancel</button>}
                        <button className={styles.btnPrimary} type="submit" disabled={(editingStory ? !canUpdateHome : !canCreateHome) || saving === 'story'}>{editingStory ? <Save size={16} /> : <Plus size={16} />}{saving === 'story' ? 'Saving...' : editingStory ? 'Update Story' : 'Add Story'}</button>
                    </div>
                </form>
            </section>

            <section className={styles.sectionCard}>
                <div className={styles.sectionHeading}><div><h2>Team Banner</h2><p>Replace the wide team photograph above the homepage footer.</p></div><Upload size={22} /></div>
                <div className={styles.bannerGrid}>
                    <ImagePreview src={teamFile ? URL.createObjectURL(teamFile) : homepage.team_banner_url} alt="Team banner preview" className={styles.teamPreview} />
                    <div className={styles.controls}>
                        <label className={styles.fileLabel}>Choose image<input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(event) => setTeamFile(event.target.files[0] || null)} /></label>
                        {teamFile && <span className={styles.fileName}>{teamFile.name}</span>}
                        <button className={styles.btnPrimary} type="button" disabled={!canUpdateHome || !teamFile || saving === 'team'} onClick={() => saveBanner('team')}><Save size={16} />{saving === 'team' ? 'Saving...' : 'Save Team Banner'}</button>
                    </div>
                </div>
            </section>
        </div>
    );
}
