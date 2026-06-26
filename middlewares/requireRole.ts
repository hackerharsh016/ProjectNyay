import { requireAuth } from "./requireAuth";
import { RoleService } from "../modules/role/role.service";
import { NextResponse } from "next/server";

type Handler = (req: Request, ...args: unknown[]) => Promise<Response> | Response;

/**
 * HOF to wrap an API route handler with RBAC validation.
 * @param requirement Must be "role:ROLENAME" or "perm:permission_name"
 * @param handler The Next.js API route handler
 */
export function requireRole(requirement: string, handler: Handler): Handler {
  return async (req: Request, ...args: unknown[]) => {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const hasAccess = await RoleService.evaluateAccess(session.user!.id as string, requirement);
      if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return handler(req, ...args);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  };
}
