import { NextResponse } from "next/server";
import { MediaService } from "../../../../../modules/media/media.service";
import { requireRole } from "../../../../../middlewares/requireRole";
import { uploadUrlSchema } from "../../../../../modules/media/media.validators";

export const POST = requireRole("perm:media:create", async (req: Request) => {
  try {
    const body = await req.json();
    const { filename, contentType } = uploadUrlSchema.parse(body);
    const result = await MediaService.getUploadUrl(filename, contentType);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
