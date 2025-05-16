import { User } from "../interface/interface.ts";
import JsonReaderService from "./jsonReader.service.ts";

export default class UserService{
    static infoUsers = new JsonReaderService('src/database/users.json');

    static async getAllUsers(): Promise<User[]>{
        return await UserService.infoUsers.readJson();
    }

    static async findByUsername(username: string): Promise<User | undefined>{
        const users: User[] = await UserService.infoUsers.readJson();
        return users.find(user => user.username === username);
    }
}