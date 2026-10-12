import { supabase } from "../config/supabase.js";

/**
 * Aggregates analytics across all modules for the admin dashboard.
 */
export const getDashboardAnalytics = async (req, res) => {
    try {
        // Run aggregation queries in parallel
        const [
            eventsResult,
            challengesResult,
            registrationsResult,
            galleryResult,
            adminsResult
        ] = await Promise.allSettled([
            supabase.from("events").select("id, status, calendar_sync"),
            supabase.from("sih_review_challenges").select("id, review_status, web_team_review_status, faculty_review_status"),
            supabase.from("sih_2026_registrations").select("id, branch, review_status"),
            supabase.from("gallery").select("id, event_id"),
            supabase.from("admin_users").select("id, role, is_active")
        ]);

        // 1. Events Analytics
        const eventsData = eventsResult.status === "fulfilled" && eventsResult.value.data ? eventsResult.value.data : [];
        const eventStats = {
            total: eventsData.length,
            upcoming: eventsData.filter((e) => e.status === "upcoming").length,
            ongoing: eventsData.filter((e) => e.status === "ongoing").length,
            completed: eventsData.filter((e) => e.status === "completed").length,
            archived: eventsData.filter((e) => e.status === "archived").length,
            synced_to_calendar: eventsData.filter((e) => e.calendar_sync).length
        };

        // 2. Idea Hub / Challenges Analytics
        const challengesData = challengesResult.status === "fulfilled" && challengesResult.value.data ? challengesResult.value.data : [];
        const ideaHubStats = {
            total_submissions: challengesData.length,
            pending: challengesData.filter((c) => c.review_status === "Pending" || !c.review_status).length,
            under_review: challengesData.filter((c) => c.review_status === "Under Review").length,
            fully_reviewed: challengesData.filter((c) => c.review_status === "Reviewed").length,
            web_team_reviewed: challengesData.filter((c) => c.web_team_review_status === "Reviewed").length,
            faculty_reviewed: challengesData.filter((c) => c.faculty_review_status === "Reviewed").length
        };

        // 3. Registrations Analytics
        const regData = registrationsResult.status === "fulfilled" && registrationsResult.value.data ? registrationsResult.value.data : [];
        const branchCounts = {};
        regData.forEach((r) => {
            const branch = r.branch || "Unknown";
            branchCounts[branch] = (branchCounts[branch] || 0) + 1;
        });

        const participantStats = {
            total_registered: regData.length,
            pending_review: regData.filter((r) => r.review_status === "pending" || !r.review_status).length,
            completed_review: regData.filter((r) => r.review_status === "completed").length,
            by_branch: branchCounts
        };

        // 4. Gallery & Admins Analytics
        const galleryData = galleryResult.status === "fulfilled" && galleryResult.value.data ? galleryResult.value.data : [];
        const adminsData = adminsResult.status === "fulfilled" && adminsResult.value.data ? adminsResult.value.data : [];

        const systemStats = {
            total_gallery_media: galleryData.length,
            event_linked_media: galleryData.filter((g) => g.event_id !== null).length,
            active_admins: adminsData.filter((a) => a.is_active).length,
            total_admins: adminsData.length
        };

        return res.status(200).json({
            success: true,
            analytics: {
                events: eventStats,
                idea_hub: ideaHubStats,
                participants: participantStats,
                system: systemStats,
                generated_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("[Analytics] Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error calculating analytics"
        });
    }
};
