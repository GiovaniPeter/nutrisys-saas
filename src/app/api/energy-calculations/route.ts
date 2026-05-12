import { NextRequest } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const formulaSchema = z.enum(["Harris-Benedict", "Mifflin-St Jeor", "FAO/OMS"]);

const calculationSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente."),
  formula: formulaSchema,
  sex: z.enum(["MALE", "FEMALE"]),
  age: z.coerce.number().int().min(1).max(120),
  weightKg: z.coerce.number().min(10).max(400),
  heightCm: z.coerce.number().min(50).max(250),
  activityFactor: z.coerce.number().min(1).max(2.5),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
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
    return error("Nao autenticado.", 401);
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
      return error("Paciente nao encontrado.", 404);
    }

    const basalMetabolicRate = calculateBmr(input.formula, input.sex, input.weightKg, input.heightCm, input.age);
    const totalEnergyExpenditure = basalMetabolicRate * input.activityFactor;

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

function calculateBmr(formula: z.infer<typeof formulaSchema>, sex: "MALE" | "FEMALE", weightKg: number, heightCm: number, age: number) {
  const male = sex === "MALE";

  if (formula === "Harris-Benedict") {
    return male
      ? 66.5 + 13.75 * weightKg + 5.003 * heightCm - 6.755 * age
      : 655.1 + 9.563 * weightKg + 1.85 * heightCm - 4.676 * age;
  }

  if (formula === "Mifflin-St Jeor") {
    return male
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  if (male) {
    if (age < 18) return 17.5 * weightKg + 651;
    if (age < 30) return 15.3 * weightKg + 679;
    if (age < 60) return 11.6 * weightKg + 879;
    return 13.5 * weightKg + 487;
  }

  if (age < 18) return 12.2 * weightKg + 746;
  if (age < 30) return 14.7 * weightKg + 496;
  if (age < 60) return 8.7 * weightKg + 829;
  return 10.5 * weightKg + 596;
}
