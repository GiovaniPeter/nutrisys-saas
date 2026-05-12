import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { error, json, validationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { createPortalSessionCookie, setPortalSessionCookie } from "@/lib/patient-session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const portalLoginSchema = z.object({
  identifier: z.string().min(3, "Informe e-mail ou telefone."),
  accessCode: z.string().min(4, "Informe o codigo de acesso.")
});

export async function POST(request: NextRequest) {
  try {
    const input = portalLoginSchema.parse(await request.json());
    const normalizedCode = input.accessCode.trim().toUpperCase();
    const normalizedIdentifier = input.identifier.trim().toLowerCase();
    const rateLimit = checkRateLimit({
      key: `portal-login:${getClientIp(request)}:${normalizedIdentifier}`,
      limit: 10,
      windowMs: 10 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas de acesso. Tente novamente em alguns minutos." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const identifierDigits = normalizedIdentifier.replace(/\D/g, "");

    const patient = await prisma.patient.findFirst({
      where: {
        portalEnabled: true,
        portalAccessCode: normalizedCode
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        phone: true
      }
    });

    const emailMatches = patient?.email?.toLowerCase() === normalizedIdentifier;
    const phoneMatches = Boolean(identifierDigits && patient?.phone?.replace(/\D/g, "").includes(identifierDigits));

    if (!patient || (!emailMatches && !phoneMatches)) {
      return error("Dados de acesso invalidos.", 401);
    }

    const response = NextResponse.json({ patient: { id: patient.id, name: patient.name } });
    setPortalSessionCookie(
      response,
      createPortalSessionCookie({
        patientId: patient.id,
        organizationId: patient.organizationId
      })
    );

    return response;
  } catch (err) {
    return validationError(err);
  }
}
