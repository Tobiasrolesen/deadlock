import { test, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { sortPlayedHeroes, getUserById, getUserByName, getHeroStatsByUserId, getMatchHistoryByUserId, isCacheExpired } from '../services/userService.js';
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
        console.log(response.body);
        expect(herolist[i]).toHaveProperty('hero_name');
        expect(typeof herolist[i].hero_name).toBe('string');
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


/// ----- -----

//matches test
test('GET /api/user/id/matches returns matches associated with id', async t => {
    const id = "240091069"
    const response = await request(app).get(`/api/user/${id}/matches`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].account_id).toBe(Number(id));
    expect(response.body[0]).toHaveProperty('start_time');
});

test('GET /api/user/id/matches returns 404 for no matches found', async t => {
    const id = "76561199095680219"
    const response = await request(app).get(`/api/user/${id}/matches`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No matches were found");
});

//En ny søgning bruger genbrugt data
test('New search on the player uses saved data', async () => {
    const id = "76561198149336497"
    const first = await getUserById(id);
    const second = await getUserById(id);
    expect(second).toBe(first);
});

//Forskellige spillere gemmes hver for sig
test('Different players are saved differently', async () => {
    const id1 = "76561198200356797"
    const id2 = "240091069"
    const user1 = await getUserById(id1);
    const user2 = await getUserById(id2);
    expect(user1.account_id).toBe(id1);
    expect(user2.account_id).toBe(id2);
})

//Gemt data returneres korrekt gennem API'et
test('GET /api/user/id returns same data with search', async () => {
    const id = "76561198200356797"
    const first = await request(app).get(`/api/user/${id}`);
    const second = await request(app).get(`/api/user/${id}`);
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
})

//Anden søgning går hurtigere, fordi data ikke hentes igen
test('Search on same players is quicker', async () => {
    const id = "240091069"
    let start = Date.now();
    await request(app).get(`/api/user/${id}`);
    const firstTime = Date.now() - start;
    start = Date.now();
    await request(app).get(`/api/user/${id}`);
    const secondTime = Date.now() - start;
    expect(secondTime).toBeLessThan(5);
})

//Søgning på samme navn genbruger gemt data
test('New search on the same name uses saved data', async () => {
    const name = "Matelund"
    const first = await getUserByName(name);
    const second = await getUserByName(name);
    expect(second).toBe(first);
});

//Hero stats for samme spiller genbruges
test('Hero stats for the same player uses saved data', async () => {
    const id = "240091069"
    const first = await getHeroStatsByUserId(id);
    const second = await getHeroStatsByUserId(id);
    expect(second).toBe(first);
});

//Match history for samme spiller genbruges
test('Match history for the same player uses saved data', async () => {
    const id = "240091069"
    const first = await getMatchHistoryByUserId(id);
    const second = await getMatchHistoryByUserId(id);
    expect(second).toBe(first);
});

test('Newly saved data is not expired', () => {
    const now = Date.now();
    expect(isCacheExpired(now, now)).toBe(false);
});

//Data der er under 5 minutter gammel er ikke udløbet
test('Data saved 4 minutes ago is not expired', () => {
    const now = Date.now();
    const savedAt = now - 299000;
    expect(isCacheExpired(savedAt, now)).toBe(false);
});

//Data der er præcis 5 minutter gammel er udløbet
test('Data saved 5 minutes ago is expired', () => {
    const now = Date.now();
    const savedAt = now - 300000;
    expect(isCacheExpired(savedAt, now)).toBe(true);
});

//Data der er over 5 minutter sekunder gammel er udløbet
test('Data saved 6 minutes ago is expired', () => {
    const now = Date.now();
    const savedAt = now - 360000;
    expect(isCacheExpired(savedAt, now)).toBe(true);
});





