import { NextRequest } from "next/server";
import { AppointmentStatus, TransactionStatus, TransactionType } from "@prisma/client";
import { error, json } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type MonthlyRevenue = {
  label: string;
  valueCents: number;
};

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const months = clamp(Number(request.nextUrl.searchParams.get("months") || 6), 3, 12);
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const revenueFrom = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const activeCutoff = new Date(now);
  activeCutoff.setDate(activeCutoff.getDate() - 90);

  const [patients, appointments, transactions] = await Promise.all([
    prisma.patient.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true
      },
      orderBy: { name: "asc" }
    }),
    prisma.appointment.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        patientId: true,
        startsAt: true,
        type: true,
        status: true,
        patient: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: { startsAt: "asc" }
    }),
    prisma.financialTransaction.findMany({
      where: {
        organizationId: user.organizationId,
        dueDate: { gte: revenueFrom },
        status: { not: TransactionStatus.CANCELED }
      },
      select: {
        patientId: true,
        type: true,
        status: true,
        amountCents: true,
        dueDate: true
      }
    })
  ]);

  const completedAppointments = appointments.filter((appointment) => appointment.status === AppointmentStatus.COMPLETED);
  const noShows = appointments.filter((appointment) => appointment.status === AppointmentStatus.NO_SHOW);
  const pastAppointments = appointments.filter((appointment) => appointment.startsAt <= now && appointment.status !== AppointmentStatus.CANCELED);
  const appointmentsByPatient = groupByPatient(pastAppointments);
  const returnedPatients = Object.values(appointmentsByPatient).filter((items) => items.length >= 2).length;
  const totalWithAppointments = Object.keys(appointmentsByPatient).length;
  const returnRate = totalWithAppointments ? Math.round((returnedPatients / totalWithAppointments) * 100) : 0;
  const noShowRate = pastAppointments.length ? Math.round((noShows.length / pastAppointments.length) * 100) : 0;

  const currentMonthRevenue = sumIncome(
    transactions.filter((transaction) => transaction.dueDate >= currentMonthStart && transaction.status === TransactionStatus.PAID)
  );
  const previousMonthRevenue = sumIncome(
    transactions.filter(
      (transaction) =>
        transaction.dueDate >= previousMonthStart &&
        transaction.dueDate <= previousMonthEnd &&
        transaction.status === TransactionStatus.PAID
    )
  );
  const revenueTrend = previousMonthRevenue ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100) : 0;
  const paidIncomeTransactions = transactions.filter(
    (transaction) => transaction.type === TransactionType.INCOME && transaction.status === TransactionStatus.PAID
  );
  const averageTicketCents = paidIncomeTransactions.length
    ? Math.round(paidIncomeTransactions.reduce((sum, transaction) => sum + transaction.amountCents, 0) / paidIncomeTransactions.length)
    : 0;

  const monthlyRevenue = buildMonthlyRevenue(transactions, months, now);
  const activity = patients.map((patient) => {
    const patientAppointments = appointments
      .filter((appointment) => appointment.patientId === patient.id && appointment.status !== AppointmentStatus.CANCELED)
      .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
    const lastAppointment = patientAppointments[0]?.startsAt || null;
    const active = Boolean(lastAppointment && lastAppointment >= activeCutoff);

    return {
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      lastAppointment,
      active
    };
  });

  const activePatients = activity.filter((patient) => patient.active);
  const inactivePatients = activity.filter((patient) => !patient.active);
  const averageDaysBetweenAppointments = calculateAverageDaysBetweenAppointments(appointmentsByPatient);
  const noShowRisk = calculateNoShowRisk(appointments, now);
  const topPatientsByRevenue = calculateTopPatientsByRevenue(transactions, patients);

  return json({
    period: {
      months
    },
    metrics: {
      returnRate,
      returnedPatients,
      totalWithAppointments,
      currentMonthRevenueCents: currentMonthRevenue,
      previousMonthRevenueCents: previousMonthRevenue,
      revenueTrend,
      activePatients: activePatients.length,
      inactivePatients: inactivePatients.length,
      totalPatients: patients.length,
      noShowRate,
      noShows: noShows.length,
      totalPastAppointments: pastAppointments.length,
      averageTicketCents,
      averageDaysBetweenAppointments,
      completedAppointments: completedAppointments.length
    },
    monthlyRevenue,
    patientActivity: {
      active: activePatients,
      inactive: inactivePatients.slice(0, 12)
    },
    noShowRisk,
    topPatientsByRevenue
  });
}

function groupByPatient<T extends { patientId: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    acc[item.patientId] = acc[item.patientId] || [];
    acc[item.patientId].push(item);
    return acc;
  }, {});
}

