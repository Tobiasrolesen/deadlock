import { Router } from 'express';
import * as userController from "../controllers/userController.js";

const router = Router();

router.get("/:id", userController.getUserById);
router.get("/search/:name", userController.getUserByName);
router.get("/:id/hero-stats", userController.getHeroStatsByUserId);

router.get("/:id/herolist", userController.getPlayedHeroes);
router.get("/:id/herolist/sortedWins", userController.getHeroesByWins);
router.get("/:id/herolist/sortedMatches", userController.getHeroesByMatches);
router.get("/:id/herolist/sortedKills", userController.getHeroesByKills);
router.get("/:id/herolist/sortedDeaths", userController.getHeroesByDeaths);
router.get('/:id/herolist/:heroId', userController.getSpecificHeroOfUser);
router.get('/:id/herolist/:heroId/matches', userController.getHerosMatchesOfUser);

router.get("/:id/matches", userController.getMatchHistoryByUserId);

export default router;
