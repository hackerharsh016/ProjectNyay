import prisma from "../../src/lib/prisma";

export class RoleService {
  /**
   * Evaluates if a user has a specific role or permission.
   * Requirement must be namespaced, e.g. "role:ADMIN" or "perm:case:approve".
   */
  static async evaluateAccess(userId: string, requirement: string): Promise<boolean> {
    if (!requirement.startsWith("role:") && !requirement.startsWith("perm:")) {
      throw new Error("Invalid requirement format. Must start with 'role:' or 'perm:'");
    }

    const isRoleCheck = requirement.startsWith("role:");
    const targetValue = requirement.substring(5);

    // Fetch user with their roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) return false;

    // Fast path: Global admin wildcard check
    const hasAdmin = user.roles.some((ur) => ur.role.name === 'ADMIN');
    if (hasAdmin) return true; // Admins have universal access

    if (isRoleCheck) {
      return user.roles.some((ur) => ur.role.name === targetValue);
    } else {
      // Permission check
      for (const ur of user.roles) {
        // Look for wildcard permission or exact match
        const hasPerm = ur.role.permissions.some(
          (rp) => rp.permission.name === "*" || rp.permission.name === targetValue
        );
        if (hasPerm) return true;
      }
      return false;
    }
  }
}
