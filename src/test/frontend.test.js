import { test, expect } from 'vitest';
import request from 'supertest';
import { readFileSync } from 'node:fs';
import { Script, runInNewContext } from 'node:vm';
import app from '../app.js';

test('GET / serves the overview page and its frontend assets', async () => {
    const page = await request(app).get('/');

    expect(page.status).toBe(200);
    expect(page.text).toContain('<html lang="en">');
    expect(page.text).toContain('id="overview"');
    expect(page.text).toContain('id="popular-heroes"');
    expect(page.text).toContain('id="updates"');
    expect(page.text).toContain('id="player-search"');
    expect(page.text).toContain('id="profile-content"');
    expect(page.text.indexOf('id="profile-content"')).toBeLessThan(page.text.indexOf('id="popular-heroes"'));
    expect(page.text.indexOf('id="profile-content"')).toBeLessThan(page.text.indexOf('id="updates"'));
    expect(page.text).toContain('id="kda-ratio"');
    expect(page.text).toContain('id="average-kda"');
    expect(page.text).toContain('class="stat-card kda-stat-card"');
    expect(page.text).toContain('The average K/D/A pr. match');
    expect(page.text).toContain('id="trend-kd"');
    expect(page.text).toContain('id="trend-kda"');
    expect(page.text).toContain('id="trend-deaths"');
    expect(page.text).toContain('id="trend-result"');
    expect(page.text).toContain('id="trend-hero"');
    expect(page.text).toContain('id="match-history-button"');
    expect(page.text).toContain('id="match-history-dialog"');
    expect(page.text).toContain('id="match-history-list"');
    expect(page.text).toContain('Latest match compared with the previous match.');

    const trendScript = await request(app).get('/match-trend.js');
    expect(trendScript.status).toBe(200);
    expect(trendScript.text).toContain('compareLatest(matches)');

    const stylesheet = await request(app).get('/style.css');
    expect(stylesheet.status).toBe(200);
    expect(stylesheet.text).toContain('.profile-banner');
    expect(stylesheet.text).toContain('.match-history-dialog');
    expect(stylesheet.text).toContain('.match-history-stat-grid');
    expect(stylesheet.text).toContain('.match-history-stat-card.is-worse');
    expect(stylesheet.text).toContain('.match-history-hero-image');
    expect(stylesheet.text).toContain('.trend-stat-grid');
    expect(stylesheet.text).toContain('.trend-result-badge.is-win');

    const script = await request(app).get('/public.js');
    expect(script.status).toBe(200);
    expect(script.text).toContain('/api/user/search/');
    expect(script.text).toContain('/api/deadlock/patchnotes');
    expect(script.text).toContain('/api/deadlock/scoreboards/heroes');
    expect(script.text).toContain('async function fetchJson(url)');
    expect(script.text).toContain('/matches`');
    expect(script.text).toContain('renderMatchHistory(matches)');
    expect(script.text).not.toContain('match-history-secondary');
    expect(script.text).toContain('match-history-stat-grid');
    expect(script.text).toContain('Better than previous');
    expect(script.text).toContain('fetchMatchHeroDetails');
    expect(script.text).toContain('match-history-hero-image');
    expect(script.text).toContain('Match #${formatMatchValue(entry.matchNumber)}');
    expect(script.text).toContain('formatKda(comparison.match)');
    expect(script.text).toContain('getMatchOutcome(comparison.match)');
});

test('frontend script parses as a classic browser script', () => {
    const source = readFileSync(new URL('../public/public.js', import.meta.url), 'utf8');

    expect(() => new Script(source)).not.toThrow();
});

test('player stat renderers only target elements present in the page', () => {
    const source = readFileSync(new URL('../public/public.js', import.meta.url), 'utf8');
    const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
    const selectors = [...source.matchAll(/"#([\w-]+)"/g)].map(([, id]) => id);

    selectors.forEach(id => expect(html).toContain(`id="${id}"`));
});

test('profile overview displays KDA ratio and average K/D/A per match', () => {
    const source = readFileSync(new URL('../public/public.js', import.meta.url), 'utf8');
    const elements = new Map();
    const createElement = () => ({
        textContent: '',
        className: '',
        style: {},
        dataset: {},
        addEventListener() {},
        closest() { return null; },
        querySelector() { return createElement(); },
        setAttribute() {},
    });
    const document = {
        querySelector(selector) {
            if (!elements.has(selector)) elements.set(selector, createElement());
            return elements.get(selector);
        },
    };
    const context = {
        document,
        fetch: async () => { throw new Error('API unavailable'); },
        localStorage: { getItem() { return null; } },
    };
    runInNewContext(source, context);

    context.renderStats([
        { matches_played: 2, kills: 12, deaths: 4, assists: 10 },
        { matches_played: 1, kills: 3, deaths: 5, assists: 2 },
    ]);

    expect(elements.get('#kda-ratio').textContent).toBe('3');
    expect(elements.get('#average-kda').textContent).toBe('5 / 3 / 4');

    context.renderStats([{ matches_played: 1, kills: 5, deaths: 0, assists: 3 }]);
    expect(elements.get('#kda-ratio').textContent).toBe('8');
    expect(elements.get('#average-kda').textContent).toBe('5 / 0 / 3');
});

