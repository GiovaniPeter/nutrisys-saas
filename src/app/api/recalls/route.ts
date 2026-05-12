import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const recallItemSchema = z.object({
  foodId: z.string().optional(),
  foodName: z.string().min(1, "Informe o alimento."),
  portion: z.string().optional(),
  quantity: z.coerce.number().positive(),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
  fiber: z.coerce.number().min(0).optional(),
  notes: z.string().optional()
});

const recallMealSchema = z.object({
  type: z.string().min(1),
  label: z.string().min(1),
  time: z.string().optional(),
  position: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(recallItemSchema).default([])
});

const recallSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente."),
  referenceDate: z.string().optional(),
  generalNotes: z.string().optional(),
  meals: z.array(recallMealSchema).default([])
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const patientId = request.nextUrl.searchParams.get("patientId") || undefined;

  const recalls = await prisma.recall.findMany({
    where: {
      organizationId: user.organizationId,
      ...(patientId ? { patientId } : {})
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true
        }
      },
      meals: {
        orderBy: { position: "asc" },
        include: {
          items: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return json({ recalls });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = recallSchema.parse(await request.json());
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

    const meals = input.meals.filter((meal) => meal.items.length > 0);

    if (meals.length === 0) {
      return error("Adicione pelo menos um alimento ao recordatorio.", 400);
    }

    const recall = await prisma.recall.create({
      data: {
        organizationId: user.organizationId,
        patientId: input.patientId,
        referenceDate: input.referenceDate ? new Date(`${input.referenceDate.slice(0, 10)}T00:00:00.000`) : null,
        generalNotes: input.generalNotes || null,
        meals: {
          create: meals.map((meal, index) => ({
            type: meal.type,
            label: meal.label,
            time: meal.time || null,
            position: meal.position ?? index,
            notes: meal.notes || null,
            items: {
              create: meal.items.map((item) => ({
                foodId: item.foodId || null,
                foodName: item.foodName,
                portion: item.portion || "",
                quantity: item.quantity,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat,
                fiber: item.fiber,
                notes: item.notes || null
              }))
            }
          }))
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        },
        meals: {
          orderBy: { position: "asc" },
          include: {
            items: true
          }
        }
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "recall.created",
      entity: "Recall",
      entityId: recall.id
    });

    return json({ recall }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
