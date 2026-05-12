import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { error, json, validationError } from "@/lib/api";
import { getCurrentPortalPatient } from "@/lib/patient-session";

const portalEntrySchema = z.object({
  mealType: z.string().min(1, "Informe a refeicao."),
  entryDate: z.string().datetime("Informe uma data valida."),
  entryTime: z.string().optional(),
  description: z.string().min(3, "Descreva a refeicao."),
  photoUrl: z.string().url().optional().or(z.literal(""))
});

export async function GET() {
  const patient = await getCurrentPortalPatient();

  if (!patient) {
    return error("Nao autenticado.", 401);
  }

  const entries = await prisma.foodDiaryEntry.findMany({
    where: {
      patientId: patient.id,
      organizationId: patient.organizationId
    },
    orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
    take: 30
  });

  return json({ entries });
}

export async function POST(request: Request) {
  const patient = await getCurrentPortalPatient();

  if (!patient) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = portalEntrySchema.parse(await request.json());
    const entry = await prisma.foodDiaryEntry.create({
      data: {
        organizationId: patient.organizationId,
        patientId: patient.id,
        mealType: input.mealType,
        entryDate: new Date(input.entryDate),
        entryTime: input.entryTime || null,
        description: input.description,
        photoUrl: input.photoUrl || null
      }
    });

    return json({ entry }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
