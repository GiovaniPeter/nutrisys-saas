import { NextRequest } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const materialUpdateSchema = z.object({
  title: z.string().trim().min(2).optional(),
  category: z.string().trim().min(2).optional(),
  audience: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  designUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional()
});

export async function PATCH(request: NextRequest, { params }: { params: { materialId: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = materialUpdateSchema.parse(await request.json());
    const existing = await prisma.educationalMaterial.findFirst({
      where: {
        id: params.materialId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!existing) {
      return error("Material nao encontrado.", 404);
    }

    const material = await prisma.educationalMaterial.update({
      where: { id: params.materialId },
      data: {
        ...input,
        audience: input.audience || null,
        description: input.description || null,
        content: input.content || null,
        designUrl: input.designUrl || null,
        imageUrl: input.imageUrl || null
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "educational_material.updated",
      entity: "EducationalMaterial",
      entityId: material.id
    });

    return json({ material });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { materialId: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const existing = await prisma.educationalMaterial.findFirst({
    where: {
      id: params.materialId,
      organizationId: user.organizationId
    },
    select: { id: true }
  });

  if (!existing) {
    return error("Material nao encontrado.", 404);
  }

  await prisma.educationalMaterial.delete({
    where: { id: params.materialId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "educational_material.deleted",
    entity: "EducationalMaterial",
    entityId: params.materialId
  });

  return json({ ok: true });
}
