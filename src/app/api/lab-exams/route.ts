import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const labExamResultSchema = z.object({
  category: z.string().min(1, "Informe a categoria."),
  name: z.string().min(1, "Informe o exame."),
  value: z.coerce.number(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  interpretation: z.string().optional()
});

const labExamSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente."),
  examDate: z.string().datetime("Informe uma data valida."),
  laboratoryName: z.string().optional(),
  notes: z.string().optional(),
  results: z.array(labExamResultSchema).min(1, "Informe pelo menos um resultado.")
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const patientId = request.nextUrl.searchParams.get("patientId") || undefined;

  const labExams = await prisma.labExam.findMany({
    where: {
      organizationId: user.organizationId,
      ...(patientId ? { patientId } : {})
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true
        }
      },
      results: {
        orderBy: [{ category: "asc" }, { name: "asc" }]
      }
    },
    orderBy: { examDate: "desc" }
  });

  return json({ labExams });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = labExamSchema.parse(await request.json());
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

    const labExam = await prisma.labExam.create({
      data: {
        organizationId: user.organizationId,
        patientId: input.patientId,
        examDate: new Date(input.examDate),
        laboratoryName: input.laboratoryName || null,
        notes: input.notes || null,
        results: {
          create: input.results.map((result) => ({
            category: result.category,
            name: result.name,
            value: result.value,
            unit: result.unit || "",
            referenceRange: result.referenceRange || null,
            interpretation: result.interpretation || null
          }))
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        },
        results: true
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "lab_exam.created",
      entity: "LabExam",
      entityId: labExam.id
    });

    return json({ labExam }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
