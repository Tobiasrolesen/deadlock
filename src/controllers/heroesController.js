import * as heroesService from '../services/heroesService.js';

<<<<<<< HEAD
export async function getHeroScoreboard(req, res) {
    try {
        const scoreboard = await heroesService.getHeroScoreboard();
        return res.status(200).json(scoreboard);
    } catch (err) {
        return res.status(err.status || 503).json({
            message: 'Hero scoreboard is temporarily unavailable',
        });
    }
}

export async function getHeroById(req, res) {
    if (!/^\d+$/.test(req.params.heroId)) {
        return res.status(400).json({ message: 'Hero ID must be numeric' });
    }

    try {
        const hero = await heroesService.getHeroById(req.params.heroId);
        return res.status(200).json(hero);
    } catch (err) {
        return res.status(err.status || 503).json({
            message: err.status === 404 ? 'Hero not found' : 'Hero details are temporarily unavailable',
        });
=======
export async function getHeroById(req, res, next){
    try {
        const hero = await heroesService.getHeroById(req.params.id);
        res.status(200).json(hero);
    } catch (err){
        next();
>>>>>>> origin/main
    }
}