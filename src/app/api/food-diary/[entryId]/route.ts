import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const feedbackSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "NEEDS_ADJUSTMENT"]).optional(),
  feedbackNote: z.string().optional()
});

type Params = {
  params: {
    entryId: string;
  };
};

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = feedbackSchema.parse(await request.json());
    const existing = await prisma.foodDiaryEntry.findFirst({
      where: {
        id: params.entryId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!existing) {
      return error("Registro do diario nao encontrado.", 404);
    }

    const entry = await prisma.foodDiaryEntry.update({
      where: { id: params.entryId },
      data: {
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.feedbackNote !== undefined ? { feedbackNote: input.feedbackNote || null } : {}),
        feedbackAt: input.status && input.status !== "PENDING" ? new Date() : null
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
      action: "food_diary.feedback",
      entity: "FoodDiaryEntry",
      entityId: entry.id
    });

    return json({ entry });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const existing = await prisma.foodDiaryEntry.findFirst({
    where: {
      id: params.entryId,
      organizationId: user.organizationId
    },
    select: { id: true }
  });

  if (!existing) {
    return error("Registro do diario nao encontrado.", 404);
  }

  await prisma.foodDiaryEntry.delete({
    where: { id: params.entryId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "food_diary.deleted",
    entity: "FoodDiaryEntry",
    entityId: params.entryId
  });

  return json({ ok: true });
}
