import { Router } from 'express';
import * as userController from "../controllers/userController.js";

const router = Router();

router.get("/:id", userController.getUserById);
router.get("/search/:name", userController.getUserByName);
router.get("/:id/hero-stats", userController.getHeroStatsByUserId);

export default router;
