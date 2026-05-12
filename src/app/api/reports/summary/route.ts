import { NextRequest } from "next/server";
import { AppointmentStatus, TransactionStatus, TransactionType } from "@prisma/client";
import { error, json } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const fromParam = request.nextUrl.searchParams.get("from");
  const toParam = request.nextUrl.searchParams.get("to");
  const from = fromParam ? new Date(fromParam) : firstDayOfMonth();
  const to = toParam ? new Date(toParam) : endOfToday();

  const [
    newPatients,
    appointments,
    mealPlans,
    bodyRecords,
    anamneses,
    transactions,
    topPatientsByAppointments
  ] = await Promise.all([
    prisma.patient.count({
      where: {
        organizationId: user.organizationId,
        createdAt: { gte: from, lte: to }
      }
    }),
    prisma.appointment.findMany({
      where: {
        organizationId: user.organizationId,
        startsAt: { gte: from, lte: to }
      },
      select: {
        status: true,
        type: true,
        patient: {
          select: {
            id: true,
            name: true
          }
        }
      }
    }),
    prisma.mealPlan.findMany({
      where: {
        organizationId: user.organizationId,
        createdAt: { gte: from, lte: to }
      },
      select: {
        publishedAt: true
      }
    }),
    prisma.bodyRecord.count({
      where: {
        createdAt: { gte: from, lte: to },
        patient: {
          organizationId: user.organizationId
        }
      }
    }),
    prisma.anamnesis.count({
      where: {
        createdAt: { gte: from, lte: to },
        patient: {
          organizationId: user.organizationId
        }
      }
    }),
    prisma.financialTransaction.findMany({
      where: {
        organizationId: user.organizationId,
        dueDate: { gte: from, lte: to },
        status: { not: TransactionStatus.CANCELED }
      },
      select: {
        type: true,
        status: true,
        amountCents: true
      }
    }),
    prisma.appointment.groupBy({
      by: ["patientId"],
      where: {
        organizationId: user.organizationId,
        startsAt: { gte: from, lte: to }
      },
      _count: {
        patientId: true
      },
      orderBy: {
        _count: {
          patientId: "desc"
        }
      },
      take: 5
    })
  ]);

  const patientIds = topPatientsByAppointments.map((item) => item.patientId);
  const topPatients = patientIds.length
    ? await prisma.patient.findMany({
        where: {
          id: { in: patientIds },
          organizationId: user.organizationId
        },
        select: {
          id: true,
          name: true
        }
      })
    : [];

  const appointmentStatus = countBy(appointments, "status");
  const appointmentTypes = countBy(appointments, "type");
  const incomeCents = sumTransactions(transactions, TransactionType.INCOME);
  const expenseCents = sumTransactions(transactions, TransactionType.EXPENSE);
  const pendingCents = transactions
    .filter((transaction) => transaction.status === TransactionStatus.PENDING)
    .reduce((sum, transaction) => sum + transaction.amountCents, 0);
  const publishedMealPlans = mealPlans.filter((plan) => plan.publishedAt).length;

  return json({
    period: {
      from,
      to
    },
    metrics: {
      newPatients,
      appointments: appointments.length,
      completedAppointments: appointmentStatus[AppointmentStatus.COMPLETED] || 0,
      noShows: appointmentStatus[AppointmentStatus.NO_SHOW] || 0,
      mealPlans: mealPlans.length,
      publishedMealPlans,
      bodyRecords,
      anamneses,
      incomeCents,
      expenseCents,
      balanceCents: incomeCents - expenseCents,
      pendingCents
    },
    appointmentStatus,
    appointmentTypes,
    topPatientsByAppointments: topPatientsByAppointments.map((item) => ({
      patientId: item.patientId,
      count: item._count.patientId,
      name: topPatients.find((patient) => patient.id === item.patientId)?.name || "Paciente"
    }))
  });
}

function firstDayOfMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

function countBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key] || "Nao informado");
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function sumTransactions(
  transactions: Array<{ type: TransactionType; amountCents: number }>,
  type: TransactionType
) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + transaction.amountCents, 0);
}
