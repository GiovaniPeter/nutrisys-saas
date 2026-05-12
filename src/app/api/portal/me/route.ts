import { error, json } from "@/lib/api";
import { getCurrentPortalPatient } from "@/lib/patient-session";

export async function GET() {
  const patient = await getCurrentPortalPatient();

  if (!patient) {
    return error("Nao autenticado.", 401);
  }

  return json({ patient });
}
