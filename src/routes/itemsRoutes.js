import {Router} from 'express';
const router = Router();

import * as itemsController from '../controllers/itemsController.js'

router.get('/', itemsController.getAllItems);
router.get('/hero/:id', itemsController.getItemByHeroId);
router.get('/slot/:slot_type', itemsController.getItemBySlotType); //can be weapon, spirit or vitality.
router.get('/type/:type', itemsController.getItemByType); //can be ability, weapon or upgrade.
router.get('/:id', itemsController.getItemById);

export default router;