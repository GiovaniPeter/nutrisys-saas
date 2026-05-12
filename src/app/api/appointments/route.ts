import { NextRequest } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente."),
  professionalId: z.string().optional(),
  startsAt: z.string().datetime("Informe data e horário válidos."),
  endsAt: z.string().datetime().optional(),
  type: z.string().min(2, "Informe o tipo de consulta."),
  status: z.nativeEnum(AppointmentStatus).default(AppointmentStatus.PENDING),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const patientId = request.nextUrl.searchParams.get("patientId");

  const appointments = await prisma.appointment.findMany({
    where: {
      organizationId: user.organizationId,
      ...(patientId ? { patientId } : {}),
      ...(from || to
        ? {
            startsAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {})
            }
          }
        : {})
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      },
      professional: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { startsAt: "asc" }
  });

  return json({ appointments });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  try {
    const input = appointmentSchema.parse(await request.json());

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

    if (input.professionalId) {
      const professional = await prisma.user.findFirst({
        where: {
          id: input.professionalId,
          organizationId: user.organizationId,
          active: true
        },
        select: { id: true }
      });

      if (!professional) {
        return error("Profissional não encontrado.", 404);
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        organizationId: user.organizationId,
        patientId: input.patientId,
        professionalId: input.professionalId || user.id,
        startsAt: new Date(input.startsAt),
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        type: input.type,
        status: input.status,
        notes: input.notes || null
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "appointment.created",
      entity: "Appointment",
      entityId: appointment.id
    });

    return json({ appointment }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
