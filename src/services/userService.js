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

export async function getUserById(id) {
    const cached = getFromCache(userCache, id)
    if (cached) {
        return cached;
    }
    const user = await userRepository.getUserById(id);
    if (user) {
        saveToCache(userCache, id, user);
    }
    return user
}

export async function getUserByName(name) {
    const cached = getFromCache(userNameCache, name)
    if (cached) {
        return cached;
    }
    const user = await userRepository.getUserByName(name);
    if (user) {
        saveToCache(userNameCache, name, user);
    }
    return user
}

export async function getHeroStatsByUserId(id) {
    const cached = getFromCache(heroStatsCache, id)
    if (cached) {
        return cached;
    }
    const heroStats = await userRepository.getHeroStatsByUserId(id);
    if (heroStats) {
        saveToCache(heroStatsCache, id, heroStats);
    }
    return heroStats
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
    const matches = await userRepository.getMatchHistoryByUserId(id);
    if (matches) {
        saveToCache(matchCache, id, matches);
    }
    return matches
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

