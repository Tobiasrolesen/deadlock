import * as itemRepository from '../repository/itemsRepository.js';

export async function getAllItems() {
    return await itemRepository.getAllItems();
}

export async function getItemByHeroId(id) {
    return await itemRepository.getItemByHeroId(id);
}

export async function getItemBySlotType(slot_type) {
    return await itemRepository.getItemBySlotType(slot_type);
}

export async function getItemByType(type) {
    return await itemRepository.getItemByType(type);
}

export async function getItemById(id) {
    return await itemRepository.getItemById(id);
}