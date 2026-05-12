import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const userUpdateSchema = z.object({
  name: z.string().min(2, "Informe o nome.").optional(),
  role: z.nativeEnum(UserRole).optional(),
  crn: z.string().optional(),
  active: z.boolean().optional()
});

type Params = {
  params: {
    userId: string;
  };
};

export async function GET(_request: NextRequest, { params }: Params) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return error("Nao autenticado.", 401);
  }

  const user = await prisma.user.findFirst({
    where: {
      id: params.userId,
      organizationId: currentUser.organizationId
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      crn: true,
      active: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    return error("Usuario nao encontrado.", 404);
  }

  return json({ user });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return error("Nao autenticado.", 401);
  }

  if (!["OWNER", "ADMIN"].includes(currentUser.role)) {
    return error("Apenas owner/admin podem alterar usuarios.", 403);
  }

  try {
    const input = userUpdateSchema.parse(await request.json());
    const existing = await prisma.user.findFirst({
      where: {
        id: params.userId,
        organizationId: currentUser.organizationId
      },
      select: {
        id: true,
        role: true
      }
    });

    if (!existing) {
      return error("Usuario nao encontrado.", 404);
    }

    if (existing.id === currentUser.id && input.active === false) {
      return error("Voce nao pode desativar seu proprio usuario.", 422);
    }

    if (existing.role === UserRole.OWNER && input.role && input.role !== UserRole.OWNER) {
      return error("O owner principal nao pode perder o papel de owner por aqui.", 422);
    }

    const user = await prisma.user.update({
      where: { id: params.userId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.crn !== undefined ? { crn: input.crn || null } : {}),
        ...(input.active !== undefined ? { active: input.active } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        crn: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await audit({
      organizationId: currentUser.organizationId,
      userId: currentUser.id,
      action: "user.updated",
      entity: "User",
      entityId: user.id,
      metadata: {
        role: user.role,
        active: user.active
      }
    });

    return json({ user });
  } catch (err) {
    return validationError(err);
  }
}
