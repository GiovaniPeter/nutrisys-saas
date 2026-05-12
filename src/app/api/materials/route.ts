import { NextRequest } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const materialSchema = z.object({
  title: z.string().trim().min(2, "Informe o titulo."),
  category: z.string().trim().min(2, "Informe a categoria."),
  audience: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  designUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).default([])
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const search = request.nextUrl.searchParams.get("q")?.trim();
  const category = request.nextUrl.searchParams.get("category")?.trim();

  const materials = await prisma.educationalMaterial.findMany({
    where: {
      organizationId: user.organizationId,
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } }
            ]
          }
        : {})
    },
    orderBy: { createdAt: "desc" }
  });

  return json({ materials });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = materialSchema.parse(await request.json());
    const material = await prisma.educationalMaterial.create({
      data: {
        organizationId: user.organizationId,
        title: input.title,
        category: input.category,
        audience: input.audience || null,
        description: input.description || null,
        content: input.content || null,
        designUrl: input.designUrl || null,
        imageUrl: input.imageUrl || null,
        tags: input.tags
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "educational_material.created",
      entity: "EducationalMaterial",
      entityId: material.id
    });

    return json({ material }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
