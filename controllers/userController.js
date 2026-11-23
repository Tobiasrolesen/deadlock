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
