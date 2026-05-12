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

const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente."),
  prescribedAt: z.string().datetime("Informe uma data valida.").optional(),
  duration: z.string().optional(),
  generalNotes: z.string().optional(),
  items: z.array(supplementItemSchema).min(1, "Adicione pelo menos um suplemento.")
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const patientId = request.nextUrl.searchParams.get("patientId") || undefined;

  const prescriptions = await prisma.supplementPrescription.findMany({
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
      items: {
        orderBy: { position: "asc" }
      }
    },
    orderBy: { prescribedAt: "desc" }
  });

  return json({ prescriptions });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = prescriptionSchema.parse(await request.json());
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

    const prescription = await prisma.supplementPrescription.create({
      data: {
        organizationId: user.organizationId,
        patientId: input.patientId,
        prescribedAt: input.prescribedAt ? new Date(input.prescribedAt) : new Date(),
        duration: input.duration || null,
        generalNotes: input.generalNotes || null,
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
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        },
        items: {
          orderBy: { position: "asc" }
        }
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "supplement_prescription.created",
      entity: "SupplementPrescription",
      entityId: prescription.id
    });

    return json({ prescription }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
