import * as userRepository from "../repository/userRepository.js";
<<<<<<< HEAD
=======
import { fetchHero } from '../repository/heroesRepository.js'
>>>>>>> origin/main

export async function getUserById(id) {
    return await userRepository.getUserById(id);
}

export async function getUserByName(name){
    return await userRepository.getUserByName(name);
}

export async function getHeroStatsByUserId(id){
    return await userRepository.getHeroStatsByUserId(id)
}
<<<<<<< HEAD
=======

export async function getPlayedHeroes(id){
    const herolist = await userRepository.getHeroStatsByUserId(id);
    if (!herolist || herolist.length === 0) {
        return [];
    }

    //Tilføjelse så hver helt har navn
    const heroesWNames = await Promise.all( //Promise.all sørger for at alle opslag ventes på
        herolist.map(async (heroStats) => {
            const hero = await fetchHero(heroStats.hero_id);

            return {
                ...heroStats, //Beholder de eksisterende statisikker for spillerens hero
                hero_name: hero.name
            };
        })
    );

    return sortMatches(heroesWNames);
}


export function sortMatches(herolist){
    return [...herolist].sort(
        (a, b) => b.time_played - a.time_played
    );
}

export async function getMatchHistoryByUserId(id){
    return await userRepository.getMatchHistoryByUserId(id);
}
>>>>>>> origin/main
