import * as itemService from '../services/itemsService.js';

export async function getAllItems(req, res, next) {
    try {
        const items = await itemService.getAllItems();
        res.status(200).json(items);
    } catch (err){
        next();
    }
}

export async function getItemByHeroId(req, res, next) {
    try {
        const items = await itemService.getItemByHeroId(req.params.id);
        res.status(200).json(items);
    } catch (err){
        next();
    }
}

export async function getItemBySlotType(req, res, next) {
    try {
        const {slot_type} = req.params;
        const items = await itemService.getItemBySlotType(slot_type);
        res.status(200).json(items);
    } catch (err){
        next();
    }
}

export async function getItemByType(req, res, next) {
    try {
        const {type} = req.params;
        const items = await itemService.getItemByType(type);
        res.status(200).json(items);
    } catch (err){
        next();
    }
}

export async function getItemById(req, res, next) {
    try {
        const item = await itemService.getItemById(req.params.id);
        res.status(200).json(item);
    } catch (err){
        next();
    }
}