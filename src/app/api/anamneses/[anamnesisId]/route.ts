import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const anamnesisUpdateSchema = z.object({
  type: z.string().min(2, "Informe o tipo da anamnese.").optional(),
  answers: z.record(z.unknown()).optional()
});

type Params = {
  params: {
    anamnesisId: string;
  };
};

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const anamnesis = await prisma.anamnesis.findFirst({
    where: {
      id: params.anamnesisId,
      patient: {
        organizationId: user.organizationId
      }
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

  if (!anamnesis) {
    return error("Anamnese nao encontrada.", 404);
  }

  return json({ anamnesis });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = anamnesisUpdateSchema.parse(await request.json());
    const existing = await prisma.anamnesis.findFirst({
      where: {
        id: params.anamnesisId,
        patient: {
          organizationId: user.organizationId
        }
      },
      select: { id: true }
    });

    if (!existing) {
      return error("Anamnese nao encontrada.", 404);
    }

    const anamnesis = await prisma.anamnesis.update({
      where: { id: params.anamnesisId },
      data: {
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.answers !== undefined ? { answers: input.answers as Prisma.InputJsonValue } : {})
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
      action: "anamnesis.updated",
      entity: "Anamnesis",
      entityId: anamnesis.id
    });

    return json({ anamnesis });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const existing = await prisma.anamnesis.findFirst({
    where: {
      id: params.anamnesisId,
      patient: {
        organizationId: user.organizationId
      }
    },
    select: { id: true }
  });

  if (!existing) {
    return error("Anamnese nao encontrada.", 404);
  }

  await prisma.anamnesis.delete({
    where: { id: params.anamnesisId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "anamnesis.deleted",
    entity: "Anamnesis",
    entityId: params.anamnesisId
  });

  return json({ ok: true });
}
