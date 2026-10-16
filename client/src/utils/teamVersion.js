// Keep this initial cycle aligned with server/src/utils/teamVersion.js.
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
