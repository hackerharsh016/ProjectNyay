import { auth } from "../src/lib/auth";


export async function requireAuth() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return null;
  }
  return session;
}
