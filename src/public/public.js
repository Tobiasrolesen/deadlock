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
        "#win-rate", "#kd-ratio", "#matches-played", "#damage-per-minute",
        "#total-wins", "#total-kills", "#total-deaths", "#total-assists",
        "#hero-count", "#hero-record-count", "#networth-per-minute", "#accuracy",
    ].forEach(selector => {
        document.querySelector(selector).textContent = "—";
    });
    ["#win-rate-bar", "#kd-bar", "#damage-bar"].forEach(selector => setProgress(selector, 0));
}

function renderPlayer(player) {
    document.querySelector("#page-title").textContent = player.personaname || "Unknown player";
    document.querySelector("#steam-id").textContent = `Steam ID: ${player.account_id}`;
    document.querySelector("#profile-updated").textContent = "Profile loaded just now";
    avatarFallback.textContent = (player.personaname || "DL").slice(0, 2).toUpperCase();

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
    const kdRatio = totals.deaths > 0 ? totals.kills / totals.deaths : totals.kills;
    const damagePerMinute = weightedAverage(records, "damage_per_min");
    const networthPerMinute = weightedAverage(records, "networth_per_min");
    const accuracy = weightedAverage(records, "accuracy");

    document.querySelector("#win-rate").textContent = `${formatNumber(winRate)}%`;
    document.querySelector("#kd-ratio").textContent = formatNumber(kdRatio);
    document.querySelector("#matches-played").textContent = formatNumber(totals.matches);
    document.querySelector("#damage-per-minute").textContent = damagePerMinute === null ? "—" : formatNumber(damagePerMinute);
    document.querySelector("#total-wins").textContent = formatNumber(totals.wins);
    document.querySelector("#total-kills").textContent = formatNumber(totals.kills);
    document.querySelector("#total-deaths").textContent = formatNumber(totals.deaths);
    document.querySelector("#total-assists").textContent = formatNumber(totals.assists);
    document.querySelector("#hero-count").textContent = `${records.length} tracked ${records.length === 1 ? "hero" : "heroes"}`;
    document.querySelector("#hero-record-count").textContent = formatNumber(records.length);
    document.querySelector("#networth-per-minute").textContent = networthPerMinute === null ? "—" : formatNumber(networthPerMinute);
    document.querySelector("#accuracy").textContent = accuracy === null ? "—" : `${formatNumber(accuracy)}%`;

    setProgress("#win-rate-bar", winRate);
    setProgress("#kd-bar", kdRatio, Math.max(kdRatio, 3));
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
        renderPlayer(player);
        playerLoaded = true;

        const records = await fetchJson(`/api/user/${encodeURIComponent(player.account_id)}/hero-stats`);
        renderStats(Array.isArray(records) ? records : []);
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