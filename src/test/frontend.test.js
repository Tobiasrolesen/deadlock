import { test, expect } from 'vitest';
import request from 'supertest';
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
    expect(page.text).toContain('Match search is not supported yet.');

    const stylesheet = await request(app).get('/style.css');
    expect(stylesheet.status).toBe(200);
    expect(stylesheet.text).toContain('.profile-banner');

    const script = await request(app).get('/public.js');
    expect(script.status).toBe(200);
    expect(script.text).toContain('/api/user/search/');
    expect(script.text).toContain('/api/deadlock/patchnotes');
    expect(script.text).toContain('/api/deadlock/scoreboards/heroes');
});