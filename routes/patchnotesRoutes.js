import {Router } from 'express';
const router = Router();

import * as patchnotesController from '../controllers/patchnotesController.js'

router.get('/', patchnotesController.getPatchnotes);

export default router;