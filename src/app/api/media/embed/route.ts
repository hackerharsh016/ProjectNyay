import { NextResponse } from "next/server";
import { MediaService } from "../../../../../modules/media/media.service";
import { requireRole } from "../../../../../middlewares/requireRole";
import { embedSchema } from "../../../../../modules/media/media.validators";
import { requireAuth } from "../../../../../middlewares/requireAuth";

export const POST = requireRole("perm:media:create", async (req: Request) => {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { caseId, sourceUrl, caption } = embedSchema.parse(body);
    const result = await MediaService.embedLink(session.user!.id as string, caseId, sourceUrl, caption);
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
