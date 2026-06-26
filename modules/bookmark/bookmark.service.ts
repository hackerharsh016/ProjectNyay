import prisma from "../../src/lib/prisma";

export class BookmarkService {
  static async toggleBookmark(userId: string, targetType: "Video", targetId: string) {
    const existing = await prisma.bookmark.findFirst({
      where: { userId, targetType, targetId }
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    } else {
      await prisma.bookmark.create({
        data: { userId, targetType, targetId }
      });
      return { bookmarked: true };
    }
  }

  static async removeBookmark(userId: string, targetType: "Video", targetId: string) {
    return prisma.bookmark.deleteMany({
      where: { userId, targetType, targetId }
    });
  }
}
