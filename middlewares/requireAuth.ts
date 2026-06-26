import { auth } from "../../../../lib/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return null;
  }
  return session;
}
