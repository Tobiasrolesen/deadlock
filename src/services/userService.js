import * as userRepository from "../repository/userRepository.js";

import {fetchHero} from '../repository/heroesRepository.js'

//Midlertidig cache til spillerdata
const userCache = new Map();
const userNameCache = new Map();
const heroStatsCache = new Map();
const matchCache = new Map();

//Cache tid 5 minutter
const CACHE_TIME = 5 * 60 * 1000;

export function isCacheExpired(savedAt, now = Date.now()) {
    return now - savedAt >= CACHE_TIME;
}

async function useFetchHero(id) {
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
//Gemt data udløber efter CACHE_TIME (se getFromCache).
export async function getUserById(id) {
    const cached = getFromCache(userCache, id)
    if (cached) {
        return cached; //Kan være færdig data eller et kald der stadig er i gang
    }
    const request = userRepository.getUserById(id);
    saveToCache(userCache, id, request);

    try {
        const user = await request;
        if (!user) {
            userCache.delete(id);
        }
        return user
    } catch (err) {
        userCache.delete(id);
        throw err;
    }
}

export async function getUserByName(name) {
    const cached = getFromCache(userNameCache, name)
    if (cached) {
        return cached;
    }
    const request = userRepository.getUserByName(name);
    saveToCache(userNameCache, name, request);

    try {
        const user = await request;
        if (!user) {
            userNameCache.delete(name);
        }
        return user
    } catch (err) {
        userNameCache.delete(name);
        throw err;
    }
}

export async function getHeroStatsByUserId(id) {
    const cached = getFromCache(heroStatsCache, id)
    if (cached) {
        return cached;
    }
    const request = userRepository.getHeroStatsByUserId(id);
    saveToCache(heroStatsCache, id, request);

    try {
        const heroStats = await request;
        if (!heroStats) {
            heroStatsCache.delete(id);
        }
        return heroStats
    } catch (err) {
        heroStatsCache.delete(id);
        throw err;
    }
}

export async function getPlayedHeroes(id) {
    const usersHeroes = await useFetchHero(id);

    return sortPlayedHeroes(usersHeroes, 'time_played');
}

export async function getHeroesByWins(id) {
    const usersHeroes = await useFetchHero(id);
    return sortPlayedHeroes(usersHeroes, 'wins');
}

export async function getHeroesByMatches(id) {
    const usersHeroes = await useFetchHero(id);
    return sortPlayedHeroes(usersHeroes, 'matches_played');
}

export async function getHeroesByKills(id) {
    const usersHeroes = await useFetchHero(id);
    return sortPlayedHeroes(usersHeroes, 'kills');
}

export async function getHeroesByDeaths(id) {
    const usersHeroes = await useFetchHero(id);
    return sortPlayedHeroes(usersHeroes, 'deaths');
}


//Sorteringsmetode til heroes Standardsortering: time_played
export function sortPlayedHeroes(herolist, sortBy = 'time_played') {
    return [...herolist].sort(
        (a, b) => b[sortBy] - a[sortBy]
    );
}

export async function getMatchHistoryByUserId(id) {
    const cached = getFromCache(matchCache, id);
    if (cached) {
        return cached;
    }
    const request = userRepository.getMatchHistoryByUserId(id);
    saveToCache(matchCache, id, request);

    try {
        const matches = await request;
        if (!matches) {
            matchCache.delete(id);
        }
        return matches
    } catch (err) {
        matchCache.delete(id); //Repository kaster 503 ved fejl - den må ikke gemmes
        throw err;
    }
}

//Hjælpefunktion til at hente data fra cachen hvis det ikke er udløbet
function getFromCache(cache, key) {
    const saved = cache.get(key);
    if (saved && !isCacheExpired(saved.savedAt)) {
        return saved.data
    }
    return null;
}

//Hjælpefunktion til at gemme data i cachen
function saveToCache(cache, key, data) {
    cache.set(key, {data: data, savedAt: Date.now()});
}

