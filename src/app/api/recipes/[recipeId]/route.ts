import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const ingredientSchema = z.object({
  foodId: z.string().optional(),
  foodName: z.string().min(1),
  portion: z.string().optional(),
  quantity: z.coerce.number().positive(),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
  fiber: z.coerce.number().min(0).optional(),
  position: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional()
});

const recipeUpdateSchema = z.object({
  name: z.string().min(2, "Informe o nome da receita.").optional(),
  category: z.string().optional(),
  prepTimeMin: z.coerce.number().int().positive().optional(),
  servings: z.coerce.number().int().positive().optional(),
  difficulty: z.string().optional(),
  tags: z.array(z.string()).optional(),
  steps: z.array(z.string()).optional(),
  notes: z.string().optional(),
  ingredients: z.array(ingredientSchema).min(1, "Adicione pelo menos um ingrediente.").optional()
});

type Params = {
  params: {
    recipeId: string;
  };
};

const recipeInclude = {
  ingredients: {
    orderBy: { position: "asc" as const }
  }
};

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const recipe = await prisma.recipe.findFirst({
    where: {
      id: params.recipeId,
      organizationId: user.organizationId
    },
    include: recipeInclude
  });

  if (!recipe) {
    return error("Receita nao encontrada.", 404);
  }

  return json({ recipe });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = recipeUpdateSchema.parse(await request.json());
    const existing = await prisma.recipe.findFirst({
      where: {
        id: params.recipeId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!existing) {
      return error("Receita nao encontrada.", 404);
    }

    const recipe = await prisma.$transaction(async (tx) => {
      if (input.ingredients) {
        await tx.recipeIngredient.deleteMany({
          where: { recipeId: params.recipeId }
        });
      }

      return tx.recipe.update({
        where: { id: params.recipeId },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.category !== undefined ? { category: input.category || null } : {}),
          ...(input.prepTimeMin !== undefined ? { prepTimeMin: input.prepTimeMin } : {}),
          ...(input.servings !== undefined ? { servings: input.servings } : {}),
          ...(input.difficulty !== undefined ? { difficulty: input.difficulty || null } : {}),
          ...(input.tags !== undefined ? { tags: input.tags } : {}),
          ...(input.steps !== undefined ? { steps: input.steps.filter(Boolean) } : {}),
          ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
          ...(input.ingredients
            ? {
                ingredients: {
                  create: input.ingredients.map((ingredient, index) => ({
                    foodId: ingredient.foodId || null,
                    foodName: ingredient.foodName,
                    portion: ingredient.portion || "",
                    quantity: ingredient.quantity,
                    calories: ingredient.calories,
                    protein: ingredient.protein,
                    carbs: ingredient.carbs,
                    fat: ingredient.fat,
                    fiber: ingredient.fiber,
                    position: ingredient.position ?? index,
                    notes: ingredient.notes || null
                  }))
                }
              }
            : {})
        },
        include: recipeInclude
      });
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "recipe.updated",
      entity: "Recipe",
      entityId: recipe.id
    });

    return json({ recipe });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const existing = await prisma.recipe.findFirst({
    where: {
      id: params.recipeId,
      organizationId: user.organizationId
    },
    select: { id: true }
  });

  if (!existing) {
    return error("Receita nao encontrada.", 404);
  }

  await prisma.recipe.delete({
    where: { id: params.recipeId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "recipe.deleted",
    entity: "Recipe",
    entityId: params.recipeId
  });

  return json({ ok: true });
}
