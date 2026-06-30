import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSessionCookie, setSessionCookie } from "@/lib/session";
import { error, slugify, validationError } from "@/lib/api";
import { findPlan } from "@/lib/plans";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(3, "Informe seu nome completo."),
  email: z.string().email("Informe um e-mail válido.").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  organizationName: z.string().min(2, "Informe o nome da clínica."),
  planCode: z.string().default("professional"),
  specialty: z.string().optional(),
  councilRegistration: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const input = registerSchema.parse(await request.json());
    const rateLimit = checkRateLimit({
      key: `register:${getClientIp(request)}:${input.email}`,
      limit: 20,
      windowMs: 60 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas de cadastro. Tente novamente mais tarde." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const plan = findPlan(input.planCode);

    if (!plan) {
      return error("Plano não encontrado.", 404);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true }
    });

    if (existingUser) {
      return error("Este e-mail já está cadastrado.", 409);
    }

    const isProfessional = Boolean(input.specialty);
    const organizationSlug = await buildUniqueSlug(input.organizationName);
    const passwordHash = await hashPassword(input.password);
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: input.organizationName,
          slug: organizationSlug
        }
      });

      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          name: input.name,
          email: input.email,
          passwordHash,
          role: isProfessional ? UserRole.PROFESSIONAL : UserRole.OWNER,
          crn: input.councilRegistration || null,
          specialty: input.specialty || null
        },
        select: {
          id: true,
          organizationId: true,
          name: true,
          email: true,
          role: true,
          specialty: true
        }
      });

      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          planCode: plan.code,
          status: "TRIALING",
          trialEndsAt
        }
      });

      await tx.auditLog.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          action: "organization.registered",
          entity: "Organization",
          entityId: organization.id,
          metadata: {
            planCode: plan.code,
            ...(isProfessional ? { specialty: input.specialty } : {})
          }
        }
      });

      return { organization, user };
    });

    const response = NextResponse.json(
      {
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug
        },
        user: result.user,
        trialEndsAt
      },
      { status: 201 }
    );

    setSessionCookie(
      response,
      createSessionCookie({
        userId: result.user.id,
        organizationId: result.user.organizationId,
        role: result.user.role,
        specialty: result.user.specialty || undefined
      })
    );

    return response;
  } catch (err) {
    return validationError(err);
  }
}

async function buildUniqueSlug(name: string) {
  const baseSlug = slugify(name) || "clinica";
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.organization.findUnique({ where: { slug }, select: { id: true } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
}
export async function GET() {
  const t0 = Date.now();
  let db_err = "";
  let env_secret = process.env.SESSION_SECRET ? process.env.SESSION_SECRET.length : 0;
  
  try {
    await prisma.user.findFirst();
  } catch (e: any) {
    db_err = String(e.message || e);
  }
  
  const t1 = Date.now();
  return NextResponse.json({ db_err, db_time: t1 - t0, env_secret, db_url_len: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0 });
}
