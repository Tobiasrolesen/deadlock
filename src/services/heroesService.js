import * as heroesRepository from '../repository/heroesRepository.js';

<<<<<<< HEAD
export async function getHeroScoreboard() {
    return await heroesRepository.fetchHeroScoreboard();
}

export async function getHeroById(heroId) {
    return await heroesRepository.fetchHeroById(heroId);
=======
export async function getHeroById(id){
    return await heroesRepository.fetchHero(id);
>>>>>>> origin/main
}