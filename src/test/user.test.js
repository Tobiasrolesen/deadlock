import { test, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

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
