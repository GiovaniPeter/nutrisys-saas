import { NextRequest } from "next/server";
import { Sex } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const patientUpdateSchema = z.object({
  name: z.string().min(2, "Informe o nome do paciente.").optional(),
  email: z.string().email("Informe um e-mail válido.").optional().or(z.literal("")),
  phone: z.string().optional(),
  birthDate: z.string().datetime().optional().or(z.literal("")),
  sex: z.nativeEnum(Sex).optional(),
  heightCm: z.coerce.number().positive().optional(),
  weightKg: z.coerce.number().positive().optional(),
  goal: z.string().optional(),
  notes: z.string().optional(),
  lgpdConsent: z.boolean().optional()
});

type Params = {
  params: {
    patientId: string;
  };
};

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  const patient = await prisma.patient.findFirst({
    where: {
      id: params.patientId,
      organizationId: user.organizationId
    },
    include: {
      appointments: {
        orderBy: { startsAt: "desc" },
        take: 10
      },
      mealPlans: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    }
  });

  if (!patient) {
    return error("Paciente não encontrado.", 404);
  }

  return json({ patient });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  try {
    const input = patientUpdateSchema.parse(await request.json());
    const existing = await prisma.patient.findFirst({
      where: {
        id: params.patientId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!existing) {
      return error("Paciente não encontrado.", 404);
    }

    const patient = await prisma.patient.update({
      where: { id: params.patientId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.email !== undefined ? { email: input.email || null } : {}),
        ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
        ...(input.birthDate !== undefined ? { birthDate: input.birthDate ? new Date(input.birthDate) : null } : {}),
        ...(input.sex !== undefined ? { sex: input.sex } : {}),
        ...(input.heightCm !== undefined ? { heightCm: input.heightCm } : {}),
        ...(input.weightKg !== undefined ? { weightKg: input.weightKg } : {}),
        ...(input.goal !== undefined ? { goal: input.goal || null } : {}),
        ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
        ...(input.lgpdConsent !== undefined ? { lgpdConsentAt: input.lgpdConsent ? new Date() : null } : {})
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "patient.updated",
      entity: "Patient",
      entityId: patient.id
    });

    return json({ patient });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  const existing = await prisma.patient.findFirst({
    where: {
      id: params.patientId,
      organizationId: user.organizationId
    },
    select: { id: true }
  });

  if (!existing) {
    return error("Paciente não encontrado.", 404);
  }

  await prisma.patient.delete({
    where: { id: params.patientId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "patient.deleted",
    entity: "Patient",
    entityId: params.patientId
  });

  return json({ ok: true });
}
