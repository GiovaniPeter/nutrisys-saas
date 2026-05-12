import { getCurrentUser } from "@/lib/session";
import { error, json } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  return json({ user });
}
