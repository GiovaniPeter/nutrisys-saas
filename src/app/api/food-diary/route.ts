import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const entrySchema = z.object({
  patientId: z.string().min(1, "Informe o paciente."),
  mealType: z.string().min(1, "Informe a refeicao."),
  entryDate: z.string().datetime("Informe uma data valida."),
  entryTime: z.string().optional(),
  description: z.string().min(3, "Descreva a refeicao."),
  photoUrl: z.string().url().optional().or(z.literal(""))
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const patientId = request.nextUrl.searchParams.get("patientId") || undefined;
  const status = request.nextUrl.searchParams.get("status") || undefined;

  const entries = await prisma.foodDiaryEntry.findMany({
    where: {
      organizationId: user.organizationId,
      ...(patientId ? { patientId } : {}),
      ...(status && status !== "ALL" ? { status: status as "PENDING" | "APPROVED" | "NEEDS_ADJUSTMENT" } : {})
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }]
  });

  return json({ entries });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = entrySchema.parse(await request.json());
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

    const entry = await prisma.foodDiaryEntry.create({
      data: {
        organizationId: user.organizationId,
        patientId: input.patientId,
        mealType: input.mealType,
        entryDate: new Date(input.entryDate),
        entryTime: input.entryTime || null,
        description: input.description,
        photoUrl: input.photoUrl || null
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
      action: "food_diary.created_by_professional",
      entity: "FoodDiaryEntry",
      entityId: entry.id
    });

    return json({ entry }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
