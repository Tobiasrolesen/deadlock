import { test, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

//Hente fra ekstern api
test('Hente patchnotes fra deadlock-api', async () =>{
    const response = await request(app).get('/api/deadlock/patchnotes');
    expect(response.status).toBe(200);
    expect(response.body[0]).toBeDefined();
});

//Hente de nødvendige data fra api (kan sættes sammen med første test?)
test('Hent alle de nødvendige data', async () => {
    const response = await request(app).get('/api/deadlock/patchnotes');
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0]).toHaveProperty('pub_date');
    expect(response.body[0]).toHaveProperty('link');
    expect(response.body[0]).toHaveProperty('content');
});

//Fejl i ekstern-api
test('Fejl i kald til deadlock-api', async () => {
    const response = await request(app).get('/api/deadlock/patchnotes');
    //WIP
});


//Tjek dato for opdatering
test('Tjekke datoen for hentet patchnote', async () => {
    //WIP
});


//Opdatering sættes i rækkefølge
test('Sorter hentede patchnotes efter dato', async () => {
    //WIP
});

