import { supabase } from "../config/supabase.js";
import { publicImageUrl } from "../services/mediaStorage.service.js";

/**
 * Helper to normalize event dates/times into start_time & end_time
 */
const normalizeEventPayload = (body) => {
    const {
        title,
        description,
        start_time,
        end_time,
        date,
        time,
        location,
        status = "upcoming",
        calendar_sync = true
    } = body;

    let calculatedStartTime = start_time;
    if (!calculatedStartTime && date) {
        calculatedStartTime = time ? new Date(`${date} ${time}`).toISOString() : new Date(date).toISOString();
    }

    return {
        title: title ? title.trim() : undefined,
        description: description ? description.trim() : "",
        start_time: calculatedStartTime || new Date().toISOString(),
        end_time: end_time || null,
        location: location ? location.trim() : "Online / Campus",
        status,
        calendar_sync: Boolean(calendar_sync),
        updated_at: new Date().toISOString()
    };
};

// Create Event
export const createEvent = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Event title is required"
            });
        }

        const payload = normalizeEventPayload(req.body);

        const { data, error } = await supabase
            .from("events")
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error("[Events] Create error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to create event"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Event created and calendar synchronized successfully",
            event: data
        });
    } catch (error) {
        console.error("[Events] Unexpected error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get All Events (with optional status & calendar_sync filtering)
export const getAllEvents = async (req, res) => {
    try {
        const { status, calendar_only } = req.query;

        let query = supabase
            .from("events")
            .select("*")
            .order("start_time", { ascending: true });

        if (status) {
            query = query.eq("status", status);
        } else {
            // By default hide archived events unless explicitly requested
            query = query.neq("status", "archived");
        }

        if (calendar_only === "true") {
            query = query.eq("calendar_sync", true);
        }

        const { data: events, error } = await query;

        if (error) throw error;

        const eventIds = (events || []).map((event) => event.id);
        let galleryByEvent = {};
        if (eventIds.length > 0) {
            const { data: images, error: imageError } = await supabase
                .from("gallery")
                .select("id, event_id, image_url, caption, created_at")
                .in("event_id", eventIds)
                .order("created_at", { ascending: true });
            if (imageError) throw imageError;
            galleryByEvent = (images || []).reduce((groups, image) => {
                groups[image.event_id] = groups[image.event_id] || [];
                groups[image.event_id].push({ ...image, public_url: publicImageUrl(req, image.image_url) });
                return groups;
            }, {});
        }

        const eventsWithGallery = (events || []).map((event) => ({
            ...event,
            gallery: galleryByEvent[event.id] || [],
            cover_image: (galleryByEvent[event.id] || [])[0] || null
        }));

        return res.status(200).json({
            success: true,
            events: eventsWithGallery
        });
    } catch (error) {
        console.error("[Events] Get all error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get Event by ID
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: event, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Fetch linked gallery images if any
        const { data: linkedGallery } = await supabase
            .from("gallery")
            .select("*")
            .eq("event_id", id);

        const gallery = (linkedGallery || []).map((image) => ({
            ...image,
            public_url: publicImageUrl(req, image.image_url)
        }));

        return res.status(200).json({
            success: true,
            event: {
                ...event,
                gallery,
                cover_image: gallery[0] || null
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update Event
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = normalizeEventPayload(req.body);

        const { data: event, error } = await supabase
            .from("events")
            .update(payload)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Event updated and calendar synchronized successfully",
            event
        });
    } catch (error) {
        console.error("[Events] Update error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete Event with Safe Data Retention Policy
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { soft_delete } = req.query;

        // Check if event exists
        const { data: existingEvent, error: fetchErr } = await supabase
            .from("events")
            .select("id, title")
            .eq("id", id)
            .single();

        if (fetchErr || !existingEvent) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // If soft delete requested, archive the event to preserve history
        if (soft_delete === "true") {
            const { data: archivedEvent, error: archiveErr } = await supabase
                .from("events")
                .update({ status: "archived", calendar_sync: false, updated_at: new Date().toISOString() })
                .eq("id", id)
                .select()
                .single();

            if (archiveErr) throw archiveErr;

            return res.status(200).json({
                success: true,
                message: "Event archived successfully (historical records & media preserved)",
                event: archivedEvent
            });
        }

        // RETENTION POLICY: Unlink linked gallery images first so media is never accidentally destroyed
        const { error: unlinkError } = await supabase
            .from("gallery")
            .update({ event_id: null })
            .eq("event_id", id);

        if (unlinkError) {
            console.warn("[Events] Warning: failed to unlink gallery images prior to delete:", unlinkError.message);
        }

        // Permanently delete event
        const { error: deleteErr } = await supabase
            .from("events")
            .delete()
            .eq("id", id);

        if (deleteErr) throw deleteErr;

        return res.status(200).json({
            success: true,
            message: "Event deleted successfully. Linked media was safely retained."
        });
    } catch (error) {
        console.error("[Events] Delete error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};