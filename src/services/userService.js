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

//Kaldet gemmes i cachen med det samme (før await), så to søgninger på samme tid
//deler samme kald. Findes spilleren ikke, eller fejler kaldet, fjernes det igen.
export async function getUserById(id) {
    if (userCache.has(id)){
        return userCache.get(id); //Kan være færdig data eller et kald der stadig er i gang
    }
    const request = userRepository.getUserById(id);
    userCache.set(id, request);

    try {
        const user = await request;
        if (!user){
            userCache.delete(id);
        }
        return user
    } catch (err) {
        userCache.delete(id);
        throw err;
    }
}

export async function getUserByName(name){
    if (userNameCache.has(name)){
        return userNameCache.get(name);
    }
    const request = userRepository.getUserByName(name);
    userNameCache.set(name, request);

    try {
        const user = await request;
        if (!user){
            userNameCache.delete(name);
        }
        return user
    } catch (err) {
        userNameCache.delete(name);
        throw err;
    }
}

export async function getHeroStatsByUserId(id){
    if (heroStatsCache.has(id)){
        return heroStatsCache.get(id);
    }
    const request = userRepository.getHeroStatsByUserId(id);
    heroStatsCache.set(id, request);

    try {
        const heroStats = await request;
        if (!heroStats){
            heroStatsCache.delete(id);
        }
        return heroStats
    } catch (err) {
        heroStatsCache.delete(id);
        throw err;
    }
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
    const request = userRepository.getMatchHistoryByUserId(id);
    matchCache.set(id, request);

    try {
        const matches = await request;
        if (!matches){
            matchCache.delete(id);
        }
        return matches
    } catch (err) {
        matchCache.delete(id); //Repository kaster 503 ved fejl - den må ikke gemmes
        throw err;
    }
}
