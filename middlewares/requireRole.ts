import { requireAuth } from "./requireAuth";
import { RoleService } from "../modules/role/role.service";
import { NextResponse } from "next/server";

type Handler<T = unknown> = (req: Request, context: T) => Promise<Response> | Response;

/**
 * HOF to wrap an API route handler with RBAC validation.
 * @param requirement Must be "role:ROLENAME" or "perm:permission_name"
 * @param handler The Next.js API route handler
 */
export function requireRole<T = unknown>(requirement: string, handler: Handler<T>): Handler<T> {
  return async (req: Request, context: T) => {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const hasAccess = await RoleService.evaluateAccess(session.user!.id as string, requirement);
      if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return handler(req, context);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  };
}
