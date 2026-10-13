import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const storageDirectory = path.resolve(
    process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads")
);

const imageSignatures = [
    { mime: "image/jpeg", extension: ".jpg", matches: (b) => b.length > 2 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    { mime: "image/png", extension: ".png", matches: (b) => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
    { mime: "image/gif", extension: ".gif", matches: (b) => b.subarray(0, 6).toString("ascii") === "GIF87a" || b.subarray(0, 6).toString("ascii") === "GIF89a" },
    { mime: "image/webp", extension: ".webp", matches: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP" }
];

export const identifyImage = (buffer) => imageSignatures.find((signature) => signature.matches(buffer));

export const ensureStorageDirectory = () => fs.mkdir(storageDirectory, { recursive: true });

export const saveImage = async (buffer, signature) => {
    await ensureStorageDirectory();
    const filename = `${crypto.randomUUID()}${signature.extension}`;
    const absolutePath = path.join(storageDirectory, filename);
    await fs.writeFile(absolutePath, buffer, { flag: "wx" });
    return { filename, relativePath: `/media/${filename}`, absolutePath };
};

export const removeImage = async (filename) => {
    if (!filename || filename.includes("/") || filename.includes("\\") || filename !== path.basename(filename)) {
        throw new Error("Invalid stored image filename");
    }
    await fs.rm(path.join(storageDirectory, filename), { force: true });
};

export const filenameFromImagePath = (imagePath = "") => {
    const pathname = imagePath.split("?")[0];
    return pathname.startsWith("/media/") ? path.basename(pathname) : null;
};

export const publicImageUrl = (req, relativePath) => {
    if (!relativePath) return null;
    if (/^https?:\/\//i.test(relativePath)) return relativePath;
    const base = (process.env.PUBLIC_API_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
    return `${base}${relativePath.startsWith("/") ? relativePath : `/${relativePath}`}`;
};

