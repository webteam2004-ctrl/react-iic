
import crypto from "node:crypto";
import path from "node:path";
import { supabase } from "../config/supabase.js";

const BUCKETS = {
    events: "events",
    gallery: "gallery",
    team: "team-members"
};

// Keep the existing export for compatibility.
// Images are no longer stored in this local directory.
export const storageDirectory = path.resolve(
    process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads")
);

const imageSignatures = [
    {
        mime: "image/jpeg",
        extension: ".jpg",
        matches: (b) =>
            b.length > 2 &&
            b[0] === 0xff &&
            b[1] === 0xd8 &&
            b[2] === 0xff
    },
    {
        mime: "image/png",
        extension: ".png",
        matches: (b) =>
            b.length >= 8 &&
            b.subarray(0, 8).equals(
                Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
            )
    },
    {
        mime: "image/gif",
        extension: ".gif",
        matches: (b) =>
            b.subarray(0, 6).toString("ascii") === "GIF87a" ||
            b.subarray(0, 6).toString("ascii") === "GIF89a"
    },
    {
        mime: "image/webp",
        extension: ".webp",
        matches: (b) =>
            b.length >= 12 &&
            b.subarray(0, 4).toString("ascii") === "RIFF" &&
            b.subarray(8, 12).toString("ascii") === "WEBP"
    }
];

export const identifyImage = (buffer) =>
    imageSignatures.find((signature) => signature.matches(buffer));

/**
 * Retained for compatibility with existing imports.
 * Supabase Storage does not require a local upload directory.
 */
export const ensureStorageDirectory = async () => {};

const getBucket = (category = "gallery") => {
    const bucket = BUCKETS[category];

    if (!bucket) {
        throw new Error(`Invalid image storage category: ${category}`);
    }

    return bucket;
};

/**
 * Uploads to Supabase Storage.
 *
 * category: "events" | "gallery" | "team"
 * Existing controllers can continue calling saveImage(buffer, signature).
 */
export const saveImage = async (
    buffer,
    signature,
    category = "gallery"
) => {
    if (!signature || !signature.mime || !signature.extension) {
        throw new Error("Invalid image signature");
    }

    const bucket = getBucket(category);
    const filename = `${crypto.randomUUID()}${signature.extension}`;
    const objectPath = filename;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(objectPath, buffer, {
            contentType: signature.mime,
            cacheControl: "31536000",
            upsert: false
        });

    if (error) throw error;

    const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return {
        filename,
        relativePath: publicData.publicUrl,
        absolutePath: null,
        bucket,
        objectPath: data.path,
        publicUrl: publicData.publicUrl
    };
};

/**
 * Removes a Supabase Storage object.
 * Pass the filename or the original /media/ path.
 * For a public URL, provide the bucket separately.
 */
export const removeImage = async (filename, category = "gallery") => {
    if (!filename || filename.includes("\\") || filename.includes("..")) {
        throw new Error("Invalid stored image filename");
    }

    let bucket = getBucket(category);
    let objectPath = filename;

    // Support the upload result's returned object metadata.
    if (filename.startsWith("http://") || filename.startsWith("https://")) {
        const url = new URL(filename);
        const marker = "/storage/v1/object/public/";
        const markerIndex = url.pathname.indexOf(marker);

        if (markerIndex === -1) {
            throw new Error("Invalid Supabase Storage public URL");
        }

        const remainder = url.pathname.slice(
            markerIndex + marker.length
        );
        const slashIndex = remainder.indexOf("/");

        if (slashIndex === -1) {
            throw new Error("Invalid Supabase Storage object path");
        }

        bucket = remainder.slice(0, slashIndex);
        objectPath = decodeURIComponent(remainder.slice(slashIndex + 1));

        if (!Object.values(BUCKETS).includes(bucket)) {
            throw new Error("Unknown Supabase Storage bucket");
        }
    } else if (filename.startsWith("/media/")) {
        throw new Error(
            "Legacy local image path cannot be deleted from Supabase Storage"
        );
    }

    const { error } = await supabase.storage
        .from(bucket)
        .remove([objectPath]);

    if (error) throw error;
};

export const filenameFromImagePath = (imagePath = "") => {
    try {
        const url = new URL(imagePath, "http://localhost");
        const marker = "/storage/v1/object/public/";
        const markerIndex = url.pathname.indexOf(marker);

        if (markerIndex !== -1) {
            const remainder = url.pathname.slice(
                markerIndex + marker.length
            );
            const slashIndex = remainder.indexOf("/");

            return slashIndex === -1
                ? null
                : decodeURIComponent(remainder.slice(slashIndex + 1));
        }

        return url.pathname.startsWith("/media/")
            ? url.pathname.split("/").pop()
            : null;
    } catch {
        return null;
    }
};

export const publicImageUrl = (req, imagePath) => {
    if (!imagePath) return null;

    // Supabase public URLs should be returned unchanged.
    if (/^https?:\/\//i.test(imagePath)) {
        return imagePath;
    }

    // Keep support for legacy images during migration.
    const base = (
        process.env.PUBLIC_API_URL ||
        `${req.protocol}://${req.get("host")}`
    ).replace(/\/+$/, "");

    return `${base}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
};
