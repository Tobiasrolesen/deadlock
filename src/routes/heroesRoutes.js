import { Router } from 'express';
import * as heroesController from '../controllers/heroesController.js';

const router = Router();

<<<<<<< HEAD
router.get('/heroes', heroesController.getHeroScoreboard);
router.get('/heroes/:heroId', heroesController.getHeroById);
=======
router.get('/:id', heroesController.getHeroById)
>>>>>>> origin/main

export default router;