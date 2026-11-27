import { test, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { sortPlayedHeroes } from '../services/userService.js';

test('GET /api/user/id returns correct id', async t => {
    const id = "76561198200356797"
    const response = await request(app).get(`/api/user/${id}`);
    expect(response.status).toBe(200);
    expect(response.body.account_id).toBe(id)
})

test('GET /api/user/name returns correct name', async t =>{
    const name = "Matelund"
    const response = await request(app).get(`/api/user/search/${name}`);
    expect(response.status).toBe(200);
    expect(response.body.personaname).toBe(name)
})

test('GET /api/user/name returns 404 for none extisting name', async t =>{
    const name = "Nonexistingfalsename123943ksofk"
    const response = await request(app).get(`/api/user/search/${name}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User Not Found")
})

test('GET /api/user/id/hero-stats returns profiles hero stats', async t => {
    const id = "240091069"
    const response = await request(app).get(`/api/user/${id}/hero-stats`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].account_id).toBe(Number(id));
});


// ----- Mest spillede helte -----

//Test for sorteringsmetode virker
test('Sortering af spilletid lokalt', () => {
    const mockHeroes = [
        {
            "name": "Infernus",
            "time_played": 7002
        },
        {
            "name": "Billy",
            "time_played": 2884
        },
        {
            "name": "Rem",
            "time_played": 37642
        }
    ];

    const sorted = sortPlayedHeroes(mockHeroes);
    expect(sorted[0].name).toBe('Rem');
    expect(sorted[1].name).toBe('Infernus');
    expect(sorted[2].name).toBe('Billy');
});

//Sorter efter mest spillede helte
test('Heroliste sorteret efter mest spillede helte', async () => {
    const userId = "240091069"
    const response = await request(app).get(`/api/user/${userId}/herolist`);
    expect(response.status).toBe(200);

    const herolist = response.body;

    expect(Array.isArray(herolist)).toBe(true);

    for(let i = 0; i < herolist.length - 1; i++){
        const current = herolist[i].time_played;
        const next = herolist[i + 1].time_played;

        expect(current).toBeGreaterThanOrEqual(next);
    }
});

//Liste af helte har navne
test('Hentede heroliste har navn', async () => {
    const userId = "240091069"
    const response = await request(app).get(`/api/user/${userId}/herolist`);
    expect(response.status).toBe(200);

    const herolist = response.body;

    expect(Array.isArray(herolist)).toBe(true);
    for(let i = 0; i < herolist.length - 1; i++){
        expect(herolist[i]).toHaveProperty('hero_details.name');
        expect(typeof herolist[i].hero_details.name).toBe('string');
    }
});

// ----- Sorteringsmetoder til spillede helte -----

//Sorteret efter totale wins
test('Heroliste sorteret efter wins', async () => {
    const userId = "240091069"
    const response = await request(app).get(`/api/user/${userId}/herolist/sortedWins`);
    expect(response.status).toBe(200);

    const herolist = response.body;
    expect(Array.isArray(herolist)).toBe(true);
    for(let i = 0; i < herolist.length - 1; i++){
        const current = herolist[i].wins;
        const next = herolist[i + 1].wins;

        expect(current).toBeGreaterThanOrEqual(next);
    }
});

//Sorteret efter totale matches
test('Heroliste sorteret efter matches', async () => {
    const userId = "240091069"
    const response = await request(app).get(`/api/user/${userId}/herolist/sortedMatches`);
    expect(response.status).toBe(200);

    const herolist = response.body;
    expect(Array.isArray(herolist)).toBe(true);
    for(let i = 0; i < herolist.length - 1; i++){
        const current = herolist[i].matches_played;
        const next = herolist[i + 1].matches_played;

        expect(current).toBeGreaterThanOrEqual(next);
    }
});

//Sorteret efter totale kills
test('Heroliste sorteret efter kills', async () => {
    const userId = "240091069"
    const response = await request(app).get(`/api/user/${userId}/herolist/sortedKills`);
    expect(response.status).toBe(200);

    const herolist = response.body;
    expect(Array.isArray(herolist)).toBe(true);
    for(let i = 0; i < herolist.length - 1; i++){
        const current = herolist[i].kills;
        const next = herolist[i + 1].kills;

        expect(current).toBeGreaterThanOrEqual(next);
    }
});


//Sorteret efter totale deaths
test('Heroliste sorteret efter deaths', async () => {
    const userId = "240091069"
    const response = await request(app).get(`/api/user/${userId}/herolist/sortedDeaths`);
    expect(response.status).toBe(200);

    const herolist = response.body;
    expect(Array.isArray(herolist)).toBe(true);
    for(let i = 0; i < herolist.length - 1; i++){
        const current = herolist[i].deaths;
        const next = herolist[i + 1].deaths;

        expect(current).toBeGreaterThanOrEqual(next);
    }
});

/// ----- Kamphistorik/stats for specifik helt man har spillet -----
//Hente enkelt helts stats
test('GET stats for specific user', async () => {
    const userId = "240091069";
    const heroId = "31"
    const response = await request(app).get(`/api/user/${userId}/herolist/${heroId}`);
    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty('matches_played');
    expect(response.body).toHaveProperty('wins');
    expect(response.body).toHaveProperty('kills');
    expect(response.body).toHaveProperty('deaths');
    expect(response.body).toHaveProperty('assists');
    expect(response.body).toHaveProperty('accuracy');
});

//Hente kamphistorik for enkelt helt
test('GET matchhistory for specific hero', async () => {
    const userId = "240091069";
    const heroId = "31";
    const response = await request(app).get(`/api/user/${userId}/herolist/${heroId}/matches`);
    expect(response.status).toBe(200);
    const matchlist = response.body

    expect(Array.isArray(matchlist)).toBe(true);
    for(let i = 0; i < matchlist.length; i++){
        expect(response.body[i]).toHaveProperty('match_id');
    }
});


/// ----- -----

//matches test
test('GET /api/user/id/matches returns matches associated with id', async t => {
    const id = "240091069"
    const response = await request(app).get(`/api/user/${id}/matches`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].account_id).toBe(Number(id));
});

test('GET /api/user/id/matches returns 404 for no matches found', async t => {
    const id = "76561199095680219"
    const response = await request(app).get(`/api/user/${id}/matches`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No matches were found");
});

