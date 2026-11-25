import axios from 'axios';

export async function fetchHeroScoreboard() {
    try {
        const response = await axios.get(
            'https://api.deadlock-api.com/v1/analytics/scoreboards/heroes',
            {
                params: {
                    sort_by: 'matches',
                    game_mode: 'normal',
                    min_unix_timestamp: 1792972800,
                },
                timeout: 5000,
            }
        );

        return response.data;
    } catch (err) {
        const error = new Error('Could not retrieve hero scoreboard');
        error.status = 503;
        throw error;
    }
}

export async function fetchHeroById(heroId) {
    try {
        const response = await axios.get(
            `https://api.deadlock-api.com/v1/assets/heroes/${encodeURIComponent(heroId)}`,
            { timeout: 5000 }
        );
        const hero = response.data;

        if (!hero || typeof hero.name !== 'string') {
            const error = new Error('Hero not found');
            error.status = 404;
            throw error;
        }

        return {
            id: hero.id,
            name: hero.name,
            role: hero.description?.role || '',
            tags: Array.isArray(hero.tags) ? hero.tags : [],
            image: hero.images?.icon_hero_card_webp || hero.images?.icon_hero_card || '',
        };
    } catch (err) {
        if (err.status === 404) throw err;

        const error = new Error('Could not retrieve hero details');
        error.status = err.response?.status === 404 ? 404 : 503;
        throw error;
    }
}