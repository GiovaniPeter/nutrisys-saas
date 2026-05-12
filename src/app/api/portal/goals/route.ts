import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { error, json, validationError } from "@/lib/api";
import { getCurrentPortalPatient } from "@/lib/patient-session";

const progressSchema = z.object({
  goalId: z.string().min(1),
  delta: z.coerce.number().default(1)
});

export async function GET() {
  const patient = await getCurrentPortalPatient();

  if (!patient) return error("Nao autenticado.", 401);

  const goals = await prisma.patientGoal.findMany({
    where: { patientId: patient.id, organizationId: patient.organizationId },
    orderBy: { createdAt: "desc" }
  });

  return json({ goals });
}

export async function PATCH(request: Request) {
  const patient = await getCurrentPortalPatient();

  if (!patient) return error("Nao autenticado.", 401);

  try {
    const input = progressSchema.parse(await request.json());
    const existing = await prisma.patientGoal.findFirst({
      where: { id: input.goalId, patientId: patient.id, organizationId: patient.organizationId },
      select: { id: true, current: true, target: true }
    });

    if (!existing) return error("Meta nao encontrada.", 404);

    const current = Math.max(0, Number(existing.current) + input.delta);
    const target = Number(existing.target);
    const goal = await prisma.patientGoal.update({
      where: { id: input.goalId },
      data: {
        current,
        completedAt: current >= target ? new Date() : null
      }
    });

    return json({ goal });
  } catch (err) {
    return validationError(err);
  }
}
