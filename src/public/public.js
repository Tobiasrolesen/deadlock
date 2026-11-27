const searchForm = document.querySelector("#player-search");
const searchInput = document.querySelector("#player-query");
const searchButton = searchForm.querySelector("button[type='submit']");
const statusMessage = document.querySelector("#status-message");
const profileContent = document.querySelector("#profile-content");
const favoriteButton = document.querySelector("#favorite-button");
const playerAvatar = document.querySelector("#player-avatar");
const avatarFallback = document.querySelector("#avatar-fallback");
const patchnoteList = document.querySelector("#patchnote-list");
const patchnotesStatus = document.querySelector("#patchnotes-status");
const heroScoreboard = document.querySelector("#hero-scoreboard");
const heroScoreboardStatus = document.querySelector("#hero-scoreboard-status");
const matchHistoryButton = document.querySelector("#match-history-button");
const matchHistoryDialog = document.querySelector("#match-history-dialog");
const matchHistoryClose = document.querySelector("#match-history-close");
const matchHistoryStatus = document.querySelector("#match-history-status");
const matchHistoryList = document.querySelector("#match-history-list");
const matchHeroDetailsCache = new Map();
let matchTrendRenderVersion = 0;
let matchHistoryRenderVersion = 0;

const matchHistoryButton = document.querySelector("#match-history-button");
const matchHistoryDialog = document.querySelector("#match-history-dialog");
const matchHistoryClose = document.querySelector("#match-history-close");
const matchHistoryStatus = document.querySelector("#match-history-status");
const matchHistoryList = document.querySelector("#match-history-list");
const heroDetailsDialog = document.querySelector("#hero-details-dialog");
const heroDetailsClose = document.querySelector("#hero-details-close");
const heroDetailsTitle = document.querySelector("#hero-details-title");
const heroDetailsStatus = document.querySelector("#hero-details-status");
const heroDetailsContent = document.querySelector("#hero-details-content");
const heroMatchesButton = document.querySelector("#hero-matches-button");
const heroDetailsImage = document.querySelector("#hero-details-image");
const heroDetailsName = document.querySelector("#hero-details-name");
const heroDetailsDescription = document.querySelector("#hero-details-description");
const heroDetailsDescriptionShort = document.querySelector("#hero-details-description-short");
const heroMatchesDialog = document.getElementById("hero-matches-dialog");
const heroMatchesClose = document.getElementById("hero-matches-close");
const heroMatchesTitle = document.getElementById("hero-matches-title");
const heroMatchesStatus = document.getElementById("hero-matches-status");
const heroMatchesList = document.getElementById("hero-matches-list");

const playerHeroList = document.querySelector("#player-hero-list");
const heroListCount = document.querySelector("#hero-record-count");

let selectedHeroId = null;
let currentPlayerId = null;
let currentPlayerName = "";
const matchHeroDetailsCache = new Map();
let matchHistoryRenderVersion = 0;
let playedHeroesRenderVersion = 0;

const formatNumber = value => new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
}).format(value);

const toNumber = value => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

function showStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = `status-message${type ? ` is-${type}` : ""}`;
}

function setProgress(selector, value, max = 100) {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    const bar = document.querySelector(selector);
    bar.style.width = `${percentage}%`;

    const progress = bar.closest("[role='progressbar']");
    if (progress) {
        progress.setAttribute("aria-valuenow", String(Math.round(value)));
    }
}

function updateFavoriteButton(accountId) {
    const isFavorite = localStorage.getItem(`deadlock-favorite-${accountId}`) === "true";
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    favoriteButton.innerHTML = `<span aria-hidden="true">${isFavorite ? "★" : "☆"}</span> ${isFavorite ? "Added to favorites" : "Add to favorites"}`;
}

function resetStats() {
    [
        "#win-rate", "#kda-ratio", "#average-kda", "#matches-played", "#damage-per-minute",
        "#total-wins", "#total-kills", "#total-deaths", "#total-assists",
        "#hero-count", "#hero-record-count",
    ].forEach(selector => {
        document.querySelector(selector).textContent = "—";
    });
    ["#win-rate-bar", "#damage-bar"].forEach(selector => setProgress(selector, 0));
}

