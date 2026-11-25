import * as userService from "../services/userService.js";

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
    try {
        const heroList = await userService.getPlayedHeroes(req.params.id);

        return res.status(200).json(heroList);

    } catch (err) {
        console.log(err);

        return res.status(503).json({
            message: "Kunne ikke hente brugerens helte"
        });
    }
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
