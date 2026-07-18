import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSessionCookie, setSessionCookie } from "@/lib/session";
import { error, slugify, validationError } from "@/lib/api";
import { findPlan } from "@/lib/plans";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { FREE_TRIAL_DAYS } from "@/lib/subscriptions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const trialEndsAt = new Date(Date.now() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);

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

    // Send Welcome Email
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@clinos.tec.br",
          to: input.email,
          subject: `Bem-vindo(a) ao ClinOS! Seu teste de ${FREE_TRIAL_DAYS} dias começou \uD83C\uDF89`,
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; line-height: 1.6;">
              <h1 style="color: #009981;">Bem-vindo(a) ao ClinOS!</h1>
              <p>Olá <strong>${input.name}</strong>,</p>
              <p>Sua conta foi criada com sucesso e seu período de teste grátis de ${FREE_TRIAL_DAYS} dias acaba de começar. Nenhum cartão é necessário durante o teste.</p>
              <p>O ClinOS é o sistema operacional completo para o seu consultório, com agenda online, controle financeiro, anamnese e planos alimentares.</p>
              <p>
                <a href="${process.env.APP_URL || 'https://clinos.tec.br'}/dashboard" style="display: inline-block; background-color: #009981; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
                  Acessar meu Dashboard
                </a>
              </p>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Se precisar de qualquer ajuda, basta responder a este e-mail.<br>
                Um abraço,<br>
                <strong>Equipe ClinOS</strong>
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Falha ao enviar e-mail de boas-vindas:", emailErr);
      }
    }

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
  } catch (err: any) {
    if (err instanceof z.ZodError) return validationError(err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
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

