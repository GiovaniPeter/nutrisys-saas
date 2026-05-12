import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const anamnesisSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente."),
  type: z.string().min(2, "Informe o tipo da anamnese."),
  answers: z.record(z.unknown())
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const patientId = request.nextUrl.searchParams.get("patientId") || undefined;

  const anamneses = await prisma.anamnesis.findMany({
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
    orderBy: { createdAt: "desc" }
  });

  return json({ anamneses });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = anamnesisSchema.parse(await request.json());
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

    const anamnesis = await prisma.anamnesis.create({
      data: {
        patientId: input.patientId,
        type: input.type,
        answers: input.answers as Prisma.InputJsonValue
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
      action: "anamnesis.created",
      entity: "Anamnesis",
      entityId: anamnesis.id
    });

    return json({ anamnesis }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
