import multer from "multer";
import { supabase } from "../config/supabase.js";
import {
    identifyImage,
    publicImageUrl,
    removeImage,
    saveImage
} from "../services/mediaStorage.service.js";

const settingsId = 1;

const isStorageUrl = (value) =>
    /^https?:\/\/.+\/storage\/v1\/object\/public\//i.test(value || "");

const removeStoredImage = async (imageUrl) => {
    if (!isStorageUrl(imageUrl)) return;
    try {
        await removeImage(imageUrl, "gallery");
    } catch (error) {
        console.error("[Homepage] Image cleanup error:", error);
    }
};

const validateImage = (file) => {
    if (!file) return null;
    const signature = identifyImage(file.buffer);
    if (!signature || signature.mime !== file.mimetype) {
        throw new Error(`Invalid image contents for ${file.originalname}`);
    }
    return signature;
};

const getSettings = async () => {
    const { data, error } = await supabase
        .from("homepage_settings")
        .select("id, hero_image_url, team_banner_url")
        .eq("id", settingsId)
        .maybeSingle();

    if (error) throw error;
    return data || { id: settingsId, hero_image_url: null, team_banner_url: null };
};

const getStories = async () => {
    const { data, error } = await supabase
        .from("startup_stories")
        .select("id, title, description, image_url, alt_text, display_order, created_at, updated_at")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
};

const toPublicStory = (req, story) => ({
    ...story,
    image_url: publicImageUrl(req, story.image_url)
});

export const getHomepage = async (req, res) => {
    try {
        const [settings, stories] = await Promise.all([getSettings(), getStories()]);
        return res.status(200).json({
            success: true,
            homepage: {
                hero_image_url: publicImageUrl(req, settings.hero_image_url),
                team_banner_url: publicImageUrl(req, settings.team_banner_url),
                startup_stories: stories.map((story) => toPublicStory(req, story))
            }
        });
    } catch (error) {
        console.error("[Homepage] Public fetch error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load homepage content"
        });
    }
};

export const getHomepageAdmin = async (req, res) => {
    try {
        const [settings, stories] = await Promise.all([getSettings(), getStories()]);
        return res.status(200).json({
            success: true,
            homepage: {
                ...settings,
                startup_stories: stories
            }
        });
    } catch (error) {
        console.error("[Homepage] Admin fetch error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load homepage content"
        });
    }
};

const updateBanner = async (req, res, field, label) => {
    let storedFile = null;
    try {
        const signature = validateImage(req.file);
        if (!signature) {
            return res.status(400).json({
                success: false,
                message: `${label} image is required`
            });
        }

        const settings = await getSettings();
        storedFile = await saveImage(req.file.buffer, signature, "gallery");

        const { data, error } = await supabase
            .from("homepage_settings")
            .upsert(
                [{ id: settingsId, [field]: storedFile.publicUrl }],
                { onConflict: "id" }
            )
            .select("id, hero_image_url, team_banner_url")
            .single();

        if (error) throw error;

        await removeStoredImage(settings[field]);
        return res.status(200).json({
            success: true,
            message: `${label} updated successfully`,
            homepage: data
        });
    } catch (error) {
        if (storedFile) await removeStoredImage(storedFile.publicUrl);
        console.error(`[Homepage] ${label} update error:`, error);
        return res.status(error instanceof multer.MulterError ? 400 : 500).json({
            success: false,
            message: error.message || `Failed to update ${label.toLowerCase()}`
        });
    }
};

export const updateHero = (req, res) =>
    updateBanner(req, res, "hero_image_url", "Hero background");

export const updateTeamBanner = (req, res) =>
    updateBanner(req, res, "team_banner_url", "Team banner");

