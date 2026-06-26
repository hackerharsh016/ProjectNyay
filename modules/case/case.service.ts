import prisma from "../../src/lib/prisma";
import { CreateCaseInput, UpdateCaseInput, UpdateVisibilityInput } from "./case.validators";
import { CaseVisibility, CaseStatus } from "@prisma/client";

export class CaseService {
  static async list() {
    return prisma.case.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true, createdBy: { select: { id: true, username: true } } }
    });
  }

  static async getById(id: string) {
    return prisma.case.findUnique({
      where: { id },
      include: { category: true, createdBy: { select: { id: true, username: true } } }
    });
  }

  static async create(userId: string, data: CreateCaseInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } }
    });
    
    let visibility: CaseVisibility = CaseVisibility.PENDING;
    if (user) {
      const hasTrustedRole = user.roles.some(
        ur => ur.role.name === "REPORTER" || ur.role.name === "MODERATOR" || ur.role.name === "ADMIN"
      );
      if (hasTrustedRole) visibility = CaseVisibility.PUBLIC;
    }

    return prisma.case.create({
      data: {
        ...data,
        createdById: userId,
        visibility,
        status: CaseStatus.OPEN
      }
    });
  }

  static async update(id: string, data: UpdateCaseInput) {
    return prisma.case.update({ where: { id }, data });
  }

  static async updateVisibility(id: string, actorId: string, data: UpdateVisibilityInput) {
    const oldCase = await prisma.case.findUnique({ where: { id } });
    if (!oldCase) throw new Error("Case not found");

    const updated = await prisma.case.update({ where: { id }, data });

    // Write AuditLog row natively tracking status/visibility transitions
    await prisma.auditLog.create({
      data: {
        actorId,
        action: "case.visibility.changed",
        targetType: "Case",
        targetId: id,
        metadata: {
          old: {
            visibility: oldCase.visibility,
            status: oldCase.status
          },
          new: {
            visibility: updated.visibility,
            status: updated.status
          }
        }
      }
    });

    return updated;
  }

  static async linkCases(caseId: string, relatedCaseId: string) {
    if (caseId === relatedCaseId) throw new Error("Cannot link case to itself");
    
    const [c1, c2] = await Promise.all([
      prisma.case.findUnique({ where: { id: caseId } }),
      prisma.case.findUnique({ where: { id: relatedCaseId } })
    ]);
    if (!c1 || !c2) throw new Error("One or both cases do not exist");

    const existing = await prisma.caseRelation.findFirst({
      where: {
        OR: [
          { caseId, relatedCaseId },
          { caseId: relatedCaseId, relatedCaseId: caseId }
        ]
      }
    });

    if (existing) return existing;

    return prisma.caseRelation.create({
      data: { caseId, relatedCaseId }
    });
  }

  static async unlinkCases(caseId: string, relatedCaseId: string) {
    return prisma.caseRelation.deleteMany({
      where: {
        OR: [
          { caseId, relatedCaseId },
          { caseId: relatedCaseId, relatedCaseId: caseId }
        ]
      }
    });
  }

  static async getRelatedCases(caseId: string) {
    // Bidirectional merge
    const relations = await prisma.caseRelation.findMany({
      where: {
        OR: [
          { caseId },
          { relatedCaseId: caseId }
        ]
      },
      include: {
        case: { select: { id: true, title: true, status: true, visibility: true } },
        relatedCase: { select: { id: true, title: true, status: true, visibility: true } }
      }
    });

    return relations.map(rel => {
      if (rel.caseId === caseId) return rel.relatedCase;
      return rel.case;
    });
  }
}
