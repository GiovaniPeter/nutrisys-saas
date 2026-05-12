import { error, json } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type NotificationPriority = "high" | "medium" | "low";

type NotificationItem = {
  id: string;
  type: string;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionHref: string;
  actionLabel: string;
  createdAt: string;
};

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const noReturnCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [appointments, patients, pendingDiaryCount, unreadChatCount] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        organizationId: user.organizationId,
        startsAt: {
          gte: startOfDay(now),
          lte: in24Hours
        },
        status: { in: ["PENDING", "CONFIRMED"] }
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { startsAt: "asc" }
    }),
    prisma.patient.findMany({
      where: { organizationId: user.organizationId },
      include: {
        anamneses: {
          select: { id: true },
          take: 1
        },
        appointments: {
          where: { status: "COMPLETED" },
          select: {
            startsAt: true
          },
          orderBy: { startsAt: "desc" },
          take: 1
        }
      },
      orderBy: { name: "asc" }
    }),
    prisma.foodDiaryEntry.count({
      where: {
        organizationId: user.organizationId,
        status: "PENDING"
      }
    }),
    prisma.chatMessage.count({
      where: {
        organizationId: user.organizationId,
        sender: "PATIENT",
        readByProfessionalAt: null
      }
    })
  ]);

  const notifications: NotificationItem[] = [];

  appointments.forEach((appointment) => {
    const isToday = appointment.startsAt <= endOfToday;
    notifications.push({
      id: `${isToday ? "appointment-today" : "appointment-24h"}-${appointment.id}`,
      type: "appointment",
      priority: isToday ? "high" : "medium",
      title: isToday ? "Consulta hoje" : "Consulta nas proximas 24h",
      message: `${appointment.patient.name} - ${formatDateTime(appointment.startsAt)}`,
      actionHref: `/appointments?patientId=${appointment.patientId}`,
      actionLabel: "Ver agenda",
      createdAt: appointment.startsAt.toISOString()
    });
  });

  patients.forEach((patient) => {
    const lastAppointment = patient.appointments[0]?.startsAt;
    const referenceDate = lastAppointment || patient.createdAt;

    if (referenceDate < noReturnCutoff) {
      const days = Math.floor((now.getTime() - referenceDate.getTime()) / (24 * 60 * 60 * 1000));
      notifications.push({
        id: `no-return-${patient.id}`,
        type: "retention",
        priority: days > 60 ? "high" : "medium",
        title: "Paciente sem retorno",
        message: `${patient.name} - ${days} dias sem consulta concluida`,
        actionHref: `/patients/${patient.id}`,
        actionLabel: "Ver paciente",
        createdAt: referenceDate.toISOString()
      });
    }

    if (patient.anamneses.length === 0) {
      notifications.push({
        id: `no-anamnesis-${patient.id}`,
        type: "pending",
        priority: "low",
        title: "Anamnese pendente",
        message: `${patient.name} ainda nao tem anamnese registrada`,
        actionHref: `/anamneses?patientId=${patient.id}`,
        actionLabel: "Criar anamnese",
        createdAt: patient.createdAt.toISOString()
      });
    }
  });

  if (pendingDiaryCount > 0) {
    notifications.push({
      id: "pending-food-diary",
      type: "food-diary",
      priority: "medium",
      title: "Diario alimentar pendente",
      message: `${pendingDiaryCount} registro(s) aguardando avaliacao`,
      actionHref: "/food-diary",
      actionLabel: "Avaliar diario",
      createdAt: now.toISOString()
    });
  }

  if (unreadChatCount > 0) {
    notifications.push({
      id: "unread-chat",
      type: "chat",
      priority: "high",
      title: "Mensagens nao lidas",
      message: `${unreadChatCount} mensagem(ns) de pacientes aguardando resposta`,
      actionHref: "/chat",
      actionLabel: "Abrir chat",
      createdAt: now.toISOString()
    });
  }

  const order: Record<NotificationPriority, number> = { high: 0, medium: 1, low: 2 };
  notifications.sort((a, b) => order[a.priority] - order[b.priority] || b.createdAt.localeCompare(a.createdAt));

  return json({ notifications });
}

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(value);
}
