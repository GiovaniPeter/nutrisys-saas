import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const supplementItemSchema = z.object({
  name: z.string().min(1, "Informe o suplemento."),
  category: z.string().min(1, "Informe a categoria."),
  dose: z.string().min(1, "Informe a dosagem."),
  frequency: z.string().optional(),
  timing: z.string().optional(),
  instructions: z.string().optional(),
  position: z.coerce.number().int().min(0).default(0)
});

const prescriptionUpdateSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente.").optional(),
  prescribedAt: z.string().datetime("Informe uma data valida.").optional(),
  duration: z.string().optional(),
  generalNotes: z.string().optional(),
  items: z.array(supplementItemSchema).min(1, "Adicione pelo menos um suplemento.").optional()
});

type Params = {
  params: {
    prescriptionId: string;
  };
};

const prescriptionInclude = {
  patient: {
    select: {
      id: true,
      name: true
    }
  },
  items: {
    orderBy: { position: "asc" as const }
  }
};

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const prescription = await prisma.supplementPrescription.findFirst({
    where: {
      id: params.prescriptionId,
      organizationId: user.organizationId
    },
    include: prescriptionInclude
  });

  if (!prescription) {
    return error("Prescricao nao encontrada.", 404);
  }

  return json({ prescription });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = prescriptionUpdateSchema.parse(await request.json());
    const existing = await prisma.supplementPrescription.findFirst({
      where: {
        id: params.prescriptionId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!existing) {
      return error("Prescricao nao encontrada.", 404);
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

    const prescription = await prisma.$transaction(async (tx) => {
      if (input.items) {
        await tx.supplementPrescriptionItem.deleteMany({
          where: { prescriptionId: params.prescriptionId }
        });
      }

      return tx.supplementPrescription.update({
        where: { id: params.prescriptionId },
        data: {
          ...(input.patientId !== undefined ? { patientId: input.patientId } : {}),
          ...(input.prescribedAt !== undefined ? { prescribedAt: new Date(input.prescribedAt) } : {}),
          ...(input.duration !== undefined ? { duration: input.duration || null } : {}),
          ...(input.generalNotes !== undefined ? { generalNotes: input.generalNotes || null } : {}),
          ...(input.items
            ? {
                items: {
                  create: input.items.map((item, index) => ({
                    name: item.name,
                    category: item.category,
                    dose: item.dose,
                    frequency: item.frequency || null,
                    timing: item.timing || null,
                    instructions: item.instructions || null,
                    position: item.position ?? index
                  }))
                }
              }
            : {})
        },
        include: prescriptionInclude
      });
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "supplement_prescription.updated",
      entity: "SupplementPrescription",
      entityId: prescription.id
    });

    return json({ prescription });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const existing = await prisma.supplementPrescription.findFirst({
    where: {
      id: params.prescriptionId,
      organizationId: user.organizationId
    },
    select: { id: true }
  });

  if (!existing) {
    return error("Prescricao nao encontrada.", 404);
  }

  await prisma.supplementPrescription.delete({
    where: { id: params.prescriptionId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "supplement_prescription.deleted",
    entity: "SupplementPrescription",
    entityId: params.prescriptionId
  });

  return json({ ok: true });
}
