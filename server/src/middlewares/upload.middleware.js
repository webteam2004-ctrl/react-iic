import multer from "multer";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        files: Number(process.env.MAX_UPLOAD_FILES || 20),
        fileSize: Number(process.env.MAX_UPLOAD_SIZE_BYTES || 10 * 1024 * 1024)
    },
    fileFilter: (req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only JPEG, PNG, GIF, and WebP images are allowed"));
        }
        callback(null, true);
    }
});
