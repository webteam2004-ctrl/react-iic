import { supabase } from "../config/supabase.js";

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
            date: img.created_at
        }));

        return res.status(200).json({
            success: true,
            galleryImages: formattedImages
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

        const { error, count } = await supabase
            .from("gallery")
            .delete({ count: "exact" })
            .eq("id", id);

        if (error) throw error;
        if (count === 0) {
            return res.status(404).json({
                success: false,
                message: "Gallery image not found"
            });
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
