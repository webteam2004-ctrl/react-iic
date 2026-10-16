import { supabase } from "../config/supabase.js";

const VALID_STATUSES = new Set(["new", "in_progress", "resolved"]);

const cleanText = (value) => String(value ?? "").trim();

const validateMessage = (body) => {
    const fullName = cleanText(body.full_name);
    const email = cleanText(body.email).toLowerCase();
    const subject = cleanText(body.subject);
    const message = cleanText(body.message);
    const departmentYear = cleanText(body.department_year);

    if (!fullName || !email || !subject || !message) {
        return { error: "Full name, email, subject, and message are required." };
    }
    if (fullName.length > 120 || subject.length > 180 || message.length > 5000) {
        return { error: "One or more fields exceed the permitted length." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        return { error: "Enter a valid email address." };
    }

    return {
        value: {
            full_name: fullName,
            email,
            department_year: departmentYear || null,
            subject,
            message
        }
    };
};

export const createContactMessage = async (req, res) => {
    const { value, error: validationError } = validateMessage(req.body || {});
    if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
    }

    try {
        const { data, error } = await supabase
            .from("contact_messages")
            .insert([{ ...value, status: "new" }])
            .select("id, created_at")
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: "Your message has been sent successfully.",
            contactMessage: data
        });
    } catch (error) {
        console.error("[Contact] Create error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to send your message right now. Please try again later."
        });
    }
};

export const listContactMessages = async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
        const search = cleanText(req.query.search);
        const status = cleanText(req.query.status);
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from("contact_messages")
            .select("id, full_name, email, department_year, subject, status, created_at, updated_at", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(from, to);

        if (status && VALID_STATUSES.has(status)) query = query.eq("status", status);
        if (search) {
            const escaped = search.replace(/[%(),]/g, "");
            query = query.or(`full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,subject.ilike.%${escaped}%`);
        }

        const { data, error, count } = await query;
        if (error) throw error;

        return res.status(200).json({
            success: true,
            messages: data || [],
            pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) }
        });
    } catch (error) {
        console.error("[Contact] List error:", error);
        return res.status(500).json({ success: false, message: "Failed to load contact messages." });
    }
};

export const getContactMessage = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("contact_messages")
            .select("*")
            .eq("id", req.params.id)
            .maybeSingle();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, message: "Contact message not found." });

        return res.status(200).json({ success: true, message: data });
    } catch (error) {
        console.error("[Contact] Get error:", error);
        return res.status(500).json({ success: false, message: "Failed to load contact message." });
    }
};

export const updateContactMessage = async (req, res) => {
    const updates = {};
    if (req.body.status !== undefined) {
        const status = cleanText(req.body.status);
        if (!VALID_STATUSES.has(status)) {
            return res.status(400).json({ success: false, message: "Invalid contact message status." });
        }
        updates.status = status;
    }
    if (req.body.admin_notes !== undefined) {
        const notes = cleanText(req.body.admin_notes);
        if (notes.length > 5000) {
            return res.status(400).json({ success: false, message: "Admin notes are too long." });
        }
        updates.admin_notes = notes || null;
    }
    if (!Object.keys(updates).length) {
        return res.status(400).json({ success: false, message: "Status or admin notes are required." });
    }

    try {
        const { data, error } = await supabase
            .from("contact_messages")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", req.params.id)
            .select("*")
            .single();

        if (error) throw error;
        return res.status(200).json({ success: true, message: data });
    } catch (error) {
        console.error("[Contact] Update error:", error);
        return res.status(404).json({ success: false, message: "Contact message not found or update failed." });
    }
};

export const deleteContactMessage = async (req, res) => {
    try {
        const { error, count } = await supabase
            .from("contact_messages")
            .delete({ count: "exact" })
            .eq("id", req.params.id);

        if (error) throw error;
        if (count === 0) return res.status(404).json({ success: false, message: "Contact message not found." });

        return res.status(200).json({ success: true, message: "Contact message deleted." });
    } catch (error) {
        console.error("[Contact] Delete error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete contact message." });
    }
};
