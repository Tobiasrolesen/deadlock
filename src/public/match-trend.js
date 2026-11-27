const hasMatchNumber = value => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));

function getMatchStats(match) {
    if (![match.player_kills, match.player_deaths].every(hasMatchNumber)) return null;

    const kills = Number(match.player_kills);
    const deaths = Number(match.player_deaths);
    return {
        kd: deaths > 0 ? kills / deaths : kills,
        deaths,
    };
}

function getMatchOutcome(match) {
    if (!match || typeof match !== "object") return null;

    if (hasMatchNumber(match.player_match_outcome)) {
        const playerOutcome = Number(match.player_match_outcome);
        if (playerOutcome === 1) return "win";
        if (playerOutcome === 2) return "loss";
        if (playerOutcome !== 0) return null;
    }

    if (!hasMatchNumber(match.match_result) || !hasMatchNumber(match.player_team)) return null;

    const result = Number(match.match_result);
    const playerTeam = Number(match.player_team);
    if (![0, 1].includes(result) || ![0, 1].includes(playerTeam)) return null;
    return result === playerTeam ? "win" : "loss";
}

function formatMatchDuration(value) {
    if (!hasMatchNumber(value) || Number(value) < 0) return "—";

    const totalSeconds = Math.floor(Number(value));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
    if (minutes > 0) return `${minutes}m${seconds > 0 ? ` ${seconds}s` : ""}`;
    return `${seconds}s`;
}

function compareMatchStat(current, previous, higherIsBetter) {
    return {
        current,
        previous,
        state: current === previous ? "same" : (current > previous) === higherIsBetter ? "better" : "worse",
    };
}

function compareHistory(matches) {
    if (!Array.isArray(matches)) return [];

    const sortedMatches = matches
        .filter(match => match && typeof match === "object")
        .slice()
        .sort((first, second) => {
            const firstTime = hasMatchNumber(first.start_time) ? Number(first.start_time) : null;
            const secondTime = hasMatchNumber(second.start_time) ? Number(second.start_time) : null;
            if (firstTime === null) return secondTime === null ? 0 : 1;
            if (secondTime === null) return -1;
            return secondTime - firstTime;
        });

    return sortedMatches.map((match, index) => {
        const previousMatch = sortedMatches[index + 1];
        const matchNumber = sortedMatches.length - index;
        const matchTime = hasMatchNumber(match.start_time) ? Number(match.start_time) : null;
        const previousTime = previousMatch && hasMatchNumber(previousMatch.start_time)
            ? Number(previousMatch.start_time)
            : null;
        const hasPreviousMatch = matchTime !== null && previousTime !== null && matchTime > previousTime;
        const currentStats = getMatchStats(match);

        if (!hasPreviousMatch) {
            return { match, matchNumber, hasPreviousMatch: false, kdRatio: currentStats?.kd ?? null, kd: null, deaths: null };
        }

        const previousStats = getMatchStats(previousMatch);
        if (!currentStats || !previousStats) {
            return { match, matchNumber, hasPreviousMatch: true, kdRatio: currentStats?.kd ?? null, kd: null, deaths: null };
        }

        return {
            match,
            matchNumber,
            hasPreviousMatch: true,
            kdRatio: currentStats.kd,
            kd: compareMatchStat(currentStats.kd, previousStats.kd, true),
            deaths: compareMatchStat(currentStats.deaths, previousStats.deaths, false),
        };
    });
}

globalThis.DeadlockMatchTrends = Object.freeze({
    compareHistory,
    getMatchOutcome,
    formatMatchDuration,
    compareLatest(matches) {
        const latest = compareHistory(matches)[0];
        return latest && latest.kd && latest.deaths ? latest : null;
    },
});