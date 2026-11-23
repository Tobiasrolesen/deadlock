import { test, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

test('GET /api/user/id returns correct id', async t => {
    const id = "76561198200356797"
    const response = await request(app).get(`/api/user/${id}`);
    expect(response.status).toBe(200);
    expect(response.body.account_id).toBe(id)
})