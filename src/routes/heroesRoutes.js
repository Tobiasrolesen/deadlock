import { Router } from 'express';
import * as heroesController from '../controllers/heroesController.js';

const router = Router();

router.get('/heroes', heroesController.getHeroScoreboard);
router.get('/heroes/:heroId', heroesController.getHeroById);

export default router;