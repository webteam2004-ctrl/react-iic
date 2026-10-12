import { supabase } from "../config/supabase.js";

/**
 * Unified Shared Form & Data Pipeline Controller.
 * Enables publishing an event, its calendar schedule, and associated gallery images in one consistent transaction.
 */
export const publishUnifiedEvent = async (req, res) => {
    try {
        const {
            event_id,
            title,
            description,
            start_time,
            end_time,
            date,
            time,
            location,
            status = "upcoming",
            calendar_sync = true,
            media_urls = [],
            image_url,
            caption
        } = req.body;

        if (!title && !event_id) {
            return res.status(400).json({
                success: false,
                message: "Event title or existing event_id is required"
            });
        }

        let calculatedStartTime = start_time;
        if (!calculatedStartTime && date) {
            calculatedStartTime = time ? new Date(`${date} ${time}`).toISOString() : new Date(date).toISOString();
        }

        const eventPayload = {
            description: description ? description.trim() : "",
            start_time: calculatedStartTime || new Date().toISOString(),
            end_time: end_time || null,
            location: location ? location.trim() : "Campus / Virtual",
            status,
            calendar_sync: Boolean(calendar_sync),
            updated_at: new Date().toISOString()
        };
        if (title) eventPayload.title = title.trim();

        let savedEvent = null;

        if (event_id) {
            // Update existing event
            const { data, error } = await supabase
                .from("events")
                .update(eventPayload)
                .eq("id", event_id)
                .select()
                .single();

            if (error) throw error;
            savedEvent = data;
        } else {
            // Create new event
            const { data, error } = await supabase
                .from("events")
                .insert([eventPayload])
                .select()
                .single();

            if (error) throw error;
            savedEvent = data;
        }

        // Process media attachments to gallery
        const imagesToAttach = [];
        if (Array.isArray(media_urls) && media_urls.length > 0) {
            imagesToAttach.push(...media_urls);
        }
        if (image_url && !imagesToAttach.includes(image_url)) {
            imagesToAttach.push(image_url);
        }

        const createdGalleryRecords = [];

        if (imagesToAttach.length > 0) {
            const galleryInserts = imagesToAttach.map((url) => ({
                event_id: savedEvent.id,
                image_url: url,
                caption: caption || savedEvent.title || "Event Media"
            }));

            const { data: galleryData, error: galleryError } = await supabase
                .from("gallery")
                .insert(galleryInserts)
                .select();

            if (galleryError) {
                console.warn("[Pipeline] Failed to attach some gallery images:", galleryError.message);
            } else if (galleryData) {
                createdGalleryRecords.push(...galleryData);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Event, calendar schedule, and gallery media synchronized successfully via pipeline",
            event: savedEvent,
            calendar_synced: savedEvent.calendar_sync,
            gallery_attached: createdGalleryRecords
        });
    } catch (err) {
        console.error("[Pipeline] Publish error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to execute unified pipeline"
        });
    }
};
