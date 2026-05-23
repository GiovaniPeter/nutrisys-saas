import { NextRequest } from "next/server";
import { Prisma, Sex } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const patientSchema = z.object({
  name: z.string().min(2, "Informe o nome do paciente."),
  email: z.string().email("Informe um e-mail válido.").optional().or(z.literal("")),
  phone: z.string().optional(),
  birthDate: z.string().datetime().optional().or(z.literal("")),
  sex: z.nativeEnum(Sex).default(Sex.UNINFORMED),
  heightCm: z.coerce.number().positive().optional(),
  weightKg: z.coerce.number().positive().optional(),
  goal: z.string().optional(),
  notes: z.string().optional(),
  lgpdConsent: z.boolean().default(false)
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  const search = request.nextUrl.searchParams.get("q")?.trim();
  const where: Prisma.PatientWhereInput = {
    organizationId: user.organizationId,
    ...(search
      ? {
          name: {
            contains: search,
            mode: "insensitive"
          }
        }
      : {})
  };

  const patients = await prisma.patient.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      birthDate: true,
      sex: true,
      heightCm: true,
      weightKg: true,
      goal: true,
      notes: true,
      lgpdConsentAt: true,
      portalAccessCode: true,
      portalEnabled: true
    },
    orderBy: { name: "asc" }
  });

  return json({ patients });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  try {
    const input = patientSchema.parse(await request.json());

    const patient = await prisma.patient.create({
      data: {
        organizationId: user.organizationId,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        sex: input.sex,
        heightCm: input.heightCm,
        weightKg: input.weightKg,
        goal: input.goal || null,
        notes: input.notes || null,
        lgpdConsentAt: input.lgpdConsent ? new Date() : null
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "patient.created",
      entity: "Patient",
      entityId: patient.id
    });

    return json({ patient }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
