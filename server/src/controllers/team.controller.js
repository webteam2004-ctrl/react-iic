
import { supabase } from "../config/supabase.js";
import {
    identifyImage,
    publicImageUrl,
    removeImage,
    saveImage
} from "../services/mediaStorage.service.js";
import {
    getAvailableTeamsVersions,
    getCurrentTeamsVersion,
    normalizeTeamsVersion
} from "../utils/teamVersion.js";

// Map existing frontend fields to the designed database columns.
const buildTeamPayload = (body, imageUrl) => {
    const name = String(body.name || body.full_name || "").trim();

    // Backward-compatible mapping for the current form.
    const panel = String(
        body.panel || body.team || body.role || ""
    ).trim();

    const role = String(
        body.position || body.member_role ||
        (body.panel ? body.role : body.department) || ""
    ).trim();

    const payload = {
        full_name: name,
        panel,
        role,
        name,
        department: body.department || null,
        linkedin_url: body.linkedin_url || null,
        github_url: body.github_url || null,
        display_order: Number.parseInt(
            body.display_order ?? body.order_index,
            10
        ) || 0,
        order_index: Number.parseInt(
            body.order_index ?? body.display_order,
            10
        ) || 0,
        is_active: body.is_active ?? true,
        teams_version: normalizeTeamsVersion(
            body.teams_version || getCurrentTeamsVersion()
        )
    };

    // Keep both existing image columns compatible.
    const suppliedImage =
        imageUrl !== undefined
            ? imageUrl
            : body.image_url ?? body.profile_image;

    if (suppliedImage !== undefined) {
        payload.profile_image = suppliedImage || null;
        payload.image_url = suppliedImage || null;
    }

    return payload;
};

const saveUploadedTeamImage = async (file) => {
    if (!file) return null;

    const signature = identifyImage(file.buffer);

    if (!signature || signature.mime !== file.mimetype) {
        throw new Error(`Invalid image contents for ${file.originalname}`);
    }

    return await saveImage(file.buffer, signature, "team");
};

const getPublicTeamMember = (req, member) => ({
    ...member,
    public_image_url: publicImageUrl(
        req,
        member.image_url || member.profile_image
    )
});

export const createTeamMember = async (req, res) => {
    let storedFile;

    try {
        const payload = buildTeamPayload(req.body);

        if (!payload.full_name || !payload.panel || !payload.role) {
            return res.status(400).json({
                success: false,
                message: "Name, panel, and role are required"
            });
        }

        storedFile = await saveUploadedTeamImage(req.file);

        if (storedFile) {
            payload.image_url = storedFile.relativePath;
            payload.profile_image = storedFile.relativePath;
        }

        const { data, error } = await supabase
            .from("team_members")
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: "Team member created successfully",
            teamMember: getPublicTeamMember(req, data)
        });
    } catch (error) {
        if (storedFile) {
            await removeImage(storedFile.publicUrl, "team").catch(() => {});
        }

        console.error("[Team] Create error:", error);

        return res.status(error.code === "INVALID_TEAMS_VERSION" ? 400 : 500).json({
            success: false,
            message: error.code === "INVALID_TEAMS_VERSION"
                ? error.message
                : "Internal server error"
        });
    }
};

