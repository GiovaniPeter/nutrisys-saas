import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const goalUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  target: z.coerce.number().positive().optional(),
  current: z.coerce.number().min(0).optional(),
  unit: z.string().optional(),
  dueDate: z.string().datetime().optional().or(z.literal(""))
});

type Params = { params: { goalId: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) return error("Nao autenticado.", 401);

  try {
    const input = goalUpdateSchema.parse(await request.json());
    const existing = await prisma.patientGoal.findFirst({
      where: { id: params.goalId, organizationId: user.organizationId },
      select: { id: true, target: true, current: true }
    });

    if (!existing) return error("Meta nao encontrada.", 404);

    const nextTarget = input.target ?? Number(existing.target);
    const nextCurrent = input.current ?? Number(existing.current);
    const goal = await prisma.patientGoal.update({
      where: { id: params.goalId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.target !== undefined ? { target: input.target } : {}),
        ...(input.current !== undefined ? { current: input.current } : {}),
        ...(input.unit !== undefined ? { unit: input.unit || null } : {}),
        ...(input.dueDate !== undefined ? { dueDate: input.dueDate ? new Date(input.dueDate) : null } : {}),
        completedAt: nextCurrent >= nextTarget ? new Date() : null
      },
      include: { patient: { select: { id: true, name: true } } }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "patient_goal.updated",
      entity: "PatientGoal",
      entityId: goal.id
    });

    return json({ goal });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) return error("Nao autenticado.", 401);

  const existing = await prisma.patientGoal.findFirst({
    where: { id: params.goalId, organizationId: user.organizationId },
    select: { id: true }
  });

  if (!existing) return error("Meta nao encontrada.", 404);

  await prisma.patientGoal.delete({ where: { id: params.goalId } });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "patient_goal.deleted",
    entity: "PatientGoal",
    entityId: params.goalId
  });

  return json({ ok: true });
}