const storyPayload = (body, imageUrl, displayOrder) => {
    const title = String(body.title || body.name || "").trim();
    const description = String(body.description || "").trim();
    const altText = String(body.alt_text || title).trim();
    const requestedOrder = Number.parseInt(body.display_order, 10);

    if (!title) throw new Error("Startup story title is required");

    const payload = {
        title,
        description,
        alt_text: altText || title,
        display_order: Number.isInteger(displayOrder)
            ? displayOrder
            : Number.isInteger(requestedOrder)
                ? requestedOrder
                : 0,
        updated_at: new Date().toISOString()
    };

    if (imageUrl !== undefined) payload.image_url = imageUrl;
    return payload;
};

export const createStartupStory = async (req, res) => {
    let storedFile = null;
    try {
        const signature = validateImage(req.file);
        if (!signature) {
            return res.status(400).json({
                success: false,
                message: "Startup story image is required"
            });
        }

        storedFile = await saveImage(req.file.buffer, signature, "gallery");
        const { data: lastStory, error: lastStoryError } = await supabase
            .from("startup_stories")
            .select("display_order")
            .order("display_order", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastStoryError) throw lastStoryError;

        const nextOrder = lastStory
            ? Number(lastStory.display_order) + 1
            : undefined;
        const payload = storyPayload(req.body, storedFile.publicUrl, nextOrder);
        const { data, error } = await supabase
            .from("startup_stories")
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json({
            success: true,
            message: "Startup story created successfully",
            story: data
        });
    } catch (error) {
        if (storedFile) await removeStoredImage(storedFile.publicUrl);
        console.error("[Homepage] Story create error:", error);
        return res.status(error instanceof multer.MulterError ? 400 : 500).json({
            success: false,
            message: error.message || "Failed to create startup story"
        });
    }
};

export const updateStartupStory = async (req, res) => {
    let storedFile = null;
    try {
        const { id } = req.params;
        const { data: existing, error: fetchError } = await supabase
            .from("startup_stories")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (fetchError) throw fetchError;
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Startup story not found"
            });
        }

        let imageUrl;
        if (req.file) {
            const signature = validateImage(req.file);
            storedFile = await saveImage(req.file.buffer, signature, "gallery");
            imageUrl = storedFile.publicUrl;
        }

        const payload = storyPayload(req.body, imageUrl);
        const { data, error } = await supabase
            .from("startup_stories")
            .update(payload)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        if (storedFile) await removeStoredImage(existing.image_url);

        return res.status(200).json({
            success: true,
            message: "Startup story updated successfully",
            story: data
        });
    } catch (error) {
        if (storedFile) await removeStoredImage(storedFile.publicUrl);
        console.error("[Homepage] Story update error:", error);
        return res.status(error instanceof multer.MulterError ? 400 : 500).json({
            success: false,
            message: error.message || "Failed to update startup story"
        });
    }
};

export const deleteStartupStory = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: existing, error: fetchError } = await supabase
            .from("startup_stories")
            .select("id, image_url")
            .eq("id", id)
            .maybeSingle();

        if (fetchError) throw fetchError;
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Startup story not found"
            });
        }

        const { error } = await supabase
            .from("startup_stories")
            .delete()
            .eq("id", id);

        if (error) throw error;
        await removeStoredImage(existing.image_url);

        return res.status(200).json({
            success: true,
            message: "Startup story deleted successfully"
        });
    } catch (error) {
        console.error("[Homepage] Story delete error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete startup story"
        });
    }
};

export const reorderStartupStories = async (req, res) => {
    try {
        const { order } = req.body;
        if (!Array.isArray(order) || order.length === 0) {
            return res.status(400).json({
                success: false,
                message: "A non-empty story order array is required"
            });
        }

        for (const [index, id] of order.entries()) {
            const { error } = await supabase
                .from("startup_stories")
                .update({ display_order: index, updated_at: new Date().toISOString() })
                .eq("id", id);
            if (error) throw error;
        }

        return res.status(200).json({
            success: true,
            message: "Startup story order updated successfully"
        });
    } catch (error) {
        console.error("[Homepage] Story reorder error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update startup story order"
        });
    }
};