function renderPlayer(player) {
    document.querySelector("#page-title").textContent = player.personaname || "Unknown player";
    document.querySelector("#steam-id").textContent = `Steam ID: ${player.account_id}`;
    document.querySelector("#profile-updated").textContent = "Profile loaded just now";
    avatarFallback.textContent = (player.personaname || "DL").slice(0, 2).toUpperCase();

    playedHeroesRenderVersion++;
    playerHeroList.replaceChildren();

    const loadingMessage = document.createElement("p");
    loadingMessage.textContent = "Loading player's heroes...";
    playerHeroList.append(loadingMessage);

    heroListCount.textContent = "—";

    try {
        const avatarUrl = new URL(player.avatar);
        if (avatarUrl.protocol === "https:" || avatarUrl.protocol === "http:") {
            playerAvatar.src = avatarUrl.href;
            playerAvatar.hidden = false;
            avatarFallback.hidden = true;
            playerAvatar.onerror = () => {
                playerAvatar.hidden = true;
                avatarFallback.hidden = false;
            };
        } else {
            playerAvatar.hidden = true;
            avatarFallback.hidden = false;
        }
    } catch {
        playerAvatar.hidden = true;
        avatarFallback.hidden = false;
    }

    favoriteButton.dataset.accountId = player.account_id;
    favoriteButton.hidden = false;
    updateFavoriteButton(player.account_id);
    resetStats();
    showTrendMessage("Loading recent match history…");
    matchHistoryButton.disabled = true;
    matchHistoryButton.textContent = "Loading match history…";
    matchHistoryStatus.textContent = "Loading this player's match history…";
    matchHistoryList.replaceChildren();
    profileContent.hidden = false;
    profileContent.scrollIntoView({ behavior: "smooth", block: "start" });
}

function weightedAverage(records, field) {
    const availableRecords = records.filter(record => Number.isFinite(Number(record[field])));
    const totalWeight = availableRecords.reduce((sum, record) => sum + toNumber(record.matches_played), 0);

    if (availableRecords.length === 0) return null;
    if (totalWeight === 0) {
        return availableRecords.reduce((sum, record) => sum + toNumber(record[field]), 0) / availableRecords.length;
    }

    return availableRecords.reduce((sum, record) => {
        return sum + toNumber(record[field]) * toNumber(record.matches_played);
    }, 0) / totalWeight;
}

function renderStats(records) {
    const totals = records.reduce((result, record) => {
        result.matches += toNumber(record.matches_played);
        result.wins += toNumber(record.wins);
        result.kills += toNumber(record.kills);
        result.deaths += toNumber(record.deaths);
        result.assists += toNumber(record.assists);
        return result;
    }, { matches: 0, wins: 0, kills: 0, deaths: 0, assists: 0 });

    const winRate = totals.matches > 0 ? (totals.wins / totals.matches) * 100 : 0;
    const kdaRatio = totals.matches > 0
        ? formatNumber(totals.deaths > 0 ? (totals.kills + totals.assists) / totals.deaths : totals.kills + totals.assists)
        : "—";
    const averageKda = totals.matches > 0
        ? [totals.kills, totals.deaths, totals.assists].map(value => formatNumber(value / totals.matches)).join(" / ")
        : "—";
    const damagePerMinute = weightedAverage(records, "damage_per_min");

    document.querySelector("#win-rate").textContent = `${formatNumber(winRate)}%`;
    document.querySelector("#kda-ratio").textContent = kdaRatio;
    document.querySelector("#average-kda").textContent = averageKda;
    document.querySelector("#matches-played").textContent = formatNumber(totals.matches);
    document.querySelector("#damage-per-minute").textContent = damagePerMinute === null ? "—" : formatNumber(damagePerMinute);
    document.querySelector("#total-wins").textContent = formatNumber(totals.wins);
    document.querySelector("#total-kills").textContent = formatNumber(totals.kills);
    document.querySelector("#total-deaths").textContent = formatNumber(totals.deaths);
    document.querySelector("#total-assists").textContent = formatNumber(totals.assists);
    document.querySelector("#hero-count").textContent = `${records.length} tracked ${records.length === 1 ? "hero" : "heroes"}`;
    document.querySelector("#hero-record-count").textContent = formatNumber(records.length);

    setProgress("#win-rate-bar", winRate);
    setProgress("#damage-bar", damagePerMinute || 0, Math.max(damagePerMinute || 0, 1000));
}

async function fetchJson(url) {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "The request could not be completed.");
    }

    return data;
}

