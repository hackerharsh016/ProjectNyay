import { NextResponse } from "next/server";
import { UserService } from "../../../../../modules/user/user.service";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await UserService.getUserById(params.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}
