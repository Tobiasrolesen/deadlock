import { test, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

//Vise heronavn på heroid hentet fra API
test('GET /api/heroes/:1 returnerer navnet Infernus', async () => {
    const heroId = "1";
    const response = await request(app).get(`/api/heroes/${heroId}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Infernus');
});





