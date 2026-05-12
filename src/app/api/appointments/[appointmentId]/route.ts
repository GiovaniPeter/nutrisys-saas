import { NextRequest } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";

const appointmentUpdateSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente.").optional(),
  professionalId: z.string().optional(),
  startsAt: z.string().datetime("Informe data e horario validos.").optional(),
  endsAt: z.string().datetime().optional().or(z.literal("")),
  type: z.string().min(2, "Informe o tipo de consulta.").optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  notes: z.string().optional()
});

type Params = {
  params: {
    appointmentId: string;
  };
};

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: params.appointmentId,
      organizationId: user.organizationId
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
    }
  });

  if (!appointment) {
    return error("Consulta nao encontrada.", 404);
  }

  return json({ appointment });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = appointmentUpdateSchema.parse(await request.json());
    const existing = await prisma.appointment.findFirst({
      where: {
        id: params.appointmentId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!existing) {
      return error("Consulta nao encontrada.", 404);
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
        return error("Profissional nao encontrado.", 404);
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id: params.appointmentId },
      data: {
        ...(input.patientId !== undefined ? { patientId: input.patientId } : {}),
        ...(input.professionalId !== undefined ? { professionalId: input.professionalId || user.id } : {}),
        ...(input.startsAt !== undefined ? { startsAt: new Date(input.startsAt) } : {}),
        ...(input.endsAt !== undefined ? { endsAt: input.endsAt ? new Date(input.endsAt) : null } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.notes !== undefined ? { notes: input.notes || null } : {})
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
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "appointment.updated",
      entity: "Appointment",
      entityId: appointment.id
    });

    return json({ appointment });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const existing = await prisma.appointment.findFirst({
    where: {
      id: params.appointmentId,
      organizationId: user.organizationId
    },
    select: { id: true }
  });

  if (!existing) {
    return error("Consulta nao encontrada.", 404);
  }

  await prisma.appointment.delete({
    where: { id: params.appointmentId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "appointment.deleted",
    entity: "Appointment",
    entityId: params.appointmentId
  });

  return json({ ok: true });
}
