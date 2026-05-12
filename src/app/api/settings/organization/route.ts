import { NextRequest } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const organizationSettingsSchema = z.object({
  name: z.string().min(2, "Informe o nome da clinica.").optional(),
  document: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor primaria invalida.").optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor secundaria invalida.").optional(),
  logoUrl: z.string().url("Informe uma URL valida.").optional().or(z.literal(""))
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      document: true,
      phone: true,
      address: true,
      primaryColor: true,
      secondaryColor: true,
      logoUrl: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!organization) {
    return error("Clinica nao encontrada.", 404);
  }

  return json({ organization });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = organizationSettingsSchema.parse(await request.json());

    const organization = await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.document !== undefined ? { document: input.document || null } : {}),
        ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
        ...(input.address !== undefined ? { address: input.address || null } : {}),
        ...(input.primaryColor !== undefined ? { primaryColor: input.primaryColor } : {}),
        ...(input.secondaryColor !== undefined ? { secondaryColor: input.secondaryColor } : {}),
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl || null } : {})
      },
      select: {
        id: true,
        name: true,
        slug: true,
        document: true,
        phone: true,
        address: true,
        primaryColor: true,
        secondaryColor: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "organization.settings_updated",
      entity: "Organization",
      entityId: organization.id
    });

    return json({ organization });
  } catch (err) {
    return validationError(err);
  }
}
