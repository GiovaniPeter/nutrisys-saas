import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const userSchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  role: z.nativeEnum(UserRole).default(UserRole.NUTRITIONIST),
  crn: z.string().optional(),
  specialty: z.string().optional()
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const users = await prisma.user.findMany({
    where: { organizationId: user.organizationId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      crn: true,
      specialty: true,
      active: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return json({ users });
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return error("Nao autenticado.", 401);
  }

  if (!["OWNER", "ADMIN"].includes(currentUser.role)) {
    return error("Apenas owner/admin podem criar usuarios.", 403);
  }

  try {
    const input = userSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: { id: true }
    });

    if (existing) {
      return error("Ja existe um usuario com este e-mail.", 409);
    }

    const user = await prisma.user.create({
      data: {
        organizationId: currentUser.organizationId,
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: await hashPassword(input.password),
        role: input.role,
        crn: input.crn || null,
        specialty: input.specialty || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        crn: true,
        specialty: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await audit({
      organizationId: currentUser.organizationId,
      userId: currentUser.id,
      action: "user.created",
      entity: "User",
      entityId: user.id,
      metadata: {
        role: user.role
      }
    });

    return json({ user }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
