import * as heroesService from '../services/heroesService.js';

export async function getHeroById(req, res, next){
    try {
        const hero = await heroesService.getHeroById(req.params.id);
        res.status(200).json(hero);
    } catch (err){
        next();
    }
}