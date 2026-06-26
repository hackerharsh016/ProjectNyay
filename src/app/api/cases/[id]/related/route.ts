import { NextResponse } from "next/server";
import { CaseService } from "../../../../../../modules/case/case.service";
import { requireRole } from "../../../../../../middlewares/requireRole";
import { z } from "zod";

const relationSchema = z.object({
  relatedCaseId: z.string().uuid()
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const related = await CaseService.getRelatedCases(id);
  return NextResponse.json(related);
}

export const POST = requireRole("perm:case:update", async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { relatedCaseId } = relationSchema.parse(body);
    const link = await CaseService.linkCases(id, relatedCaseId);
    return NextResponse.json(link, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});

export const DELETE = requireRole("perm:case:update", async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { relatedCaseId } = relationSchema.parse(body);
    await CaseService.unlinkCases(id, relatedCaseId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
