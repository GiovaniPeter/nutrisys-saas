import { NextRequest } from "next/server";
import { z } from "zod";
import { error, json, validationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  phone: z.string().trim().min(8, "Informe um telefone para contato."),
  email: z.string().email("Informe um e-mail valido.").optional().or(z.literal("")),
  startsAt: z.string().datetime("Escolha um horario valido."),
  type: z.string().min(2, "Informe o tipo de consulta.")
});

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const organization = await prisma.organization.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      primaryColor: true,
      secondaryColor: true
    }
  });

  if (!organization) {
    return error("Agenda nao encontrada.", 404);
  }

  const slots = await buildAvailableSlots(organization.id);

  return json({ organization, slots });
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const organization = await prisma.organization.findUnique({
    where: { slug: params.slug },
    select: { id: true }
  });

  if (!organization) {
    return error("Agenda nao encontrada.", 404);
  }

  try {
    const input = bookingSchema.parse(await request.json());
    const startsAt = new Date(input.startsAt);
    const now = new Date();

    if (startsAt <= now) {
      return error("Escolha um horario futuro.", 400);
    }

    const available = await isSlotAvailable(organization.id, startsAt);

    if (!available) {
      return error("Este horario acabou de ser reservado. Escolha outro.", 409);
    }

    const cleanPhone = input.phone.replace(/\D/g, "");
    const patient =
      (await prisma.patient.findFirst({
        where: {
          organizationId: organization.id,
          OR: [{ phone: { contains: cleanPhone.slice(-8) } }, ...(input.email ? [{ email: input.email }] : [])]
        }
      })) ||
      (await prisma.patient.create({
        data: {
          organizationId: organization.id,
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          notes: "Criado pelo agendamento online.",
          lgpdConsentAt: new Date()
        }
      }));

    const appointment = await prisma.appointment.create({
      data: {
        organizationId: organization.id,
        patientId: patient.id,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000),
        type: input.type,
        status: "PENDING",
        notes: "Solicitado pelo agendamento online."
      }
    });

    return json({ appointment }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}

async function buildAvailableSlots(organizationId: string) {
  const today = startOfDay(new Date());
  const end = new Date(today);
  end.setDate(end.getDate() + 21);

  const appointments = await prisma.appointment.findMany({
    where: {
      organizationId,
      startsAt: {
        gte: today,
        lte: end
      },
      status: { not: "CANCELED" }
    },
    select: { startsAt: true }
  });

  const occupied = new Set(appointments.map((appointment) => appointment.startsAt.toISOString()));
  const days: Array<{ date: string; label: string; times: Array<{ time: string; startsAt: string }> }> = [];

  for (let index = 1; index <= 21; index++) {
    const day = new Date(today);
    day.setDate(day.getDate() + index);

    if (![1, 2, 3, 4, 5].includes(day.getDay())) continue;

    const times: Array<{ time: string; startsAt: string }> = [];

    for (let hour = 8; hour <= 17; hour++) {
      if (hour === 12) continue;
      const slot = new Date(day);
      slot.setHours(hour, 0, 0, 0);

      if (slot <= new Date()) continue;
      if (occupied.has(slot.toISOString())) continue;

      times.push({ time: `${String(hour).padStart(2, "0")}:00`, startsAt: slot.toISOString() });
    }

    if (times.length) {
      days.push({
        date: day.toISOString().slice(0, 10),
        label: new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).format(day),
        times
      });
    }
  }

  return days;
}

async function isSlotAvailable(organizationId: string, startsAt: Date) {
  const slotHour = startsAt.getHours();
  const slotMinutes = startsAt.getMinutes();
  const day = startsAt.getDay();

  if (![1, 2, 3, 4, 5].includes(day) || slotMinutes !== 0 || slotHour < 8 || slotHour > 17 || slotHour === 12) {
    return false;
  }

  const existing = await prisma.appointment.findFirst({
    where: {
      organizationId,
      startsAt,
      status: { not: "CANCELED" }
    },
    select: { id: true }
  });

  return !existing;
}

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}
