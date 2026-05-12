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

const recallUpdateSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente.").optional(),
  referenceDate: z.string().optional(),
  generalNotes: z.string().optional(),
  meals: z.array(recallMealSchema).optional()
});

type Params = {
  params: {
    recallId: string;
  };
};

const recallInclude = {
  patient: {
    select: {
      id: true,
      name: true
    }
  },
  meals: {
    orderBy: { position: "asc" as const },
    include: {
      items: true
    }
  }
};

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const recall = await prisma.recall.findFirst({
    where: {
      id: params.recallId,
      organizationId: user.organizationId
    },
    include: recallInclude
  });

  if (!recall) {
    return error("Recordatorio nao encontrado.", 404);
  }

  return json({ recall });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = recallUpdateSchema.parse(await request.json());
    const existing = await prisma.recall.findFirst({
      where: {
        id: params.recallId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!existing) {
      return error("Recordatorio nao encontrado.", 404);
    }

    if (input.patientId) {
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
    }

    const meals = input.meals?.filter((meal) => meal.items.length > 0);

    if (input.meals && (!meals || meals.length === 0)) {
      return error("Adicione pelo menos um alimento ao recordatorio.", 400);
    }

    const recall = await prisma.$transaction(async (tx) => {
      if (input.meals) {
        await tx.recallMeal.deleteMany({
          where: { recallId: params.recallId }
        });
      }

      return tx.recall.update({
        where: { id: params.recallId },
        data: {
          ...(input.patientId !== undefined ? { patientId: input.patientId } : {}),
          ...(input.referenceDate !== undefined
            ? { referenceDate: input.referenceDate ? new Date(`${input.referenceDate.slice(0, 10)}T00:00:00.000`) : null }
            : {}),
          ...(input.generalNotes !== undefined ? { generalNotes: input.generalNotes || null } : {}),
          ...(meals
            ? {
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
              }
            : {})
        },
        include: recallInclude
      });
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "recall.updated",
      entity: "Recall",
      entityId: recall.id
    });

    return json({ recall });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const existing = await prisma.recall.findFirst({
    where: {
      id: params.recallId,
      organizationId: user.organizationId
    },
    select: { id: true }
  });

  if (!existing) {
    return error("Recordatorio nao encontrado.", 404);
  }

  await prisma.recall.delete({
    where: { id: params.recallId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "recall.deleted",
    entity: "Recall",
    entityId: params.recallId
  });

  return json({ ok: true });
}
