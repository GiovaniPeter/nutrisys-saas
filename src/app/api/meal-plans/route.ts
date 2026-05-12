import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const mealItemSchema = z.object({
  foodName: z.string().min(1),
  portion: z.string().min(1),
  quantity: z.coerce.number().positive(),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
  notes: z.string().optional()
});

const mealSchema = z.object({
  type: z.string().min(1),
  label: z.string().min(1),
  time: z.string().optional(),
  position: z.coerce.number().int().min(0).default(0),
  items: z.array(mealItemSchema).default([])
});

const mealPlanSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente."),
  name: z.string().min(2, "Informe o nome do plano alimentar."),
  targetCalories: z.coerce.number().int().positive().optional(),
  targetProtein: z.coerce.number().min(0).optional(),
  targetCarbs: z.coerce.number().min(0).optional(),
  targetFat: z.coerce.number().min(0).optional(),
  observations: z.string().optional(),
  publish: z.boolean().default(false),
  meals: z.array(mealSchema).default([])
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  const patientId = request.nextUrl.searchParams.get("patientId") || undefined;

  const mealPlans = await prisma.mealPlan.findMany({
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

  return json({ mealPlans });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  try {
    const input = mealPlanSchema.parse(await request.json());
    const patient = await prisma.patient.findFirst({
      where: {
        id: input.patientId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!patient) {
      return error("Paciente não encontrado.", 404);
    }

    const mealPlan = await prisma.mealPlan.create({
      data: {
        organizationId: user.organizationId,
        patientId: input.patientId,
        name: input.name,
        targetCalories: input.targetCalories,
        targetProtein: input.targetProtein,
        targetCarbs: input.targetCarbs,
        targetFat: input.targetFat,
        observations: input.observations || null,
        publishedAt: input.publish ? new Date() : null,
        meals: {
          create: input.meals.map((meal) => ({
            type: meal.type,
            label: meal.label,
            time: meal.time || null,
            position: meal.position,
            items: {
              create: meal.items.map((item) => ({
                foodName: item.foodName,
                portion: item.portion,
                quantity: item.quantity,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat,
                notes: item.notes || null
              }))
            }
          }))
        }
      },
      include: {
        meals: {
          include: {
            items: true
          }
        }
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "meal_plan.created",
      entity: "MealPlan",
      entityId: mealPlan.id
    });

    return json({ mealPlan }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
