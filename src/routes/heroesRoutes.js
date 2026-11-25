import { Router } from 'express';
import * as heroesController from '../controllers/heroesController.js';

const router = Router();

router.get('/:id', heroesController.getHeroById)

export default router;