import multer from "multer";
import { supabase } from "../config/supabase.js";
import {
    filenameFromImagePath,
    identifyImage,
    publicImageUrl,
    removeImage,
    saveImage
} from "../services/mediaStorage.service.js";

// Upload / Create Gallery Record
export const createGalleryImage = async (req, res) => {
    try {
        const { image_url, image, caption, description, title, event_id } = req.body;
        const finalImageUrl = image_url || image;
        const finalCaption = caption || description || title || "";

        if (!finalImageUrl) {
            return res.status(400).json({
                success: false,
                message: "Image URL is required"
            });
        }

        const payload = {
            image_url: finalImageUrl,
            caption: finalCaption,
            event_id: event_id ? Number(event_id) : null
        };

        const { data, error } = await supabase
            .from("gallery")
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error("[Gallery] Create error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to save gallery item"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Gallery image saved successfully",
            galleryImage: data
        });
    } catch (error) {
        console.error("[Gallery] Unexpected error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get All Gallery Images (with optional event_id filtering)
export const getAllGalleryImages = async (req, res) => {
    try {
        const { event_id } = req.query;

        let query = supabase
            .from("gallery")
            .select("id, event_id, image_url, caption, created_at")
            .order("created_at", { ascending: false });

        if (event_id) {
            query = query.eq("event_id", Number(event_id));
        }

        const { data: dbImages, error: dbError } = await query;

        if (dbError) {
            console.error("[Gallery] Fetch error:", dbError);
            return res.status(500).json({
                success: false,
                message: dbError.message
            });
        }

        // Format for frontend compatibility
        const formattedImages = (dbImages || []).map((img) => ({
            id: img.id,
            event_id: img.event_id,
            title: img.caption || "Gallery Image",
            caption: img.caption,
            images: [img.image_url],
            image_url: img.image_url,
            public_url: publicImageUrl(req, img.image_url),
            date: img.created_at
        }));

        return res.status(200).json({
            success: true,
            galleryImages: formattedImages,
            gallery: formattedImages
        });
    } catch (error) {
        console.error("[Gallery] Unexpected error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update Gallery Image
export const updateGalleryImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { image_url, image, caption, description, title, event_id } = req.body;

        const updates = {};
        if (image_url || image) updates.image_url = image_url || image;
        if (caption || description || title !== undefined) updates.caption = caption || description || title;
        if (event_id !== undefined) updates.event_id = event_id ? Number(event_id) : null;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided to update"
            });
        }

        const { data, error } = await supabase
            .from("gallery")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                message: "Gallery image not found or update failed"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Gallery image updated successfully",
            galleryImage: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete Gallery Image
export const deleteGalleryImage = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: existing, error: fetchError } = await supabase
            .from("gallery")
            .select("id, image_url")
            .eq("id", id)
            .maybeSingle();

        if (fetchError) throw fetchError;
        if (!existing) {
            return res.status(404).json({ success: false, message: "Gallery image not found" });
        }

        const { error } = await supabase
            .from("gallery")
            .delete()
            .eq("id", id);

        if (error) throw error;

        const filename = filenameFromImagePath(existing.image_url);
        if (filename) {
            const { count: references, error: referenceError } = await supabase
                .from("gallery")
                .select("id", { count: "exact", head: true })
                .eq("image_url", existing.image_url);
            if (referenceError) throw referenceError;
            if (!references) {
                await removeImage(filename);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Gallery image deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const uploadGalleryImages = async (req, res) => {
    const savedFiles = [];
    try {
        if (!req.files?.length) {
            return res.status(400).json({ success: false, message: "Select at least one image to upload" });
        }

        const eventId = req.body.event_id ? Number(req.body.event_id) : null;
        if (eventId !== null && !Number.isInteger(eventId)) {
            return res.status(400).json({ success: false, message: "Invalid event ID" });
        }

        let captions = [];
        if (req.body.captions) {
            try {
                captions = Array.isArray(req.body.captions) ? req.body.captions : JSON.parse(req.body.captions);
            } catch {
                return res.status(400).json({ success: false, message: "Captions must be a JSON array" });
            }
        }
        if (!Array.isArray(captions)) {
            return res.status(400).json({ success: false, message: "Captions must be a JSON array" });
        }

        const records = [];
        for (const [index, file] of req.files.entries()) {
            const signature = identifyImage(file.buffer);
            if (!signature || signature.mime !== file.mimetype) {
                return res.status(400).json({ success: false, message: `Invalid image contents for ${file.originalname}` });
            }
            const stored = await saveImage(file.buffer, signature);
            savedFiles.push(stored);
            records.push({
                image_url: stored.relativePath,
                caption: String(captions[index] || "").trim(),
                event_id: eventId
            });
        }

        const { data, error } = await supabase.from("gallery").insert(records).select();
        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: `${records.length} image${records.length === 1 ? "" : "s"} uploaded successfully`,
            galleryImages: (data || []).map((item) => ({
                ...item,
                public_url: publicImageUrl(req, item.image_url)
            }))
        });
    } catch (error) {
        await Promise.allSettled(savedFiles.map((file) => removeImage(file.filename)));
        console.error("[Gallery] Upload error:", error);
        return res.status(error instanceof multer.MulterError ? 400 : 500).json({
            success: false,
            message: error.message || "Failed to upload images"
        });
    }
};
