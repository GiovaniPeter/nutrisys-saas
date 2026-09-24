import { NextRequest } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const formulaSchema = z.enum([
  "Harris-Benedict",
  "Mifflin-St Jeor",
  "FAO/OMS",
  "Cunningham (1980)",
  "Katch-McArdle",
  "Tinsley (2018)"
]);

const calculationSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente."),
  formula: formulaSchema,
  sex: z.enum(["MALE", "FEMALE"]),
  age: z.coerce.number().int().min(1).max(120),
  weightKg: z.coerce.number().min(10).max(400),
  heightCm: z.coerce.number().min(50).max(250),
  activityFactor: z.coerce.number().min(1).max(2.5),
  leanBodyMassKg: z.coerce.number().min(10).max(250).optional(),
  extraExerciseKcal: z.coerce.number().min(0).max(5000).optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  const patientId = request.nextUrl.searchParams.get("patientId") || undefined;

  const calculations = await prisma.energyCalculation.findMany({
    where: {
      organizationId: user.organizationId,
      ...(patientId ? { patientId } : {})
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          birthDate: true,
          sex: true,
          heightCm: true,
          weightKg: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return json({ calculations });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  try {
    const input = calculationSchema.parse(await request.json());
    const patient = await prisma.patient.findFirst({
      where: {
        id: input.patientId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!patient) {
      return error("Paciente não encontrado.", 404);
    }

    const basalMetabolicRate = calculateBmr(
      input.formula,
      input.sex,
      input.weightKg,
      input.heightCm,
      input.age,
      input.leanBodyMassKg
    );
    const totalEnergyExpenditure =
      basalMetabolicRate * input.activityFactor + (input.extraExerciseKcal || 0);

    const calculation = await prisma.energyCalculation.create({
      data: {
        organizationId: user.organizationId,
        patientId: input.patientId,
        formula: input.formula,
        sex: input.sex,
        age: input.age,
        weightKg: input.weightKg,
        heightCm: input.heightCm,
        activityFactor: input.activityFactor,
        basalMetabolicRate,
        totalEnergyExpenditure,
        notes: input.notes || null
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            sex: true,
            heightCm: true,
            weightKg: true
          }
        }
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "energy_calculation.created",
      entity: "EnergyCalculation",
      entityId: calculation.id
    });

    return json({ calculation }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}

function calculateBmr(
  formula: z.infer<typeof formulaSchema>,
  sex: "MALE" | "FEMALE",
  weightKg: number,
  heightCm: number,
  age: number,
  leanBodyMassKg?: number
) {
  const estimatedLbm =
    leanBodyMassKg && leanBodyMassKg > 15
      ? leanBodyMassKg
      : sex === "MALE"
        ? weightKg * 0.82
        : weightKg * 0.75;

  if (formula === "Cunningham (1980)") {
    return 500 + 22 * estimatedLbm;
  }

  if (formula === "Katch-McArdle") {
    return 370 + 21.6 * estimatedLbm;
  }

  if (formula === "Tinsley (2018)") {
    return leanBodyMassKg && leanBodyMassKg > 15
      ? 25.9 * estimatedLbm + 284
      : 24.8 * weightKg + 10;
  }

  if (formula === "Harris-Benedict") {
    return sex === "MALE"
      ? 66.47 + 13.75 * weightKg + 5 * heightCm - 6.76 * age
      : 655.1 + 9.56 * weightKg + 1.85 * heightCm - 4.68 * age;
  }

  if (formula === "Mifflin-St Jeor") {
    return sex === "MALE"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  // FAO/OMS
  if (sex === "MALE") {
    if (age < 30) return 15.3 * weightKg + 679;
    if (age < 60) return 11.6 * weightKg + 879;
    return 13.5 * weightKg + 487;
  }

  if (age < 30) return 14.7 * weightKg + 496;
  if (age < 60) return 8.7 * weightKg + 829;
  return 10.5 * weightKg + 596;
}
