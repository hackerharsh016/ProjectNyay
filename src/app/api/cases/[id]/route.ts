import { NextResponse } from "next/server";
import { CaseService } from "../../../../../modules/case/case.service";
import { requireAuth } from "../../../../../middlewares/requireAuth";
import { updateCaseSchema } from "../../../../../modules/case/case.validators";
import { RoleService } from "../../../../../modules/role/role.service";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseItem = await CaseService.getById(id);
  if (!caseItem) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(caseItem);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const caseItem = await CaseService.getById(id);
  if (!caseItem) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = caseItem.createdById === session.user!.id;
  const hasUpdatePerm = await RoleService.evaluateAccess(session.user!.id as string, "perm:case:update");
  
  if (!isOwner && !hasUpdatePerm) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = updateCaseSchema.parse(body);
    const updated = await CaseService.update(id, data);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
