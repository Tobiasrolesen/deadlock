import * as userModel from "../models/user.js";

export async function getUserById(id) {
    return await userModel.fetchSteamUsers(id);
}
