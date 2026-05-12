import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const bodyRecordUpdateSchema = z.object({
  date: z.string().datetime("Informe uma data valida.").optional(),
  weightKg: z.coerce.number().positive().optional(),
  bodyFatPct: z.coerce.number().min(0).max(100).optional(),
  waistCm: z.coerce.number().positive().optional(),
  hipCm: z.coerce.number().positive().optional(),
  notes: z.string().optional()
});

type Params = {
  params: {
    bodyRecordId: string;
  };
};

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const record = await prisma.bodyRecord.findFirst({
    where: {
      id: params.bodyRecordId,
      patient: {
        organizationId: user.organizationId
      }
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!record) {
    return error("Registro corporal nao encontrado.", 404);
  }

  return json({ record });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = bodyRecordUpdateSchema.parse(await request.json());
    const existing = await prisma.bodyRecord.findFirst({
      where: {
        id: params.bodyRecordId,
        patient: {
          organizationId: user.organizationId
        }
      },
      select: { id: true }
    });

    if (!existing) {
      return error("Registro corporal nao encontrado.", 404);
    }

    const record = await prisma.bodyRecord.update({
      where: { id: params.bodyRecordId },
      data: {
        ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
        ...(input.weightKg !== undefined ? { weightKg: input.weightKg } : {}),
        ...(input.bodyFatPct !== undefined ? { bodyFatPct: input.bodyFatPct } : {}),
        ...(input.waistCm !== undefined ? { waistCm: input.waistCm } : {}),
        ...(input.hipCm !== undefined ? { hipCm: input.hipCm } : {}),
        ...(input.notes !== undefined ? { notes: input.notes || null } : {})
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "body_record.updated",
      entity: "BodyRecord",
      entityId: record.id
    });

    return json({ record });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const existing = await prisma.bodyRecord.findFirst({
    where: {
      id: params.bodyRecordId,
      patient: {
        organizationId: user.organizationId
      }
    },
    select: { id: true }
  });

  if (!existing) {
    return error("Registro corporal nao encontrado.", 404);
  }

  await prisma.bodyRecord.delete({
    where: { id: params.bodyRecordId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "body_record.deleted",
    entity: "BodyRecord",
    entityId: params.bodyRecordId
  });

  return json({ ok: true });
}