function sumIncome(transactions: Array<{ type: TransactionType; amountCents: number }>) {
  return transactions
    .filter((transaction) => transaction.type === TransactionType.INCOME)
    .reduce((sum, transaction) => sum + transaction.amountCents, 0);
}

function buildMonthlyRevenue(
  transactions: Array<{ type: TransactionType; status: TransactionStatus; amountCents: number; dueDate: Date }>,
  months: number,
  now: Date
): MonthlyRevenue[] {
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - index - 1), 1);
    const month = date.getMonth();
    const year = date.getFullYear();
    const valueCents = sumIncome(
      transactions.filter(
        (transaction) =>
          transaction.status === TransactionStatus.PAID &&
          transaction.dueDate.getMonth() === month &&
          transaction.dueDate.getFullYear() === year
      )
    );

    return {
      label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date),
      valueCents
    };
  });
}

function calculateAverageDaysBetweenAppointments(
  appointmentsByPatient: Record<string, Array<{ startsAt: Date; status: AppointmentStatus }>>
) {
  const intervals: number[] = [];

  Object.values(appointmentsByPatient).forEach((appointments) => {
    const sorted = appointments
      .filter((appointment) => appointment.status !== AppointmentStatus.CANCELED)
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

    for (let index = 1; index < sorted.length; index += 1) {
      const diff = Math.round((sorted[index].startsAt.getTime() - sorted[index - 1].startsAt.getTime()) / 86400000);
      if (diff > 0) intervals.push(diff);
    }
  });

  return intervals.length ? Math.round(intervals.reduce((sum, value) => sum + value, 0) / intervals.length) : null;
}

function calculateNoShowRisk(
  appointments: Array<{
    id: string;
    patientId: string;
    startsAt: Date;
    type: string;
    status: AppointmentStatus;
    patient: { id: string; name: string; phone: string | null };
  }>,
  now: Date
) {
  const future = appointments
    .filter((appointment) => appointment.startsAt >= now && !["CANCELED", "CONFIRMED", "COMPLETED"].includes(appointment.status))
    .slice(0, 30);

  return future
    .map((appointment) => {
      const history = appointments.filter((item) => item.patientId === appointment.patientId && item.startsAt < now);
      const previousNoShows = history.filter((item) => item.status === AppointmentStatus.NO_SHOW).length;
      const reasons: string[] = [];
      let riskPercent = 0;

      if (previousNoShows > 0) {
        riskPercent += Math.min(previousNoShows * 25, 50);
        reasons.push(`${previousNoShows} falta(s) anterior(es)`);
      }

      if (appointment.status === AppointmentStatus.PENDING) {
        riskPercent += 20;
        reasons.push("Nao confirmada");
      }

      if (!appointment.patient.phone) {
        riskPercent += 15;
        reasons.push("Sem telefone");
      }

      if (history.length === 0) {
        riskPercent += 10;
        reasons.push("Primeira consulta");
      }

      const daysUntil = Math.round((appointment.startsAt.getTime() - now.getTime()) / 86400000);
      if (daysUntil > 7) {
        riskPercent += 10;
        reasons.push(`${daysUntil} dias ate a consulta`);
      }

      return {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patient.name,
        startsAt: appointment.startsAt,
        type: appointment.type,
        reasons,
        riskPercent: Math.min(riskPercent, 100)
      };
    })
    .filter((risk) => risk.riskPercent >= 20)
    .sort((a, b) => b.riskPercent - a.riskPercent)
    .slice(0, 8);
}

function calculateTopPatientsByRevenue(
  transactions: Array<{ patientId: string | null; type: TransactionType; status: TransactionStatus; amountCents: number }>,
  patients: Array<{ id: string; name: string }>
) {
  const byPatient = transactions
    .filter((transaction) => transaction.patientId && transaction.type === TransactionType.INCOME && transaction.status === TransactionStatus.PAID)
    .reduce<Record<string, { valueCents: number; count: number }>>((acc, transaction) => {
      const patientId = transaction.patientId as string;
      acc[patientId] = acc[patientId] || { valueCents: 0, count: 0 };
      acc[patientId].valueCents += transaction.amountCents;
      acc[patientId].count += 1;
      return acc;
    }, {});

  return Object.entries(byPatient)
    .map(([patientId, data]) => ({
      patientId,
      name: patients.find((patient) => patient.id === patientId)?.name || "Paciente",
      valueCents: data.valueCents,
      count: data.count
    }))
    .sort((a, b) => b.valueCents - a.valueCents)
    .slice(0, 8);
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}