export const getAllTeamMemeber = async (req, res) => {
    try {
        // Fetch all distinct versions present in the DB so we know what's actually published
        const { data: versionRows, error: versionError } = await supabase
            .from("team_members")
            .select("teams_version")
            .not("teams_version", "is", null);

        if (versionError) throw versionError;

        // Build a sorted list of unique version strings (e.g. ["1.0", "2.0"])
        const uniqueVersions = [
            ...new Set((versionRows || []).map((r) => r.teams_version).filter(Boolean))
        ].sort((a, b) => parseFloat(a) - parseFloat(b));

        // Highest version in the DB is the default; fall back to the calendar-based version
        const highestDbVersion =
            uniqueVersions.length > 0
                ? uniqueVersions[uniqueVersions.length - 1]
                : getCurrentTeamsVersion();

        // Use the full static list when no DB data, otherwise only show versions that exist
        const availableVersions =
            uniqueVersions.length > 0 ? uniqueVersions : getAvailableTeamsVersions();

        const requestedVersion = req.query.teams_version
            ? normalizeTeamsVersion(req.query.teams_version)
            : null;

        let query = supabase
            .from("team_members")
            .select("*")
            .order("display_order", { ascending: true });

        // If caller didn't specify a version, default to the highest one
        const effectiveVersion = requestedVersion || highestDbVersion;
        query = query.eq("teams_version", effectiveVersion);

        const { data, error } = await query;

        if (error) throw error;

        const teamMembers = (data || []).map((member) =>
            getPublicTeamMember(req, member)
        );

        return res.status(200).json({
            success: true,
            message: "Team members fetched successfully",
            teamMembers,
            teams: teamMembers,
            currentVersion: highestDbVersion,
            availableVersions
        });
    } catch (error) {
        console.error("[Team] Get all error:", error);

        return res.status(error.code === "INVALID_TEAMS_VERSION" ? 400 : 500).json({
            success: false,
            message: error.code === "INVALID_TEAMS_VERSION"
                ? error.message
                : "Internal server error"
        });
    }
};

export const getTeamMemberById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from("team_members")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Team Member Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Team member fetched successfully",
            teamMember: getPublicTeamMember(req, data)
        });
    } catch (error) {
        console.error("[Team] Get by ID error:", error);

        return res.status(error.code === "INVALID_TEAMS_VERSION" ? 400 : 500).json({
            success: false,
            message: error.code === "INVALID_TEAMS_VERSION"
                ? error.message
                : "Internal server error"
        });
    }
};

export const updateTeamMember = async (req, res) => {
    let storedFile;

    try {
        const { id } = req.params;

        const { data: existing, error: existingError } = await supabase
            .from("team_members")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (existingError) throw existingError;

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Team Member Not Found"
            });
        }

        storedFile = await saveUploadedTeamImage(req.file);

        const updates = buildTeamPayload(
            {
                ...existing,
                ...req.body,
                // Preserve the existing panel/role mapping when fields
                // are omitted from a partial update.
                panel: req.body.panel ?? req.body.team ??
                    (req.body.role === undefined ? existing.panel : undefined),
                role: req.body.position ?? req.body.member_role ??
                    (req.body.panel !== undefined
                        ? req.body.role
                        : req.body.department === undefined
                            ? existing.role
                            : undefined),
                name: req.body.name ?? req.body.full_name ?? existing.full_name
            }
        );

        if (storedFile) {
            updates.image_url = storedFile.relativePath;
            updates.profile_image = storedFile.relativePath;
        } else {
            // Do not erase an existing image during a text-only update.
            delete updates.image_url;
            delete updates.profile_image;
        }

        const { data, error } = await supabase
            .from("team_members")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        // Remove the previous image only after the database update succeeds.
        if (storedFile) {
            const oldImage = existing.image_url || existing.profile_image;

            if (oldImage?.includes("/storage/v1/object/public/")) {
                await removeImage(oldImage, "team").catch(() => {});
            }
        }

        return res.status(200).json({
            success: true,
            message: "Team member updated successfully",
            teamMember: getPublicTeamMember(req, data)
        });
    } catch (error) {
        if (storedFile) {
            await removeImage(storedFile.publicUrl, "team").catch(() => {});
        }

        console.error("[Team] Update error:", error);

        return res.status(error.code === "INVALID_TEAMS_VERSION" ? 400 : 500).json({
            success: false,
            message: error.code === "INVALID_TEAMS_VERSION"
                ? error.message
                : "Internal server error"
        });
    }
};

export const deleteTeamMember = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: existing, error: fetchError } = await supabase
            .from("team_members")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Team Member Not Found"
            });
        }

        const { error } = await supabase
            .from("team_members")
            .delete()
            .eq("id", id);

        if (error) throw error;

        const oldImage = existing.image_url || existing.profile_image;

        if (oldImage?.includes("/storage/v1/object/public/")) {
            await removeImage(oldImage, "team").catch(() => {});
        }

        return res.status(200).json({
            success: true,
            message: "Team member deleted successfully"
        });
    } catch (error) {
        console.error("[Team] Delete error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
