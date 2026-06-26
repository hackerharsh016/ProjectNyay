import { NextResponse } from "next/server";
import { requireAuth } from "../../../../../middlewares/requireAuth";
import { UserService } from "../../../../../modules/user/user.service";
import { updateProfileSchema } from "../../../../../modules/user/user.validators";

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await UserService.getUserById(session.user!.id as string);
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.parse(body);
    const updated = await UserService.updateProfile(session.user!.id as string, parsed);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
