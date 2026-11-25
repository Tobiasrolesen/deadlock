import { test, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

test('Hente items fra deadlock-api', async () =>{
    const response = await request(app).get('/api/deadlock/items');
    expect(response.status).toBe(200);
    expect(response.body[0]).toBeDefined();
    expect(response.body.length).toBeGreaterThan(0);
});

test('Hente alle de nødvendige data', async () => {
    const response = await request(app).get('/api/deadlock/items');

    expect(response.status).toBe(200);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('slot');
    expect(response.body[0]).toHaveProperty('tier');
    expect(response.body[0]).toHaveProperty('cost');
    expect(response.body[0]).toHaveProperty('shopable');
    expect(response.body[0]).toHaveProperty('image');
    expect(response.body[0]).toHaveProperty('description');
});


test('Hente items via hero id', async () =>{
    const response = await request(app).get('/api/deadlock/items/hero/1');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
});

test('Hente items via slot_type', async () =>{
    const response = await request(app).get('/api/deadlock/items/slot/weapon');
    const items = response.body;
    expect(response.status).toBe(200);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);

    items.forEach((item) => {
        expect(item).toHaveProperty('slot', 'weapon');
    });
});

test('Hente items via type', async () =>{
    const response = await request(app).get('/api/deadlock/items/type/ability');
    const items = response.body;
    expect(response.status).toBe(200);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);

    items.forEach((item) => {
        expect(item).toHaveProperty('type', 'ability');
    });
});

test('Hente items by id', async () =>{
    const response = await request(app).get('/api/deadlock/items/2521299219');
    const item = response.body;
    expect(response.status).toBe(200);
    expect(item).toBeInstanceOf(Object);
    expect(item).toHaveProperty('id', 2521299219);
});