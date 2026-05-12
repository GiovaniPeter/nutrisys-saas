import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const bodyRecordSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente."),
  date: z.string().datetime("Informe uma data valida."),
  weightKg: z.coerce.number().positive().optional(),
  bodyFatPct: z.coerce.number().min(0).max(100).optional(),
  waistCm: z.coerce.number().positive().optional(),
  hipCm: z.coerce.number().positive().optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const patientId = request.nextUrl.searchParams.get("patientId") || undefined;

  const records = await prisma.bodyRecord.findMany({
    where: {
      patient: {
        organizationId: user.organizationId,
        ...(patientId ? { id: patientId } : {})
      }
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { date: "desc" }
  });

  return json({ records });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = bodyRecordSchema.parse(await request.json());
    const patient = await prisma.patient.findFirst({
      where: {
        id: input.patientId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!patient) {
      return error("Paciente nao encontrado.", 404);
    }

    const record = await prisma.bodyRecord.create({
      data: {
        patientId: input.patientId,
        date: new Date(input.date),
        weightKg: input.weightKg,
        bodyFatPct: input.bodyFatPct,
        waistCm: input.waistCm,
        hipCm: input.hipCm,
        notes: input.notes || null
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
      action: "body_record.created",
      entity: "BodyRecord",
      entityId: record.id
    });

    return json({ record }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
