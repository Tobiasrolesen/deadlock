import * as heroesRepository from '../repository/heroesRepository.js';

export async function getHeroById(id){
    return await heroesRepository.fetchHero(id);
}