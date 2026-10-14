import { supabase } from "../config/supabase.js";

/**
 * Calendar Controller - Derives schedule directly from events (Single Source of Truth)
 */

// Get all calendar events
export const getCalendarEvents = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        let query = supabase
            .from("events")
            .select("id, title, description, start_time, end_time, location, status, calendar_sync")
            .eq("calendar_sync", true)
            .neq("status", "archived")
            .order("start_time", { ascending: true });

        if (start_date) {
            query = query.gte("start_time", new Date(start_date).toISOString());
        }
        if (end_date) {
            query = query.lte("start_time", new Date(end_date).toISOString());
        }

        const { data: events, error } = await query;

        if (error) {
            console.error("[Calendar] Fetch error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch calendar schedule"
            });
        }

        return res.status(200).json({
            success: true,
            calendar: events || []
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update an event's schedule directly from Calendar view
export const updateCalendarEventSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { start_time, end_time, calendar_sync } = req.body;

        const updates = {
            updated_at: new Date().toISOString()
        };

        if (start_time) updates.start_time = new Date(start_time).toISOString();
        if (end_time !== undefined) updates.end_time = end_time ? new Date(end_time).toISOString() : null;
        if (typeof calendar_sync === "boolean") updates.calendar_sync = calendar_sync;

        const { data: updatedEvent, error } = await supabase
            .from("events")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error || !updatedEvent) {
            return res.status(404).json({
                success: false,
                message: "Event not found or calendar update failed"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Calendar schedule updated successfully",
            event: updatedEvent
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
