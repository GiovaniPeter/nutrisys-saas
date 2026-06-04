import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionCookie, setSessionCookie } from "@/lib/session";
import { error, validationError } from "@/lib/api";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido.").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Informe sua senha."),
  accessMode: z.enum(["nutritionist", "secretary"]).optional()
});

export async function POST(request: NextRequest) {
  try {
    const input = loginSchema.parse(await request.json());
    const rateLimit = checkRateLimit({
      key: `login:${getClientIp(request)}:${input.email}`,
      limit: 10,
      windowMs: 10 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas de login. Tente novamente em alguns minutos." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        active: true
      }
    });

    if (!user || !user.active || !(await verifyPassword(input.password, user.passwordHash))) {
      return error("E-mail ou senha incorretos.", 401);
    }

    if (input.accessMode === "secretary" && user.role !== "SECRETARY") {
      return error("Este acesso é exclusivo para secretárias cadastradas.", 403);
    }

    if (input.accessMode === "nutritionist" && user.role === "SECRETARY") {
      return error("Use a opção Secretária para entrar com este usuário.", 403);
    }

    const sessionToken = createSessionCookie({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        organizationId: user.organizationId,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: sessionToken
    });

    setSessionCookie(
      response,
      sessionToken
    );

    return response;
  } catch (err) {
    return validationError(err);
  }
}
