import * as userRepository from "../repository/userRepository.js";
import { fetchHero } from '../repository/heroesRepository.js'

export async function getUserById(id) {
    return await userRepository.getUserById(id);
}

export async function getUserByName(name){
    return await userRepository.getUserByName(name);
}

export async function getHeroStatsByUserId(id){
    return await userRepository.getHeroStatsByUserId(id)
}
