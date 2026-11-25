import axios from 'axios';

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
        throw error;
    }
}