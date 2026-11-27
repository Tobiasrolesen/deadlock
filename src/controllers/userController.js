import * as userService from "../services/userService.js";

//gentagen funktion til at hente sine egne helte
async function getYourHeroes(req, res, serviceFunction, errorMessage){
    try {
        const heroList = await serviceFunction(req.params.id);

        return res.status(200).json(heroList);
    } catch (err){
        console.log(err);
        return res.status(503).json({
            message: errorMessage
        });
    }
}

//samme som ovenover men så det gælder for både userId og heroId
async function getSpecificHero(req, res, serviceFunction, errorMessage, ...args){
    try {
        const heroData = await serviceFunction(req.params.id, ...args);

        return res.status(200).json(heroData);
    } catch (err){
        console.log(err);
        return res.status(503).json({
            message: errorMessage
        });
    }
}



export async function getUserById(req, res) {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
        return res.status(404).send({
            message: "User Not Found",
        });
    }
    return res.status(200).json(user);
}

export async function getUserByName(req, res){
    const user = await userService.getUserByName(req.params.name);
    if (!user){
        return res.status(404).send({
            message: "User Not Found",
        });
    }
    return res.status(200).json(user);
}

export async function getHeroStatsByUserId(req, res){
    const user = await userService.getHeroStatsByUserId(req.params.id);
    if (!user){
        return res.status(404).send({
            message: "No stats were found"
        })
    }
    return res.status(200).json(user)
}

export async function getPlayedHeroes(req, res){
    return getYourHeroes(
        req,
        res,
        userService.getPlayedHeroes,
        "Could not load played heroes"
    );
}

export async function getHeroesByWins(req, res){
    return getYourHeroes(
        req,
        res,
        userService.getHeroesByWins,
        "Could not load played heroes sorted by wins"
    );
}

export async function getHeroesByMatches(req, res){
    return getYourHeroes(
        req,
        res,
        userService.getHeroesByMatches,
        "Could not load played heroes sorted by matches"
    );
}

export async function getHeroesByKills(req, res){
    return getYourHeroes(
        req,
        res,
        userService.getHeroesByKills,
        "Could not load played heroes sorted by kills"
    );
}

export async function getHeroesByDeaths(req, res){
    return getYourHeroes(
        req,
        res,
        userService.getHeroesByDeaths,
        "Could not load played heroes sorted by deaths"
    );
}

export async function getSpecificHeroOfUser(req, res){
    return getSpecificHero(
        req,
        res,
        userService.getSpecificHeroOfUser,
        "Could not load stats for this hero",
        req.params.heroId
    );
}

export async function getHerosMatchesOfUser(req, res){
    return getSpecificHero(
        req,
        res,
        userService.getHerosMatchesOfUser,
        "Could not load matches for this hero",
        req.params.heroId
    )
}

export async function getMatchHistoryByUserId(req, res){
    const user = await userService.getMatchHistoryByUserId(req.params.id);
    if (!user){
        return res.status(404).send({
            message: "No matches were found"
        })
    }
    return res.status(200).json(user);
}
