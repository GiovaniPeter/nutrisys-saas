import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const foodSchema = z.object({
  name: z.string().min(2, "Informe o nome do alimento."),
  portion: z.string().min(1, "Informe a porção."),
  householdMeasure: z.string().optional(),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
  fiber: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
  source: z.string().optional()
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  const search = request.nextUrl.searchParams.get("q")?.trim();
  const category = request.nextUrl.searchParams.get("category")?.trim();
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") || 200), 1000);

  const foods = await prisma.food.findMany({
    where: {
      OR: [{ organizationId: null }, { organizationId: user.organizationId }],
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(category ? { category } : {})
    },
    orderBy: [{ organizationId: "asc" }, { name: "asc" }],
    take: limit
  });

  const total = await prisma.food.count({
    where: {
      OR: [{ organizationId: null }, { organizationId: user.organizationId }],
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(category ? { category } : {})
    }
  });

  return json({ foods, total });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  try {
    const input = foodSchema.parse(await request.json());
    const food = await prisma.food.create({
      data: {
        organizationId: user.organizationId,
        name: input.name,
        portion: input.portion,
        householdMeasure: input.householdMeasure || null,
        calories: input.calories,
        protein: input.protein,
        carbs: input.carbs,
        fat: input.fat,
        fiber: input.fiber,
        category: input.category || null,
        source: input.source || "custom"
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "food.created",
      entity: "Food",
      entityId: food.id
    });

    return json({ food }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
