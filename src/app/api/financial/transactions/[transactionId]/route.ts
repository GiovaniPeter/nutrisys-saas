import { NextRequest } from "next/server";
import { TransactionStatus, TransactionType } from "@prisma/client";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const transactionUpdateSchema = z.object({
  patientId: z.string().optional().or(z.literal("")),
  type: z.nativeEnum(TransactionType).optional(),
  status: z.nativeEnum(TransactionStatus).optional(),
  description: z.string().min(2, "Informe a descricao.").optional(),
  amountCents: z.coerce.number().int().positive("Informe um valor positivo.").optional(),
  dueDate: z.string().datetime("Informe uma data valida.").optional(),
  paidAt: z.string().datetime().optional().or(z.literal("")),
  paymentMethod: z.string().optional(),
  notes: z.string().optional()
});

type Params = {
  params: {
    transactionId: string;
  };
};

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const transaction = await prisma.financialTransaction.findFirst({
    where: {
      id: params.transactionId,
      organizationId: user.organizationId
    },
    include: {
      patient: {
        select: { id: true, name: true, phone: true }
      }
    }
  });

  if (!transaction) {
    return error("Lancamento nao encontrado.", 404);
  }

  return json({ transaction });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = transactionUpdateSchema.parse(await request.json());
    const existing = await prisma.financialTransaction.findFirst({
      where: {
        id: params.transactionId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!existing) {
      return error("Lancamento nao encontrado.", 404);
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

    const transaction = await prisma.financialTransaction.update({
      where: { id: params.transactionId },
      data: {
        ...(input.patientId !== undefined ? { patientId: input.patientId || null } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.status !== undefined
          ? {
              status: input.status,
              paidAt: input.status === TransactionStatus.PAID ? new Date() : input.status === TransactionStatus.PENDING ? null : undefined
            }
          : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.amountCents !== undefined ? { amountCents: input.amountCents } : {}),
        ...(input.dueDate !== undefined ? { dueDate: new Date(input.dueDate) } : {}),
        ...(input.paidAt !== undefined ? { paidAt: input.paidAt ? new Date(input.paidAt) : null } : {}),
        ...(input.paymentMethod !== undefined ? { paymentMethod: input.paymentMethod || null } : {}),
        ...(input.notes !== undefined ? { notes: input.notes || null } : {})
      },
      include: {
        patient: {
          select: { id: true, name: true, phone: true }
        }
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "financial_transaction.updated",
      entity: "FinancialTransaction",
      entityId: transaction.id,
      metadata: {
        type: transaction.type,
        status: transaction.status,
        amountCents: transaction.amountCents
      }
    });

    return json({ transaction });
  } catch (err) {
    return validationError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const existing = await prisma.financialTransaction.findFirst({
    where: {
      id: params.transactionId,
      organizationId: user.organizationId
    },
    select: { id: true }
  });

  if (!existing) {
    return error("Lancamento nao encontrado.", 404);
  }

  await prisma.financialTransaction.delete({
    where: { id: params.transactionId }
  });

  await audit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "financial_transaction.deleted",
    entity: "FinancialTransaction",
    entityId: params.transactionId
  });

  return json({ ok: true });
}
