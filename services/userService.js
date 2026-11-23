import * as userRepository from "../repository/userRepository.js";

export async function getUserById(id) {
    return await userRepository.getUserById(id);
}
