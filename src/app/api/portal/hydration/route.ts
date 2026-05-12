import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { error, json, validationError } from "@/lib/api";
import { getCurrentPortalPatient } from "@/lib/patient-session";

const hydrationSchema = z.object({
  amountMl: z.coerce.number().int().positive().max(5000),
  date: z.string().datetime().optional(),
  time: z.string().optional()
});

export async function GET() {
  const patient = await getCurrentPortalPatient();

  if (!patient) return error("Nao autenticado.", 401);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const logs = await prisma.hydrationLog.findMany({
    where: { patientId: patient.id, organizationId: patient.organizationId, date: today },
    orderBy: { createdAt: "desc" }
  });

  return json({ logs });
}

export async function POST(request: Request) {
  const patient = await getCurrentPortalPatient();

  if (!patient) return error("Nao autenticado.", 401);

  try {
    const input = hydrationSchema.parse(await request.json());
    const date = input.date ? new Date(`${input.date.slice(0, 10)}T00:00:00.000`) : new Date();
    date.setHours(0, 0, 0, 0);
    const now = new Date();
    const time = input.time || `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const log = await prisma.hydrationLog.create({
      data: {
        organizationId: patient.organizationId,
        patientId: patient.id,
        date,
        time,
        amountMl: input.amountMl
      }
    });

    return json({ log }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
