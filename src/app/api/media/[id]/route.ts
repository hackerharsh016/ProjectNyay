import { NextResponse } from "next/server";
import { MediaService } from "../../../../../modules/media/media.service";
import { requireAuth } from "../../../../../middlewares/requireAuth";
import { RoleService } from "../../../../../modules/role/role.service";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await MediaService.getVideoById(id);
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(video);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const video = await MediaService.getVideoById(id);
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = video.uploaderId === session.user!.id;
  const hasDeletePerm = await RoleService.evaluateAccess(session.user!.id as string, "perm:media:delete");

  if (!isOwner && !hasDeletePerm) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await MediaService.deleteVideo(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
