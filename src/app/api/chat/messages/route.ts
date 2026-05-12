import { NextRequest } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const messageSchema = z.object({
  patientId: z.string().min(1, "Informe o paciente."),
  text: z.string().trim().min(1, "Digite uma mensagem."),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
  attachmentType: z.string().optional()
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const patientId = request.nextUrl.searchParams.get("patientId") || undefined;

  if (patientId) {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!patient) {
      return error("Paciente nao encontrado.", 404);
    }

    await prisma.chatMessage.updateMany({
      where: {
        organizationId: user.organizationId,
        patientId,
        sender: "PATIENT",
        readByProfessionalAt: null
      },
      data: { readByProfessionalAt: new Date() }
    });
  }

  const messages = await prisma.chatMessage.findMany({
    where: {
      organizationId: user.organizationId,
      ...(patientId ? { patientId } : {})
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: patientId ? "asc" : "desc" },
    take: patientId ? 200 : 300
  });

  return json({ messages: patientId ? messages : messages.reverse() });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = messageSchema.parse(await request.json());
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

    const message = await prisma.chatMessage.create({
      data: {
        organizationId: user.organizationId,
        patientId: input.patientId,
        sender: "PROFESSIONAL",
        text: input.text,
        attachmentUrl: input.attachmentUrl || null,
        attachmentType: input.attachmentType || null,
        readByProfessionalAt: new Date()
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "chat_message.sent_by_professional",
      entity: "ChatMessage",
      entityId: message.id
    });

    return json({ message }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
