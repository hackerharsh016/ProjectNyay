import prisma from "../../src/lib/prisma";
import { UpdateProfileInput } from "./user.validators";

export class UserService {
  static async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        reputationScore: true,
        createdAt: true,
        roles: {
          include: { role: true }
        }
      },
    });
  }

  static async updateProfile(userId: string, data: UpdateProfileInput) {
    // If updating username, check uniqueness
    if (data.username) {
      const existing = await prisma.user.findUnique({ where: { username: data.username } });
      if (existing && existing.id !== userId) {
        throw new Error("Username already taken.");
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        bio: true,
        image: true,
        reputationScore: true,
      },
    });
  }
}
