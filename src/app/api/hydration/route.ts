import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const hydrationSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente."),
  date: z.string().datetime("Informe uma data valida."),
  time: z.string().optional(),
  amountMl: z.coerce.number().int().positive().max(5000)
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) return error("Nao autenticado.", 401);

  const patientId = request.nextUrl.searchParams.get("patientId") || undefined;
  const date = request.nextUrl.searchParams.get("date") || undefined;

  const logs = await prisma.hydrationLog.findMany({
    where: {
      organizationId: user.organizationId,
      ...(patientId ? { patientId } : {}),
      ...(date ? { date: new Date(`${date.slice(0, 10)}T00:00:00.000`) } : {})
    },
    include: { patient: { select: { id: true, name: true, weightKg: true } } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }]
  });

  return json({ logs });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) return error("Nao autenticado.", 401);

  try {
    const input = hydrationSchema.parse(await request.json());
    const patient = await prisma.patient.findFirst({
      where: { id: input.patientId, organizationId: user.organizationId },
      select: { id: true }
    });

    if (!patient) return error("Paciente nao encontrado.", 404);

    const log = await prisma.hydrationLog.create({
      data: {
        organizationId: user.organizationId,
        patientId: input.patientId,
        date: new Date(`${input.date.slice(0, 10)}T00:00:00.000`),
        time: input.time || null,
        amountMl: input.amountMl
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "hydration.created",
      entity: "HydrationLog",
      entityId: log.id
    });

    return json({ log }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