function showTrendMessage(message) {
    matchTrendRenderVersion += 1;
    ["#trend-kd", "#trend-deaths"].forEach(selector => {
        const element = document.querySelector(selector);
        element.className = "trend-indicator";
        element.textContent = "—";
    });
    [
        "#trend-kd-current", "#trend-kd-previous", "#trend-kda", "#trend-kda-previous",
        "#trend-deaths-current", "#trend-deaths-previous",
    ].forEach(selector => {
        document.querySelector(selector).textContent = "—";
    });
    document.querySelector("#trend-result").className = "trend-result-badge";
    document.querySelector("#trend-result").textContent = "Result unavailable";
    document.querySelector("#trend-hero").textContent = "Latest hero unavailable.";
    document.querySelector("#trend-status").textContent = message;
}

function renderTrend(element, trend, metricName, currentElement, previousElement) {
    const labels = {
        better: "Better",
        worse: "Worse",
        same: "Unchanged",
    };

    const arrows = {
        better: "↑",
        worse: "↓",
        same: "→",
    };

    element.className = `trend-indicator is-${trend.state}`;
    element.textContent = `${arrows[trend.state]} ${labels[trend.state]}`;
    currentElement.textContent = formatNumber(trend.current);
    previousElement.textContent = formatNumber(trend.previous);
    element.setAttribute("aria-label", `${metricName}: ${labels[trend.state]}, latest match ${formatNumber(trend.current)} compared with previous match ${formatNumber(trend.previous)}`);
}

function renderMatchTrends(matches) {
    const comparison = window.DeadlockMatchTrends.compareLatest(matches);
    if (!comparison) {
        showTrendMessage("Need two matches with timestamps and stats");
        return;
    }

    const renderVersion = ++matchTrendRenderVersion;
    document.querySelector("#trend-status").textContent = "";
    renderTrend(
        document.querySelector("#trend-kd"),
        comparison.kd,
        "K/D ratio",
        document.querySelector("#trend-kd-current"),
        document.querySelector("#trend-kd-previous"),
    );
    renderTrend(
        document.querySelector("#trend-deaths"),
        comparison.deaths,
        "Deaths",
        document.querySelector("#trend-deaths-current"),
        document.querySelector("#trend-deaths-previous"),
    );
    document.querySelector("#trend-kda").textContent = formatKda(comparison.match);
    document.querySelector("#trend-kda-previous").textContent = formatKda(comparison.previousMatch);

    const result = document.querySelector("#trend-result");
    const outcome = window.DeadlockMatchTrends.getMatchOutcome(comparison.match);
    result.className = `trend-result-badge${outcome ? ` is-${outcome}` : ""}`;
    result.textContent = outcome === "win" ? "Victory" : outcome === "loss" ? "Defeat" : "Result unavailable";

    const hero = document.querySelector("#trend-hero");
    const heroId = comparison.match.hero_id;
    hero.textContent = heroId !== null && heroId !== undefined && heroId !== ""
        ? `Hero ${formatMatchValue(heroId)}`
        : "Hero unavailable.";
    if (heroId !== null && heroId !== undefined && heroId !== "") {
        fetchMatchHeroDetails(heroId).then(details => {
            if (renderVersion !== matchTrendRenderVersion || !details.name) return;
            hero.textContent = details.name;
        });
    }
}

function formatMatchValue(value) {
    return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value))
        ? formatNumber(Number(value))
        : "—";
}

function formatKda(match) {
    if (!match) return "—";

    const values = [match.player_kills, match.player_deaths, match.player_assists].map(formatMatchValue);
    return values.every(value => value === "—") ? "—" : values.join(" / ");
}

function createMatchStatCard(label, value, note, state = null) {
    const card = document.createElement("div");
    card.className = `match-history-stat-card${state ? ` is-${state}` : ""}`;

    const title = document.createElement("span");
    title.className = "match-history-stat-label";
    title.textContent = label;

    const valueRow = document.createElement("div");
    valueRow.className = "match-history-stat-value-row";
    const statValue = document.createElement("span");
    statValue.className = "match-history-stat-value";
    statValue.textContent = value;
    valueRow.append(statValue);

    if (state) {
        const arrows = { better: "↑", worse: "↓", same: "→" };
        const arrow = document.createElement("span");
        arrow.className = "match-history-stat-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = arrows[state];
        valueRow.append(arrow);
    }

    const description = document.createElement("span");
    description.className = `match-history-stat-note${state ? ` is-${state}` : ""}`;
    description.textContent = note;

    card.append(title, valueRow, description);
    return card;
}

