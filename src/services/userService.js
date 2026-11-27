import * as userRepository from "../repository/userRepository.js";

import { fetchHero } from '../repository/heroesRepository.js'

//Midlertidig cache til spillerdata
const userCache = new Map();
const userNameCache = new Map();
const heroStatsCache = new Map();
const matchCache = new Map();

async function useFetchHero(id){
    const herolist = await getHeroStatsByUserId(id);
    if (!herolist || herolist.length === 0) {
        return [];
    }

    const heroesWNames = await Promise.all( //Promise.all sørger for at alle opslag ventes på
        herolist.map(async (heroStats) => {
            const hero = await fetchHero(heroStats.hero_id);

            return {
                ...heroStats, //Beholder de eksisterende statisikker for spillerens hero
                hero_name: hero.name
            };
        })
    );
    return heroesWNames;
}

export async function getUserById(id) {
    if (userCache.has(id)){
        return userCache.get(id);
    }
    const user = await userRepository.getUserById(id);
    if (user){
        userCache.set(id, user);
    }
    return user
}

export async function getUserByName(name){
    if (userNameCache.has(name)){
        return userNameCache.get(name);
    }
    const user = await userRepository.getUserByName(name)
    if (user){
        userNameCache.set(name, user);
    }
    return user
}

export async function getHeroStatsByUserId(id){
    if (heroStatsCache.has(id)){
        return heroStatsCache.get(id);
    }
    const heroStats = await userRepository.getHeroStatsByUserId(id);
    if (heroStats){
        heroStatsCache.set(id, heroStats);
    }
    return heroStats
}

export async function getPlayedHeroes(id){
    const usersHeroes = await useFetchHero(id);

    return sortPlayedHeroes(usersHeroes, 'time_played');
}

export async function getHeroesByWins(id){
    const usersHeroes = await useFetchHero(id);
    return sortPlayedHeroes(usersHeroes, 'wins');
}

export async function getHeroesByMatches(id){
    const usersHeroes = await useFetchHero(id);
    return sortPlayedHeroes(usersHeroes, 'matches_played');
}

export async function getHeroesByKills(id){
    const usersHeroes = await useFetchHero(id);
    return sortPlayedHeroes(usersHeroes, 'kills');
}

export async function getHeroesByDeaths(id){
    const usersHeroes = await useFetchHero(id);
    return sortPlayedHeroes(usersHeroes, 'deaths');
}


//Sorteringsmetode til heroes Standardsortering: time_played
export function sortPlayedHeroes(herolist, sortBy = 'time_played'){
    return [...herolist].sort(
        (a, b) => b[sortBy] - a[sortBy]
    );
}

export async function getMatchHistoryByUserId(id){
    if (matchCache.has(id)){
        return matchCache.get(id);
    }
    const matches = await userRepository.getMatchHistoryByUserId(id);
    if (matches){
        matchCache.set(id, matches);
    }
    return matches
}
