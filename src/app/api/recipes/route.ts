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

const recipeSchema = z.object({
  name: z.string().min(2, "Informe o nome da receita."),
  category: z.string().optional(),
  prepTimeMin: z.coerce.number().int().positive().optional(),
  servings: z.coerce.number().int().positive().default(1),
  difficulty: z.string().optional(),
  tags: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
  notes: z.string().optional(),
  ingredients: z.array(ingredientSchema).min(1, "Adicione pelo menos um ingrediente.")
});

const recipeInclude = {
  ingredients: {
    orderBy: { position: "asc" as const }
  }
};

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const search = request.nextUrl.searchParams.get("q")?.trim();
  const category = request.nextUrl.searchParams.get("category")?.trim();
  const tag = request.nextUrl.searchParams.get("tag")?.trim();

  const recipes = await prisma.recipe.findMany({
    where: {
      organizationId: user.organizationId,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(category ? { category } : {}),
      ...(tag ? { tags: { has: tag } } : {})
    },
    include: recipeInclude,
    orderBy: { updatedAt: "desc" }
  });

  return json({ recipes });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = recipeSchema.parse(await request.json());
    const recipe = await prisma.recipe.create({
      data: {
        organizationId: user.organizationId,
        name: input.name,
        category: input.category || null,
        prepTimeMin: input.prepTimeMin,
        servings: input.servings,
        difficulty: input.difficulty || null,
        tags: input.tags,
        steps: input.steps.filter(Boolean),
        notes: input.notes || null,
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
      },
      include: recipeInclude
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "recipe.created",
      entity: "Recipe",
      entityId: recipe.id
    });

    return json({ recipe }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