function fetchMatchHeroDetails(heroId) {
    const key = String(heroId);
    if (!matchHeroDetailsCache.has(key)) {
        const request = fetchJson(`/api/deadlock/scoreboards/heroes/${encodeURIComponent(key)}`)
            .then(hero => ({
                name: typeof hero?.name === "string" ? hero.name : null,
                image: typeof hero?.image === "string" ? hero.image : null,
            }))
            .catch(() => {
                matchHeroDetailsCache.delete(key);
                return { name: null, image: null };
            });
        matchHeroDetailsCache.set(key, request);
    }
    return matchHeroDetailsCache.get(key);
}

function createMatchHistoryItem(entry) {
    const { match } = entry;
    const item = document.createElement("li");
    item.className = "match-history-item";

    const heading = document.createElement("div");
    heading.className = "match-history-heading";
    const titleGroup = document.createElement("div");
    titleGroup.className = "match-history-title";
    const title = document.createElement("h3");
    title.textContent = `Match #${formatMatchValue(entry.matchNumber)}`;
    titleGroup.append(title);

    const details = document.createElement("p");
    details.className = "match-history-subtitle";
    const heroImage = document.createElement("img");
    heroImage.className = "match-history-hero-image";
    heroImage.alt = "";
    heroImage.loading = "lazy";
    heroImage.hidden = true;
    const heroName = document.createElement("span");
    heroName.className = "match-history-hero";
    heroName.textContent = formatMatchValue(match.hero_id);
    const heroLevel = document.createElement("span");
    heroLevel.className = "match-history-hero-level";
    heroLevel.textContent = `Level ${formatMatchValue(match.hero_level)}`;
    const heroInfo = document.createElement("span");
    heroInfo.className = "match-history-hero-info";
    heroInfo.append(heroName, heroLevel);
    if (match.hero_id !== null && match.hero_id !== undefined && match.hero_id !== "") {
        heroName.dataset.heroId = String(match.hero_id);
        heroImage.dataset.heroId = String(match.hero_id);
    }
    details.append(heroImage, heroInfo);

    const matchMeta = document.createElement("div");
    matchMeta.className = "match-history-meta";
    const outcome = window.DeadlockMatchTrends.getMatchOutcome(match);
    if (outcome) {
        const result = document.createElement("span");
        result.className = `match-result-badge is-${outcome}`;
        result.textContent = { win: "Victory", loss: "Defeat" }[outcome];
        matchMeta.append(result);
    }
    const playedAt = document.createElement("time");
    const startTime = Number(match.start_time);
    const playedDate = Number.isFinite(startTime)
        ? new Date(startTime < 1e12 ? startTime * 1000 : startTime)
        : null;
    if (playedDate && Number.isFinite(playedDate.getTime())) {
        playedAt.dateTime = playedDate.toISOString();
        playedAt.textContent = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(playedDate);
    } else {
        playedAt.textContent = "Date unavailable";
    }
    matchMeta.append(playedAt);
    titleGroup.append(details);
    heading.append(titleGroup, matchMeta);

    const trendNotes = { better: "Better than previous", worse: "Worse than previous", same: "Same as previous" };
    const kdNote = entry.kd
        ? trendNotes[entry.kd.state]
        : entry.hasPreviousMatch ? "Trend unavailable" : "No previous match";
    const stats = document.createElement("div");
    stats.className = "match-history-stat-grid";
    stats.append(
        createMatchStatCard("K/D ratio", formatMatchValue(entry.kdRatio), kdNote, entry.kd?.state ?? null),
        createMatchStatCard("K/D/A", `${formatMatchValue(match.player_kills)} / ${formatMatchValue(match.player_deaths)} / ${formatMatchValue(match.player_assists)}`, "Kills / Deaths / Assists"),
        createMatchStatCard("Game duration", window.DeadlockMatchTrends.formatMatchDuration(match.match_duration_s), "Total playtime")
    );

    item.append(heading, stats);
    return item;
}

