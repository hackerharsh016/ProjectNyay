import prisma from "../../src/lib/prisma";

export class ReportService {
  static async createReport(userId: string, targetType: "Video", targetId: string, reason: string) {
    return prisma.report.create({
      data: {
        reporterId: userId,
        targetType,
        targetId,
        reason
      }
    });
  }
}
