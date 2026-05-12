import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const mealPlanUpdateSchema = z.object({
  publish: z.boolean()
});

type Params = {
  params: {
    mealPlanId: string;
  };
};

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: params.mealPlanId,
      organizationId: user.organizationId
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

  if (!mealPlan) {
    return error("Plano alimentar não encontrado.", 404);
  }

  return json({ mealPlan });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = mealPlanUpdateSchema.parse(await request.json());
    const existing = await prisma.mealPlan.findFirst({
      where: {
        id: params.mealPlanId,
        organizationId: user.organizationId
      },
      select: {
        id: true,
        publishedAt: true
      }
    });

    if (!existing) {
      return error("Plano alimentar nao encontrado.", 404);
    }

    const mealPlan = await prisma.mealPlan.update({
      where: { id: params.mealPlanId },
      data: {
        publishedAt: input.publish ? existing.publishedAt || new Date() : null
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
      action: input.publish ? "meal_plan.published" : "meal_plan.unpublished",
      entity: "MealPlan",
      entityId: mealPlan.id
    });

    return json({ mealPlan });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  const existing = await prisma.mealPlan.findFirst({
    where: {
      id: params.mealPlanId,
      organizationId: user.organizationId
    },
    select: { id: true }
  });

  if (!existing) {
    return error("Plano alimentar não encontrado.", 404);
  }

  await prisma.mealPlan.delete({
    where: { id: params.mealPlanId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "meal_plan.deleted",
    entity: "MealPlan",
    entityId: params.mealPlanId
  });

  return json({ ok: true });
}