function renderMatchHistory(matches) {
    const history = window.DeadlockMatchTrends.compareHistory(matches);
    const renderVersion = ++matchHistoryRenderVersion;
    matchHistoryList.replaceChildren(...history.map(createMatchHistoryItem));
    matchHistoryStatus.textContent = history.length
        ? `Showing ${history.length} matches, newest first. Each arrow compares the match with the one played before it.`
        : "No matches are available for this player.";
    matchHistoryButton.textContent = `View match history (${history.length})`;
    matchHistoryButton.disabled = false;

    const heroIds = [...new Set(history
        .map(entry => entry.match.hero_id)
        .filter(heroId => heroId !== null && heroId !== undefined && heroId !== ""))];
    Promise.all(heroIds.map(async heroId => [String(heroId), await fetchMatchHeroDetails(heroId)]))
        .then(heroDetails => {
            if (renderVersion !== matchHistoryRenderVersion) return;
            const detailsById = new Map(heroDetails);
            matchHistoryList.querySelectorAll(".match-history-hero[data-hero-id]").forEach(element => {
                const name = detailsById.get(element.dataset.heroId)?.name;
                if (name) element.textContent = name;
            });
            matchHistoryList.querySelectorAll(".match-history-hero-image[data-hero-id]").forEach(element => {
                const hero = detailsById.get(element.dataset.heroId);
                if (!hero?.image) return;

                try {
                    const imageUrl = new URL(hero.image);
                    if (imageUrl.protocol !== "https:") return;
                    element.src = imageUrl.href;
                    element.alt = hero.name ? `${hero.name} portrait` : "Hero portrait";
                    element.hidden = false;
                    element.onerror = () => element.remove();
                } catch {
                    // Keep the hero name visible if the API did not provide a valid image URL.
                }
            });
        });
}



function getPatchnoteSummary(content) {
    if (typeof content !== "string") return "Read the full patch notes for details.";

    const parsedContent = new DOMParser().parseFromString(content, "text/html");
    return parsedContent.body.textContent.replace(/\s+/g, " ").trim().slice(0, 180)
        || "Read the full patch notes for details.";
}

function createPatchnoteCard(patchnote) {
    const card = document.createElement("article");
    card.className = "update-card";

    const meta = document.createElement("div");
    meta.className = "update-meta";
    const label = document.createElement("span");
    label.textContent = "PATCH NOTE";
    const date = document.createElement("time");
    const publishedAt = new Date(patchnote.pub_date);
    if (Number.isFinite(publishedAt.getTime())) {
        date.dateTime = publishedAt.toISOString();
        date.textContent = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(publishedAt);
    } else {
        date.textContent = "Date unavailable";
    }
    meta.append(label, date);

    const title = document.createElement("h3");
    title.textContent = patchnote.title || "Deadlock update";
    const summary = document.createElement("p");
    summary.textContent = getPatchnoteSummary(patchnote.content);
    card.append(meta, title, summary);

    try {
        const linkUrl = new URL(patchnote.link);
        if (linkUrl.protocol === "https:" || linkUrl.protocol === "http:") {
            const link = document.createElement("a");
            link.href = linkUrl.href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Read patch notes ↗";
            card.append(link);
        }
    } catch {
        // Do not render a link if the API did not provide a valid URL.
    }

    return card;
}

function createPopularHeroCard(entry, hero, index) {
    const card = document.createElement("article");
    card.className = "popular-hero-card";

    const artwork = document.createElement("div");
    artwork.className = "popular-hero-artwork";
    if (hero.image) {
        try {
            const imageUrl = new URL(hero.image);
            if (imageUrl.protocol === "https:") {
                const image = document.createElement("img");
                image.src = imageUrl.href;
                image.alt = `${hero.name} artwork`;
                image.loading = "lazy";
                image.onerror = () => image.remove();
                artwork.append(image);
            }
        } catch {
            // Keep the artwork placeholder if the API did not provide a valid URL.
        }
    }

    const rank = Number(entry.rank) > 0 ? Number(entry.rank) : index + 1;
    const label = document.createElement("p");
    label.className = "popular-hero-rank";
    label.textContent = rank === 1 ? "MOST PLAYED" : `POPULAR PICK · #${rank}`;

    const name = document.createElement("h3");
    name.className = "popular-hero-name";
    name.textContent = hero.name || `Hero ${entry.hero_id}`;

    const role = document.createElement("p");
    role.className = "popular-hero-role";
    role.textContent = hero.role || "Hero details are unavailable.";

    const matches = document.createElement("p");
    matches.className = "popular-hero-matches";
    const matchCount = new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(toNumber(entry.matches));
    matches.textContent = `${matchCount} matches`;

    const details = document.createElement("div");
    details.className = "popular-hero-details";
    details.append(label, name, role, matches);

    const tags = document.createElement("div");
    tags.className = "popular-hero-tags";
    (Array.isArray(hero.tags) ? hero.tags : []).slice(0, 3).forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.textContent = tag;
        tags.append(tagElement);
    });

    card.append(artwork, details, tags);
    return card;
}

