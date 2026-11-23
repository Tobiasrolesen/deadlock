import * as patchnotesService from '../services/patchnotesService.js';

export async function getPatchnotes(req, res, next) {
    try {
        const patchnotes = await patchnotesService.getPatchnotes();
        res.status(200).json(patchnotes);
    } catch (err){
        next();
    }
}

