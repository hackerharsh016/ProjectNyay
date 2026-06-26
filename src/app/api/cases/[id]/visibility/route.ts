import { NextResponse } from "next/server";
import { CaseService } from "../../../../../../modules/case/case.service";
import { requireRole } from "../../../../../../middlewares/requireRole";
import { requireAuth } from "../../../../../../middlewares/requireAuth";
import { updateVisibilitySchema } from "../../../../../../modules/case/case.validators";

export const PATCH = requireRole("perm:case:approve", async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateVisibilitySchema.parse(body);
    const updated = await CaseService.updateVisibility(id, session.user!.id as string, data);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