async function loadHeroScoreboard() {
    try {
        const scoreboard = await fetchJson("/api/deadlock/scoreboards/heroes");
        const topHeroes = Array.isArray(scoreboard) ? scoreboard.slice(0, 3) : [];

        if (topHeroes.length === 0) {
            heroScoreboardStatus.textContent = "No global hero stats are available right now.";
            return;
        }

        const cards = await Promise.all(topHeroes.map(async (entry, index) => {
            try {
                const hero = await fetchJson(`/api/deadlock/scoreboards/heroes/${encodeURIComponent(entry.hero_id)}`);
                return createPopularHeroCard(entry, hero, index);
            } catch {
                return createPopularHeroCard(entry, { name: `Hero ${entry.hero_id}` }, index);
            }
        }));

        heroScoreboard.replaceChildren(...cards);
        heroScoreboardStatus.textContent = "Top heroes by matches in normal games. Popularity does not indicate win rate.";
    } catch {
        heroScoreboardStatus.textContent = "Global hero stats are temporarily unavailable.";
    }
}

async function loadPatchnotes() {
    try {
        const patchnotes = await fetchJson("/api/deadlock/patchnotes");
        const latestPatchnotes = Array.isArray(patchnotes) ? patchnotes.slice(0, 3) : [];
        patchnoteList.replaceChildren(...latestPatchnotes.map(createPatchnoteCard));
        patchnotesStatus.textContent = latestPatchnotes.length
            ? "Latest updates from the Deadlock API."
            : "No patch notes are available right now.";
    } catch {
        patchnotesStatus.textContent = "Patch notes are temporarily unavailable. Player search is still available.";
    }
}

async function loadPlayedHeroes(records) {
    const renderVersion = ++playedHeroesRenderVersion;

    playerHeroList.replaceChildren();
    heroListCount.textContent = "Loading...";

    if (!Array.isArray(records) || records.length === 0) {
        heroListCount.textContent = "0 heroes";
        playerHeroList.textContent = "No played heroes found.";
        return;
    }

    // Fjern eventuelle records uden et gyldigt hero ID.
    const heroes = records.filter(hero =>
        hero.hero_id !== null &&
        hero.hero_id !== undefined &&
        hero.hero_id !== ""
    );

    if (heroes.length === 0) {
        heroListCount.textContent = "0 heroes";
        playerHeroList.textContent = "No played heroes found.";
        return;
    }

    heroListCount.textContent = `${heroes.length} heroes`;

    // Vis en midlertidig besked, mens hero-data hentes.
    playerHeroList.textContent = "Loading heroes...";

    try {
        const heroCards = await Promise.all(
            heroes.map(async record => {
                const details = await fetchMatchHeroDetails(record.hero_id);

                const card = document.createElement("article");
                card.className = "played-hero-card";
                card.style.cursor = "pointer";

                card.addEventListener("click", () => {
                    openHeroDetails(record.hero_id, details);
                });

                // Hero image
                const image = document.createElement("img");
                image.className = "played-hero-image";
                image.alt = details.name
                    ? `${details.name} portrait`
                    : "Hero portrait";
                image.loading = "lazy";
                image.hidden = true;

                if (details.image) {
                    try {
                        const imageUrl = new URL(details.image);

                        if (imageUrl.protocol === "https:" ||
                            imageUrl.protocol === "http:") {
                            image.src = imageUrl.href;
                            image.hidden = false;
                            image.onerror = () => image.remove();
                        }
                    } catch {
                        // Hero name and match count remain visible.
                    }
                }

                // Hero name
                const name = document.createElement("h3");
                name.className = "played-hero-name";
                name.textContent =
                    details.name || `Hero ${record.hero_id}`;

                // Matches played
                const matches = document.createElement("p");
                matches.className = "played-hero-matches";
                matches.textContent =
                    `${formatNumber(record.matches_played)} matches`;

                card.append(image, name, matches);

                return card;
            })
        );

        // Undgå at en gammel søgning overskriver en nyere.
        if (renderVersion !== playedHeroesRenderVersion) return;

        playerHeroList.replaceChildren(...heroCards);

    } catch (error) {
        console.error("Could not load played heroes:", error);

        if (renderVersion !== playedHeroesRenderVersion) return;

        heroListCount.textContent = "Unavailable";
        playerHeroList.textContent = "Could not load this player's heroes.";
    }
}

