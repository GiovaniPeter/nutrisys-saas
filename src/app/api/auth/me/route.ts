import { getCurrentUser } from "@/lib/session";
import { json } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return json({ user: null });
  }

  return json({ user });
}
