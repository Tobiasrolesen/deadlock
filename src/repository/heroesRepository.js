import axios from 'axios';

<<<<<<< HEAD
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
=======
export async function fetchHero(hero_id){
    try {
        const response = await axios.get(
            `https://api.deadlock-api.com/v1/assets/heroes/${encodeURIComponent(hero_id)}`,
            {timeout: 5000}
        );
        const data = response.data;

        return {
            id: data.id,
            name: data.name,
            class_name: data.class_name,

            description: {
                role: data.description?.role,
                playstyle: data.description?.playstyle
            },

            hero_type: data.hero_type,
            gender: data.gender,

            tags: data.tags,
            gun_tag: data.gun_tag,
            complexity: data.complexity,

            image: data.images?.icon_image_small,

            stats: {
                max_health: data.starting_stats?.max_health,
                max_move_speed: data.starting_stats?.max_move_speed,
                sprint_speed: data.starting_stats?.sprint_speed,
                stamina: data.starting_stats?.stamina,
                base_health_regen: data.starting_stats?.base_health_regen,
                light_melee_damage: data.starting_stats?.light_melee_damage,
                heavy_melee_damage: data.starting_stats?.heavy_melee_damage,
                reload_speed: data.starting_stats?.reload_speed
            }
        };


    } catch (err){
        const error = new Error('Kunne ikke hente hero');
        error.status = err.response?.status === 404 ? 404 : 503; //WIP
>>>>>>> origin/main
        throw error;
    }
}