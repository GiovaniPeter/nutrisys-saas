import { z } from "zod";
import { error, json, validationError } from "@/lib/api";
import { getCurrentPortalPatient } from "@/lib/patient-session";
import { prisma } from "@/lib/prisma";

const portalMessageSchema = z.object({
  text: z.string().trim().min(1, "Digite uma mensagem."),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
  attachmentType: z.string().optional()
});

export async function GET() {
  const patient = await getCurrentPortalPatient();

  if (!patient) {
    return error("Nao autenticado.", 401);
  }

  await prisma.chatMessage.updateMany({
    where: {
      organizationId: patient.organizationId,
      patientId: patient.id,
      sender: "PROFESSIONAL",
      readByPatientAt: null
    },
    data: { readByPatientAt: new Date() }
  });

  const messages = await prisma.chatMessage.findMany({
    where: {
      organizationId: patient.organizationId,
      patientId: patient.id
    },
    orderBy: { createdAt: "asc" },
    take: 200
  });

  return json({ messages });
}

export async function POST(request: Request) {
  const patient = await getCurrentPortalPatient();

  if (!patient) {
    return error("Nao autenticado.", 401);
  }

  try {
    const input = portalMessageSchema.parse(await request.json());
    const message = await prisma.chatMessage.create({
      data: {
        organizationId: patient.organizationId,
        patientId: patient.id,
        sender: "PATIENT",
        text: input.text,
        attachmentUrl: input.attachmentUrl || null,
        attachmentType: input.attachmentType || null,
        readByPatientAt: new Date()
      }
    });

    return json({ message }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
