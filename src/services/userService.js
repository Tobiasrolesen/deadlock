import * as userRepository from "../repository/userRepository.js";

import { fetchHero } from '../repository/heroesRepository.js'

//Midlertidig cache til spillerdata
const userCache = new Map();
const userNameCache = new Map();
const heroStatsCache = new Map();
const matchCache = new Map();

async function getCachedValue(cache, key, fetchValue) {
    if (cache.has(key)) {
        return cache.get(key);
    }

    const pending = fetchValue();
    cache.set(key, pending);
    try {
        const value = await pending;
        if (value) {
            cache.set(key, value);
        } else {
            cache.delete(key);
        }
        return value;
    } catch (error) {
        if (cache.get(key) === pending) {
            cache.delete(key);
        }
        throw error;
    }
}

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
    return getCachedValue(userCache, id, () => userRepository.getUserById(id));
}

export async function getUserByName(name){
    return getCachedValue(userNameCache, name, () => userRepository.getUserByName(name));
}

export async function getHeroStatsByUserId(id){
    return getCachedValue(heroStatsCache, id, () => userRepository.getHeroStatsByUserId(id));
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
    return getCachedValue(matchCache, id, () => userRepository.getMatchHistoryByUserId(id));
}
