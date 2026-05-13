import { db } from "../db";
import { User } from "../../types";

export class UserService {
  static async getUsers(): Promise<User[]> {
    return (await db.get("users")) || [];
  }

  static async getUserById(userId: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find((u) => u.userId === userId);
  }

  static async saveUsers(users: User[]): Promise<void> {
    await db.set("users", users);
  }
}
