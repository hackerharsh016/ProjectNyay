import { NextResponse } from "next/server";
import { CaseService } from "../../../../modules/case/case.service";
import { requireRole } from "../../../../middlewares/requireRole";
import { createCaseSchema } from "../../../../modules/case/case.validators";
import { requireAuth } from "../../../../middlewares/requireAuth";

export async function GET() {
  const cases = await CaseService.list();
  return NextResponse.json(cases);
}

export const POST = requireRole("perm:case:create", async (req: Request) => {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createCaseSchema.parse(body);
    const newCase = await CaseService.create(session.user!.id as string, data);
    return NextResponse.json(newCase, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
