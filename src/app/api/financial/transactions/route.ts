import { NextRequest } from "next/server";
import { TransactionStatus, TransactionType } from "@prisma/client";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const transactionSchema = z.object({
  patientId: z.string().optional().or(z.literal("")),
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus).default(TransactionStatus.PENDING),
  description: z.string().min(2, "Informe a descricao."),
  amountCents: z.coerce.number().int().positive("Informe um valor positivo."),
  dueDate: z.string().datetime("Informe uma data valida."),
  paidAt: z.string().datetime().optional().or(z.literal("")),
  paymentMethod: z.string().optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const status = request.nextUrl.searchParams.get("status") as TransactionStatus | null;
  const patientId = request.nextUrl.searchParams.get("patientId");

  const transactions = await prisma.financialTransaction.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status ? { status } : {}),
      ...(patientId ? { patientId } : {}),
      ...(from || to
        ? {
            dueDate: {
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
      }
    },
    orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }]
  });

  return json({ transactions });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = transactionSchema.parse(await request.json());

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

    const transaction = await prisma.financialTransaction.create({
      data: {
        organizationId: user.organizationId,
        patientId: input.patientId || null,
        type: input.type,
        status: input.status,
        description: input.description,
        amountCents: input.amountCents,
        dueDate: new Date(input.dueDate),
        paidAt: input.paidAt ? new Date(input.paidAt) : input.status === TransactionStatus.PAID ? new Date() : null,
        paymentMethod: input.paymentMethod || null,
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
      action: "financial_transaction.created",
      entity: "FinancialTransaction",
      entityId: transaction.id,
      metadata: {
        type: transaction.type,
        status: transaction.status,
        amountCents: transaction.amountCents
      }
    });

    return json({ transaction }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