async function openHeroDetails(heroId, details) {
    selectedHeroId = heroId;

    heroDetailsTitle.textContent = `${currentPlayerName}'s Hero Stats`;

    heroDetailsName.textContent = details.name || `Hero ${heroId}`;
    heroDetailsImage.src = details.image || "";
    heroDetailsImage.alt = details.name || "Hero";

    heroDetailsStatus.textContent = "Loading hero stats...";
    heroDetailsContent.replaceChildren();
    heroMatchesButton.disabled = true;

    heroDetailsDialog.showModal();

    try {
        const stats = await fetchJson(
            `/api/user/${encodeURIComponent(currentPlayerId)}/herolist/${encodeURIComponent(heroId)}`
        );

        const statLabels = {
            matches_played: "Matches played",
            wins: "Wins",
            kills: "Kills",
            deaths: "Deaths",
            assists: "Assists",
            accuracy: "Accuracy"
        };

        const winRate = stats.matches_played > 0
            ? (stats.wins / stats.matches_played * 100).toFixed(1) + "%"
            : "0%";

        const accuracy = (Number(stats.accuracy) * 100).toFixed(1) + "%";

        const displayStats = {
            matches_played: stats.matches_played,
            win_rate: winRate,
            wins: stats.wins,
            kills: stats.kills,
            deaths: stats.deaths,
            assists: stats.assists,
            accuracy: accuracy,
        };

        const displayLabels = {
            ...statLabels,
            win_rate: "Win rate"
        };

        // Kort beskrivelse under heltens navn
        heroDetailsDescriptionShort.textContent =
            formatHeroDescription(stats.hero_details.description?.role) || "Hero role is not available yet";

        // Uddybende beskrivelse
        heroDetailsDescription.textContent = [
            stats.hero_details.description?.lore,
            stats.hero_details.description?.role,
            stats.hero_details.description?.playstyle
        ] .filter(Boolean)
            .map(formatHeroDescription)
            .join("\n ----- \n") || "Hero description is not available yet.";

        Object.entries(displayStats).forEach(([key, value]) => {
            if (value === undefined || value === null) return;

            const card = document.createElement("article");
            card.className = "hero-stat-card";

            const label = document.createElement("p");
            label.className = "hero-stat-label";
            label.textContent = displayLabels[key] || key;

            const statValue = document.createElement("p");
            statValue.className = "hero-stat-value";
            statValue.textContent = value;

            card.append(label, statValue);
            heroDetailsContent.append(card);
        });

        heroDetailsStatus.textContent = "";
        heroMatchesButton.disabled = false;

    } catch (error) {
        console.error(error);
        heroDetailsStatus.textContent = "Could not load hero stats.";
    }
}
function formatHeroDescription(text) {
    return (text || "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .trim();
}


loadHeroScoreboard();
loadPatchnotes();

searchForm.addEventListener("submit", async event => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    document.querySelector("#page-title").textContent = "Find a player profile";
    document.querySelector("#steam-id").textContent = "Search by player name or Steam ID to get started.";
    document.querySelector("#profile-updated").textContent = "Powered by Deadlock API data";
    playerAvatar.hidden = true;
    avatarFallback.hidden = false;
    avatarFallback.textContent = "DL";
    favoriteButton.hidden = true;
    profileContent.hidden = true;

    const isSteamId = /^\d+$/.test(query);
    const playerUrl = isSteamId
        ? `/api/user/${encodeURIComponent(query)}`
        : `/api/user/search/${encodeURIComponent(query)}`;

    searchButton.disabled = true;
    showStatus("Searching for player...");
    let playerLoaded = false;

    try {
        const player = await fetchJson(playerUrl);
        currentPlayerId = player.account_id;
        currentPlayerName = player.personaname;
        renderPlayer(player);
        playerLoaded = true;

        const records = await fetchJson(`/api/user/${encodeURIComponent(player.account_id)}/hero-stats`);
        renderStats(Array.isArray(records) ? records : []);

        loadPlayedHeroes(Array.isArray(records) ? records : []);
        try {
            const matches = await fetchJson(`/api/user/${encodeURIComponent(player.account_id)}/matches`);
            renderMatchTrends(matches);
            renderMatchHistory(matches);
        } catch {
            showTrendMessage("Match history is unavailable");
            matchHistoryButton.textContent = "Match history unavailable";
            matchHistoryStatus.textContent = "Match history could not be loaded. Please try searching again later.";
        }
        showStatus("Player stats loaded successfully.", "success");
    } catch (error) {
        const message = error.message === "User Not Found"
            ? "No player was found. Check the name or Steam ID and try again."
            : playerLoaded && error.message === "No stats were found"
                ? "Player found, but no hero statistics are available yet."
                : error.message;
        showStatus(message, "error");
    } finally {
        searchButton.disabled = false;
    }
});

