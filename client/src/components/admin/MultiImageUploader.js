import React, { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import styles from './MultiImageUploader.module.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function MultiImageUploader({ files, onChange, disabled = false, uploading = false, maxFiles = 20 }) {
    const inputRef = useRef(null);
    const [errors, setErrors] = useState([]);
    const [dragging, setDragging] = useState(false);

    const addFiles = (selectedFiles) => {
        const nextErrors = [];
        const valid = [];
        Array.from(selectedFiles).forEach((file) => {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                nextErrors.push(`${file.name}: choose a JPEG, PNG, GIF, or WebP image.`);
            } else if (file.size > MAX_FILE_SIZE) {
                nextErrors.push(`${file.name}: maximum size is 10 MB.`);
            } else {
                valid.push({ file, preview: URL.createObjectURL(file), caption: '' });
            }
        });
        setErrors(nextErrors);
        onChange([...files, ...valid].slice(0, maxFiles));
    };

    const removeFile = (index) => {
        URL.revokeObjectURL(files[index].preview);
        onChange(files.filter((_, fileIndex) => fileIndex !== index));
    };

    const updateCaption = (index, caption) => {
        onChange(files.map((item, fileIndex) => fileIndex === index ? { ...item, caption } : item));
    };

    return (
        <div className={styles.wrapper}>
            <div
                className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}
            >
                <ImagePlus size={24} />
                <strong>Upload Images</strong>
                <span>{maxFiles === 1 ? 'Choose an image or drag and drop it here' : 'Choose multiple images or drag and drop them here'}</span>
                <small>JPEG, PNG, GIF, or WebP up to 10 MB each</small>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }}
                    disabled={disabled || uploading}
                />
                <button type="button" className={styles.selectButton} onClick={() => inputRef.current?.click()} disabled={disabled || uploading}>
                    Select files
                </button>
            </div>
            {errors.length > 0 && <div className={styles.errors} role="alert">{errors.map((error) => <div key={error}>{error}</div>)}</div>}
            {files.length > 0 && (
                <div className={styles.previewGrid}>
                    {files.map((item, index) => (
                        <div className={styles.previewCard} key={`${item.file.name}-${item.file.lastModified}-${index}`}>
                            <img src={item.preview} alt={item.file.name} />
                            <button type="button" className={styles.removeButton} onClick={() => removeFile(index)} aria-label={`Remove ${item.file.name}`} disabled={uploading}>
                                <X size={14} />
                            </button>
                            <div className={styles.fileName} title={item.file.name}>{item.file.name}</div>
                            <div className={styles.fileSize}>{formatSize(item.file.size)}</div>
                            <input
                                className={styles.captionInput}
                                value={item.caption}
                                onChange={(event) => updateCaption(index, event.target.value)}
                                placeholder="Optional caption"
                                maxLength={240}
                                disabled={uploading}
                            />
                        </div>
                    ))}
                </div>
            )}
            {uploading && <div className={styles.status}>Uploading {files.length} image{files.length === 1 ? '' : 's'}...</div>}
        </div>
    );
}