test('index uses semantic elements for content headings and the player profile', () => {
    const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

    expect(html.match(/<header class="section-heading(?: player-section-heading)?">/g)).toHaveLength(3);
    expect(html.match(/<header class="panel-heading">/g)).toHaveLength(3);
    expect(html).toContain('<header class="match-history-dialog-heading">');
    expect(html).toContain('<header class="banner-copy">');
    expect(html).toContain('<section id="profile-content" aria-labelledby="page-title" hidden>');
    expect(html).toContain('id="page-title"');
    expect(html).toContain('id="player-profile"');
    expect(html).not.toMatch(/<div class="(?:section-heading|panel-heading|match-history-dialog-heading|banner-copy)/);
});

test('match trend compares the latest two timestamped matches', () => {
    const source = readFileSync(new URL('../public/match-trend.js', import.meta.url), 'utf8');
    const context = {};
    runInNewContext(source, context);

    const result = context.DeadlockMatchTrends.compareLatest([
        { start_time: 100, player_kills: 5, player_deaths: 5 },
        { start_time: 200, player_kills: 10, player_deaths: 2 },
    ]);

    expect(result.kd.state).toBe('better');
    expect(result.kd.current).toBe(5);
    expect(result.kd.previous).toBe(1);
    expect(result.deaths.state).toBe('better');
});

test('match trend reports worse or unchanged stats and requires two timestamped matches', () => {
    const source = readFileSync(new URL('../public/match-trend.js', import.meta.url), 'utf8');
    const context = {};
    runInNewContext(source, context);
    const compareLatest = context.DeadlockMatchTrends.compareLatest;

    const worse = compareLatest([
        { start_time: 200, player_kills: 2, player_deaths: 5 },
        { start_time: 100, player_kills: 10, player_deaths: 2 },
    ]);
    const same = compareLatest([
        { start_time: 200, player_kills: 4, player_deaths: 2 },
        { start_time: 100, player_kills: 4, player_deaths: 2 },
    ]);

    expect(worse.kd.state).toBe('worse');
    expect(worse.deaths.state).toBe('worse');
    expect(same.kd.state).toBe('same');
    expect(same.deaths.state).toBe('same');
    expect(compareLatest([{ start_time: 100, player_kills: 1, player_deaths: 1 }])).toBeNull();
    expect(compareLatest([
        { start_time: null, player_kills: 2, player_deaths: 1 },
        { start_time: 100, player_kills: 1, player_deaths: 1 },
    ])).toBeNull();
});

test('match history is sorted newest first and compares every match with the one before it', () => {
    const source = readFileSync(new URL('../public/match-trend.js', import.meta.url), 'utf8');
    const context = {};
    runInNewContext(source, context);

    const history = context.DeadlockMatchTrends.compareHistory([
        { match_id: 100, start_time: 100, player_kills: 4, player_deaths: 4 },
        { match_id: 300, start_time: 300, player_kills: 8, player_deaths: 2 },
        { match_id: 200, start_time: 200, player_kills: 4, player_deaths: 4 },
        { match_id: 400, player_kills: 1, player_deaths: 1 },
    ]);

    expect(history.map(entry => entry.match.match_id)).toEqual([300, 200, 100, 400]);
    expect(history.map(entry => entry.matchNumber)).toEqual([4, 3, 2, 1]);
    expect(history[0].kd.state).toBe('better');
    expect(history[0].kdRatio).toBe(4);
    expect(history[0].deaths.state).toBe('better');
    expect(history[0].previousMatch.match_id).toBe(200);
    expect(history[1].kd.state).toBe('same');
    expect(history[1].kdRatio).toBe(1);
    expect(history[1].deaths.state).toBe('same');
    expect(history[2].hasPreviousMatch).toBe(false);
    expect(history[2].kd).toBeNull();
    expect(history[3].hasPreviousMatch).toBe(false);
});

test('match history includes a K/D ratio when a match has no deaths', () => {
    const source = readFileSync(new URL('../public/match-trend.js', import.meta.url), 'utf8');
    const context = {};
    runInNewContext(source, context);

    const history = context.DeadlockMatchTrends.compareHistory([
        { start_time: 200, player_kills: 6, player_deaths: 0 },
        { start_time: 100, player_kills: 3, player_deaths: 2 },
    ]);

    expect(history[0].kdRatio).toBe(6);
    expect(history[1].kdRatio).toBe(1.5);
});

test('match outcomes distinguish wins, losses, and missing outcomes', () => {
    const source = readFileSync(new URL('../public/match-trend.js', import.meta.url), 'utf8');
    const context = {};
    runInNewContext(source, context);
    const getMatchOutcome = context.DeadlockMatchTrends.getMatchOutcome;

    expect(getMatchOutcome({ player_match_outcome: 1 })).toBe('win');
    expect(getMatchOutcome({ player_match_outcome: 2 })).toBe('loss');
    expect(getMatchOutcome({ player_match_outcome: null, match_result: 0, player_team: 0 })).toBe('win');
    expect(getMatchOutcome({ player_match_outcome: null, match_result: 1, player_team: 0 })).toBe('loss');
    expect(getMatchOutcome({ player_match_outcome: 0, match_result: 0, player_team: 1 })).toBe('loss');
    expect(getMatchOutcome({ player_match_outcome: null, match_result: null, player_team: null })).toBeNull();
});

test('match duration is formatted into readable minutes and seconds', () => {
    const source = readFileSync(new URL('../public/match-trend.js', import.meta.url), 'utf8');
    const context = {};
    runInNewContext(source, context);
    const formatMatchDuration = context.DeadlockMatchTrends.formatMatchDuration;

    expect(formatMatchDuration(2409)).toBe('40m 9s');
    expect(formatMatchDuration(3600)).toBe('1h');
    expect(formatMatchDuration(null)).toBe('—');
});