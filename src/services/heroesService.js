import * as heroesRepository from '../repository/heroesRepository.js';

export async function getHeroScoreboard() {
    return await heroesRepository.fetchHeroScoreboard();
}

export async function getHeroById(heroId) {
    return await heroesRepository.fetchHero(heroId);
}