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

const labExamUpdateSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente.").optional(),
  examDate: z.string().datetime("Informe uma data valida.").optional(),
  laboratoryName: z.string().optional(),
  notes: z.string().optional(),
  results: z.array(labExamResultSchema).min(1, "Informe pelo menos um resultado.").optional()
});

type Params = {
  params: {
    labExamId: string;
  };
};

const labExamInclude = {
  patient: {
    select: {
      id: true,
      name: true
    }
  },
  results: {
    orderBy: [{ category: "asc" as const }, { name: "asc" as const }]
  }
};

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const labExam = await prisma.labExam.findFirst({
    where: {
      id: params.labExamId,
      organizationId: user.organizationId
    },
    include: labExamInclude
  });

  if (!labExam) {
    return error("Exame laboratorial nao encontrado.", 404);
  }

  return json({ labExam });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = labExamUpdateSchema.parse(await request.json());
    const existing = await prisma.labExam.findFirst({
      where: {
        id: params.labExamId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!existing) {
      return error("Exame laboratorial nao encontrado.", 404);
    }

    if (input.patientId) {
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
    }

    const labExam = await prisma.$transaction(async (tx) => {
      if (input.results) {
        await tx.labExamResult.deleteMany({
          where: { labExamId: params.labExamId }
        });
      }

      return tx.labExam.update({
        where: { id: params.labExamId },
        data: {
          ...(input.patientId !== undefined ? { patientId: input.patientId } : {}),
          ...(input.examDate !== undefined ? { examDate: new Date(input.examDate) } : {}),
          ...(input.laboratoryName !== undefined ? { laboratoryName: input.laboratoryName || null } : {}),
          ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
          ...(input.results
            ? {
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
              }
            : {})
        },
        include: labExamInclude
      });
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "lab_exam.updated",
      entity: "LabExam",
      entityId: labExam.id
    });

    return json({ labExam });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const existing = await prisma.labExam.findFirst({
    where: {
      id: params.labExamId,
      organizationId: user.organizationId
    },
    select: { id: true }
  });

  if (!existing) {
    return error("Exame laboratorial nao encontrado.", 404);
  }

  await prisma.labExam.delete({
    where: { id: params.labExamId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "lab_exam.deleted",
    entity: "LabExam",
    entityId: params.labExamId
  });

  return json({ ok: true });
}
