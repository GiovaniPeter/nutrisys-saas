import { NextRequest } from "next/server";
import { Sex } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const patientUpdateSchema = z.object({
  name: z.string().min(2, "Informe o nome do paciente.").optional(),
  email: z.string().email("Informe um e-mail válido.").optional().or(z.literal("")),
  phone: z.string().optional(),
  birthDate: z.string().datetime().optional().or(z.literal("")),
  sex: z.nativeEnum(Sex).optional(),
  heightCm: z.coerce.number().positive().optional(),
  weightKg: z.coerce.number().positive().optional(),
  goal: z.string().optional(),
  notes: z.string().optional(),
  lgpdConsent: z.boolean().optional()
});

type Params = {
  params: {
    patientId: string;
  };
};

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  // Secretárias acessam apenas dados cadastrais/administrativos e agenda (sigilo clínico LGPD + CFN)
  if (user.role === "SECRETARY") {
    const patient = await prisma.patient.findFirst({
      where: {
        id: params.patientId,
        organizationId: user.organizationId
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        sex: true,
        lgpdConsentAt: true,
        portalEnabled: true,
        createdAt: true,
        appointments: {
          orderBy: { startsAt: "desc" },
          take: 10
        }
      }
    });

    if (!patient) {
      return error("Paciente não encontrado.", 404);
    }

    return json({ patient });
  }

  const patient = await prisma.patient.findFirst({
    where: {
      id: params.patientId,
      organizationId: user.organizationId
    },
    include: {
      appointments: {
        orderBy: { startsAt: "desc" },
        take: 10
      },
      mealPlans: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    }
  });

  if (!patient) {
    return error("Paciente não encontrado.", 404);
  }

  return json({ patient });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  try {
    const input = patientUpdateSchema.parse(await request.json());
    const existing = await prisma.patient.findFirst({
      where: {
        id: params.patientId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!existing) {
      return error("Paciente não encontrado.", 404);
    }

    const isSecretary = user.role === "SECRETARY";

    const patient = await prisma.patient.update({
      where: { id: params.patientId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.email !== undefined ? { email: input.email || null } : {}),
        ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
        ...(input.birthDate !== undefined ? { birthDate: input.birthDate ? new Date(input.birthDate) : null } : {}),
        ...(input.sex !== undefined ? { sex: input.sex } : {}),
        ...(!isSecretary && input.heightCm !== undefined ? { heightCm: input.heightCm } : {}),
        ...(!isSecretary && input.weightKg !== undefined ? { weightKg: input.weightKg } : {}),
        ...(!isSecretary && input.goal !== undefined ? { goal: input.goal || null } : {}),
        ...(!isSecretary && input.notes !== undefined ? { notes: input.notes || null } : {}),
        ...(input.lgpdConsent !== undefined ? { lgpdConsentAt: input.lgpdConsent ? new Date() : null } : {})
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "patient.updated",
      entity: "Patient",
      entityId: patient.id
    });

    return json({ patient });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  if (user.role === "SECRETARY") {
    return error("Secretárias não têm permissão para excluir cadastros ou prontuários de pacientes.", 403);
  }

  const existing = await prisma.patient.findFirst({
    where: {
      id: params.patientId,
      organizationId: user.organizationId
    },
    select: {
      id: true,
      _count: {
        select: {
          anamneses: true,
          labExams: true,
          mealPlans: true,
          bodyRecords: true,
          recalls: true,
          supplementPrescriptions: true
        }
      }
    }
  });

  if (!existing) {
    return error("Paciente não encontrado.", 404);
  }

  const clinicalCount =
    existing._count.anamneses +
    existing._count.labExams +
    existing._count.mealPlans +
    existing._count.bodyRecords +
    existing._count.recalls +
    existing._count.supplementPrescriptions;

  const confirmClinicalDelete = request.nextUrl.searchParams.get("confirmClinicalDelete") === "1";

  if (clinicalCount > 0 && !confirmClinicalDelete) {
    return json(
      {
        error:
          "Este paciente possui registros clínicos no prontuário. Pela Lei nº 13.787/2018, prontuários devem ser preservados por 20 anos. Recomendamos exportar os dados (LGPD) antes de confirmar a exclusão definitiva.",
        requiresClinicalConfirmation: true,
        clinicalRecordsCount: clinicalCount
      },
      { status: 409 }
    );
  }

  await prisma.patient.delete({
    where: { id: params.patientId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "patient.deleted",
    entity: "Patient",
    entityId: params.patientId,
    metadata: {
      hadClinicalRecords: clinicalCount > 0,
      clinicalRecordsCount: clinicalCount,
      confirmedClinicalDelete: confirmClinicalDelete
    }
  });

  return json({ ok: true });
}
