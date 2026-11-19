import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { error } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type Params = {
  params: {
    patientId: string;
  };
};

/**
 * Portabilidade de Dados Pessoais e Clínicos do Paciente (LGPD — Lei nº 13.709/2018, Art. 18, V).
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  if (user.role === "SECRETARY") {
    return error("Secretárias não têm permissão para exportar prontuários clínicos.", 403);
  }

  const patient = await prisma.patient.findFirst({
    where: {
      id: params.patientId,
      organizationId: user.organizationId
    },
    include: {
      organization: {
        select: {
          name: true,
          document: true,
          phone: true,
          address: true
        }
      },
      appointments: { orderBy: { startsAt: "desc" } },
      anamneses: { orderBy: { createdAt: "desc" } },
      bodyRecords: { orderBy: { date: "desc" } },
      energyCalculations: { orderBy: { createdAt: "desc" } },
      mealPlans: {
        orderBy: { createdAt: "desc" },
        include: {
          meals: {
            orderBy: { position: "asc" },
            include: { items: true }
          }
        }
      },
      recalls: {
        orderBy: { createdAt: "desc" },
        include: {
          meals: {
            orderBy: { position: "asc" },
            include: { items: true }
          }
        }
      },
      labExams: {
        orderBy: { examDate: "desc" },
        include: { results: true }
      },
      supplementPrescriptions: {
        orderBy: { prescribedAt: "desc" },
        include: { items: { orderBy: { position: "asc" } } }
      },
      foodDiaryEntries: { orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }] },
      hydrationLogs: { orderBy: [{ date: "desc" }, { createdAt: "desc" }] },
      goals: { orderBy: { createdAt: "desc" } },
      chatMessages: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!patient) {
    return error("Paciente não encontrado.", 404);
  }

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "patient.lgpd_exported",
    entity: "Patient",
    entityId: patient.id
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    legalBasis: "LGPD (Lei nº 13.709/2018) — Art. 18, II e V (Acesso e Portabilidade de Dados)",
    controllerClinic: patient.organization,
    patient: {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birthDate: patient.birthDate,
      sex: patient.sex,
      heightCm: patient.heightCm,
      weightKg: patient.weightKg,
      goal: patient.goal,
      notes: patient.notes,
      lgpdConsentAt: patient.lgpdConsentAt,
      portalEnabled: patient.portalEnabled,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt
    },
    clinicalData: {
      appointments: patient.appointments,
      anamneses: patient.anamneses,
      bodyRecords: patient.bodyRecords,
      energyCalculations: patient.energyCalculations,
      mealPlans: patient.mealPlans,
      recalls: patient.recalls,
      labExams: patient.labExams,
      supplementPrescriptions: patient.supplementPrescriptions,
      foodDiaryEntries: patient.foodDiaryEntries,
      hydrationLogs: patient.hydrationLogs,
      goals: patient.goals,
      chatMessages: patient.chatMessages
    }
  };

  const fileName = `dados-lgpd-paciente-${patient.id}.json`;
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store"
    }
  });
}
