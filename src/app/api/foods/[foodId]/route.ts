import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const foodUpdateSchema = z.object({
  name: z.string().min(2, "Informe o nome do alimento.").optional(),
  portion: z.string().min(1, "Informe a porcao.").optional(),
  householdMeasure: z.string().optional(),
  calories: z.coerce.number().min(0).optional(),
  protein: z.coerce.number().min(0).optional(),
  carbs: z.coerce.number().min(0).optional(),
  fat: z.coerce.number().min(0).optional(),
  fiber: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
  source: z.string().optional()
});

type Params = {
  params: {
    foodId: string;
  };
};

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const food = await prisma.food.findFirst({
    where: {
      id: params.foodId,
      OR: [{ organizationId: null }, { organizationId: user.organizationId }]
    }
  });

  if (!food) {
    return error("Alimento nao encontrado.", 404);
  }

  return json({ food });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = foodUpdateSchema.parse(await request.json());
    const existing = await prisma.food.findFirst({
      where: {
        id: params.foodId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!existing) {
      return error("Apenas alimentos personalizados da clinica podem ser editados.", 403);
    }

    const food = await prisma.food.update({
      where: { id: params.foodId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.portion !== undefined ? { portion: input.portion } : {}),
        ...(input.householdMeasure !== undefined ? { householdMeasure: input.householdMeasure || null } : {}),
        ...(input.calories !== undefined ? { calories: input.calories } : {}),
        ...(input.protein !== undefined ? { protein: input.protein } : {}),
        ...(input.carbs !== undefined ? { carbs: input.carbs } : {}),
        ...(input.fat !== undefined ? { fat: input.fat } : {}),
        ...(input.fiber !== undefined ? { fiber: input.fiber } : {}),
        ...(input.category !== undefined ? { category: input.category || null } : {}),
        ...(input.source !== undefined ? { source: input.source || "custom" } : {})
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "food.updated",
      entity: "Food",
      entityId: food.id
    });

    return json({ food });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const existing = await prisma.food.findFirst({
    where: {
      id: params.foodId,
      organizationId: user.organizationId
    },
    select: { id: true }
  });

  if (!existing) {
    return error("Apenas alimentos personalizados da clinica podem ser excluidos.", 403);
  }

  await prisma.food.delete({
    where: { id: params.foodId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "food.deleted",
    entity: "Food",
    entityId: params.foodId
  });

  return json({ ok: true });
}
