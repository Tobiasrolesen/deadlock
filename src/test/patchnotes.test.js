import { test, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { sortPatchnotes } from '../services/patchnotesService.js'

//Hente fra ekstern api
test('Hente patchnotes fra deadlock-api', async () =>{
    const response = await request(app).get('/api/deadlock/patchnotes');
    expect(response.status).toBe(200);
    expect(response.body[0]).toBeDefined();
    expect(response.body.length).toBeGreaterThan(0);
});

//Hente de nødvendige data fra api (kan sættes sammen med første test?)
test('Hent alle de nødvendige data', async () => {
    const response = await request(app).get('/api/deadlock/patchnotes');

    expect(response.status).toBe(200);
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
    const response = await request(app).get('/api/deadlock/patchnotes');
    const patchnotes = response.body;

    expect(response.status).toBe(200);

    patchnotes.forEach((patchnote) => {
        expect(patchnote).toHaveProperty('pub_date');

        //Tjekke at den hentede patchnotes dato er forståelig for JavaScript
        const parsedDate = Date.parse(patchnote.pub_date);
        expect(parsedDate).not.toBeNaN();
    });

});


//Opdatering sættes i rækkefølge (lokal data for at sikre at funktionen virker)
test('Sorter lokal patchnotes efter dato', () =>{
    const mockPatchnotes = [
        {
            title: 'Update 3',
            pub_date: '2026-11-05T19:58:14Z',
        },
        {
            title: 'Update 1',
            pub_date: '2026-10-01T10:00:00Z',
        },
        {
            title: 'Update 2',
            pub_date: '2026-10-20T12:00:00Z',
        },
    ];
    const sorted = sortPatchnotes(mockPatchnotes);
    expect(sorted[0].title).toBe('Update 3');
    expect(sorted[1].title).toBe('Update 2');
    expect(sorted[2].title).toBe('Update 1');
})


//Opdatering sættes i rækkefølge (hentet fra api)
test('Sorter hentede patchnotes efter dato', async () => {
    const response = await request(app).get('/api/deadlock/patchnotes');

    expect(response.status).toBe(200);

    const patchnotes = response.body;

    for (let i = 0; i < patchnotes.length - 1; i++){
        const current = Date.parse(patchnotes[i].pub_date);
        const next = Date.parse(patchnotes[i + 1].pub_date);

        expect(current).toBeGreaterThanOrEqual(next);
    }
});


//Tjek at content bevarer HTML-indholdet
test('Patchnote indeholder original HTML-formatering', async () =>{
    const response = await request(app).get('/api/deadlock/patchnotes');

    expect(response.status).toBe(200);

    //for enkelt patchnote
    const patchnote = response.body[0];
    expect(patchnote.content).toBeDefined();
    expect(typeof patchnote.content).toBe('string');
    expect(patchnote.content.length).toBeGreaterThan(0);
});




