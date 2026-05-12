import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const goalSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente."),
  title: z.string().min(2, "Informe a meta."),
  target: z.coerce.number().positive(),
  current: z.coerce.number().min(0).default(0),
  unit: z.string().optional(),
  dueDate: z.string().datetime().optional().or(z.literal(""))
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) return error("Nao autenticado.", 401);

  const patientId = request.nextUrl.searchParams.get("patientId") || undefined;
  const goals = await prisma.patientGoal.findMany({
    where: { organizationId: user.organizationId, ...(patientId ? { patientId } : {}) },
    include: { patient: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" }
  });

  return json({ goals });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) return error("Nao autenticado.", 401);

  try {
    const input = goalSchema.parse(await request.json());
    const patient = await prisma.patient.findFirst({
      where: { id: input.patientId, organizationId: user.organizationId },
      select: { id: true }
    });

    if (!patient) return error("Paciente nao encontrado.", 404);

    const goal = await prisma.patientGoal.create({
      data: {
        organizationId: user.organizationId,
        patientId: input.patientId,
        title: input.title,
        target: input.target,
        current: input.current,
        unit: input.unit || null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        completedAt: input.current >= input.target ? new Date() : null
      },
      include: { patient: { select: { id: true, name: true } } }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "patient_goal.created",
      entity: "PatientGoal",
      entityId: goal.id
    });

    return json({ goal }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