favoriteButton.addEventListener("click", () => {
    const accountId = favoriteButton.dataset.accountId;
    if (!accountId) return;

    const isFavorite = favoriteButton.getAttribute("aria-pressed") === "true";
    localStorage.setItem(`deadlock-favorite-${accountId}`, String(!isFavorite));
    updateFavoriteButton(accountId);
});

matchHistoryButton.addEventListener("click", () => {
    if (!matchHistoryButton.disabled) matchHistoryDialog.showModal();
});

matchHistoryClose.addEventListener("click", () => matchHistoryDialog.close());

matchHistoryDialog.addEventListener("click", event => {
    if (event.target === matchHistoryDialog) matchHistoryDialog.close();
});

heroMatchesButton.addEventListener("click", async () => {
    if (!selectedHeroId || !currentPlayerId) return;

    heroMatchesButton.disabled = true;

    // Åbn den separate match-modal
    heroMatchesDialog.showModal();

    heroMatchesTitle.textContent =
        `${heroDetailsName.textContent} - Match History`;

    heroMatchesStatus.textContent = "Loading hero matches...";
    heroMatchesList.replaceChildren();

    try {
        const matches = await fetchJson(
            `/api/user/${encodeURIComponent(currentPlayerId)}/herolist/${encodeURIComponent(selectedHeroId)}/matches`
        );

        if (!Array.isArray(matches)) {
            throw new Error("Unexpected hero matches response.");
        }

        // Brug samme sammenligningsfunktion som almindelig match history
        const history = window.DeadlockMatchTrends.compareHistory(matches);

        heroMatchesList.replaceChildren(
            ...history.map(createMatchHistoryItem)
        );

        heroMatchesStatus.textContent = history.length
            ? `Showing ${history.length} matches with this hero, newest first.`
            : "No matches found for this hero.";

        // Hent navne og billeder til heltene i kampene
        const heroIds = [...new Set(
            history
                .map(entry => entry.match.hero_id)
                .filter(id => id !== null && id !== undefined && id !== "")
        )];

        const heroDetails = await Promise.all(
            heroIds.map(async id => [
                String(id),
                await fetchMatchHeroDetails(id)
            ])
        );

        const detailsById = new Map(heroDetails);

        // Opdater heltenes navne
        heroMatchesList
            .querySelectorAll(".match-history-hero[data-hero-id]")
            .forEach(element => {
                const name = detailsById.get(element.dataset.heroId)?.name;

                if (name) {
                    element.textContent = name;
                }
            });

        // Opdater heltenes billeder
        heroMatchesList
            .querySelectorAll(".match-history-hero-image[data-hero-id]")
            .forEach(element => {
                const hero = detailsById.get(element.dataset.heroId);

                if (!hero?.image) return;

                try {
                    const imageUrl = new URL(hero.image);

                    if (imageUrl.protocol !== "https:") return;

                    element.src = imageUrl.href;
                    element.alt = hero.name
                        ? `${hero.name} portrait`
                        : "Hero portrait";

                    element.hidden = false;
                    element.onerror = () => element.remove();
                } catch {
                    // Heroens navn vises stadig, selvom billedet mangler.
                }
            });

    } catch (error) {
        console.error("Could not load hero matches:", error);

        heroMatchesStatus.textContent =
            "Could not load matches for this hero.";

    } finally {
        heroMatchesButton.disabled = false;
    }
});

heroDetailsClose.addEventListener("click", () => {
    heroDetailsDialog.close();
});

heroMatchesClose.addEventListener("click", () => {
    heroMatchesDialog.close();
});

heroMatchesDialog.addEventListener("click", event => {
    if (event.target === heroMatchesDialog) {
        heroMatchesDialog.close();
    }
});