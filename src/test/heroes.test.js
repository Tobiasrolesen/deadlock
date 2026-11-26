import {expect, test} from 'vitest';
import request from "supertest";
import app from "../app.js";

test.todo('heroes tests');

 test('GET /api/deadlock/scoreboards/heroes returns the global hero scoreboard', async () => {
    const response = await request(app).get('/api/deadlock/scoreboards/heroes');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    const topHero = response.body[0];
    expect(topHero).toEqual(expect.objectContaining({
        rank: expect.any(Number),
        hero_id: expect.any(Number),
        matches: expect.any(Number),
        value: expect.any(Number),
    }));
    expect(topHero.hero_id).toBeGreaterThan(0);
    expect(topHero.matches).toBeGreaterThan(0);
});

test('GET /api/deadlock/scoreboards/heroes/:heroId returns hero details', async () => {
    const response = await request(app).get('/api/deadlock/scoreboards/heroes/13');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
        id: 13,
        name: 'Haze',
        role: expect.any(String),
        tags: expect.any(Array),
        image: expect.stringMatching(/^https:\/\//),
    }));
});

test('GET /api/deadlock/scoreboards/heroes/:heroId rejects non-numeric IDs', async () => {
    const response = await request(app).get('/api/deadlock/scoreboards/heroes/not-a-hero');

    expect(response.status).toBe(400);
});

//Vise heronavn på heroid hentet fra API
test('GET /api/heroes/:1 returnerer navnet Infernus', async () => {
    const heroId = "1";
    const response = await request(app).get(`/api/heroes/${heroId}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Infernus');
});





