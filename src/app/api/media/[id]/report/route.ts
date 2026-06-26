import { NextResponse } from "next/server";
import { ReportService } from "../../../../../../modules/report/report.service";
import { requireAuth } from "../../../../../../middlewares/requireAuth";
import { reportSchema } from "../../../../../../modules/media/media.validators";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { reason } = reportSchema.parse(body);
    const report = await ReportService.createReport(session.user!.id as string, "Video", id, reason);
    return NextResponse.json(report, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
