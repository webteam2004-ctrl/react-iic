import { supabase } from "../config/supabase.js";

export const createTeamMember = async (req, res) => {
    try {
        const { name, role, bio, initials, section, image } = req.body;
        if (!name || !role || !bio || !initials || !section || !image) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, role, bio, initials, section, image) are required"
            });
        }

        const { data, error } = await supabase
            .from("team_members")
            .insert([{ name, role, bio, initials, section, image }])
            .select();

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to create team member"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Team member created successfully",
            teamMember: data[0]
        });
    } catch (error) {
        console.error("[Team] Create error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getAllTeamMemeber = async (req, res) => {
    try {
        const { data: teamMembers, error } = await supabase
            .from("team_members")
            .select("*");

        if (error) {
            // Return empty array if table doesn't exist yet rather than failing completely
            return res.status(200).json({
                success: true,
                message: "Team members fetched",
                teamMembers: []
            });
        }

        return res.status(200).json({
            success: true,
            message: "Team members fetched successfully",
            teamMembers: teamMembers || []
        });
    } catch (error) {
        console.error("[Team] Get all error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getTeamMemberById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: teamMember, error } = await supabase
            .from("team_members")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !teamMember) {
            return res.status(404).json({
                success: false,
                message: "Team Member Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Team member fetched successfully",
            teamMember
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from("team_members")
            .update(updates)
            .eq("id", id)
            .select();

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Team Member Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Team member updated successfully",
            teamMember: data[0]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const deleteTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, count } = await supabase
            .from("team_members")
            .delete({ count: "exact" })
            .eq("id", id);

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        if (count === 0) {
            return res.status(404).json({
                success: false,
                message: "Team Member Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Team member deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};