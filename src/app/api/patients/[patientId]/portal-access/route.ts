import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const portalAccessSchema = z.object({
  action: z.enum(["generate", "rotate", "disable"]).default("generate")
});

type Params = {
  params: {
    patientId: string;
  };
};

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = portalAccessSchema.parse(await request.json());
    const existing = await prisma.patient.findFirst({
      where: {
        id: params.patientId,
        organizationId: user.organizationId
      },
      select: {
        id: true,
        portalAccessCode: true
      }
    });

    if (!existing) {
      return error("Paciente nao encontrado.", 404);
    }

    const data =
      input.action === "disable"
        ? { portalEnabled: false }
        : {
            portalEnabled: true,
            portalAccessCode: input.action === "generate" && existing.portalAccessCode ? existing.portalAccessCode : await createUniqueCode()
          };

    const patient = await prisma.patient.update({
      where: { id: params.patientId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        portalAccessCode: true,
        portalEnabled: true
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: input.action === "disable" ? "patient.portal_disabled" : "patient.portal_enabled",
      entity: "Patient",
      entityId: patient.id
    });

    return json({
      patient,
      portalUrl: `${process.env.APP_URL || "http://localhost:3000"}/portal/login`
    });
  } catch (err) {
    return validationError(err);
  }
}

async function createUniqueCode() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    const existing = await prisma.patient.findUnique({
      where: { portalAccessCode: code },
      select: { id: true }
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error("Nao foi possivel gerar um codigo unico.");
}
