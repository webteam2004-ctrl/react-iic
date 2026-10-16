// The first published team cycle began on June 1, 2026.
// Keep this constant aligned with client/src/utils/teamVersion.js.
export const INITIAL_TEAM_CYCLE_YEAR = 2026;
export const MAX_TEAM_VERSION = 9;

const CYCLE_START_MONTH = 5;
const CYCLE_START_DAY = 1;

export const getTeamCycleYear = (date = new Date()) => {
    const year = date.getUTCFullYear();
    const hasStarted = date.getUTCMonth() > CYCLE_START_MONTH ||
        (date.getUTCMonth() === CYCLE_START_MONTH &&
            date.getUTCDate() >= CYCLE_START_DAY);

    return hasStarted ? year : year - 1;
};

export const getCurrentTeamsVersion = (date = new Date()) => {
    const cycleNumber = getTeamCycleYear(date) - INITIAL_TEAM_CYCLE_YEAR + 1;
    return `${Math.min(MAX_TEAM_VERSION, Math.max(1, cycleNumber))}.0`;
};

export const getAvailableTeamsVersions = (date = new Date()) => {
    return Array.from({ length: MAX_TEAM_VERSION }, (_, index) => `${index + 1}.0`);
};

export const normalizeTeamsVersion = (value) => {
    const version = String(value ?? "").trim();
    if (!/^[1-9]\.0$/.test(version) || Number.parseInt(version, 10) > MAX_TEAM_VERSION) {
        const error = new Error("Teams version must be one of 1.0 through 9.0");
        error.code = "INVALID_TEAMS_VERSION";
        throw error;
    }
    return version;
};
