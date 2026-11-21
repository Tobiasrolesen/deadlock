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
