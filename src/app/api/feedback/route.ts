import crypto from "node:crypto";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { buildEmailTemplate, sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const feedbackSchema = z.object({
  type: z.enum(["FEATURE", "BUG"]),
  title: z.string().trim().min(5, "Informe um título com pelo menos 5 caracteres.").max(120),
  area: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().min(20, "Descreva sua solicitação com pelo menos 20 caracteres.").max(4000),
  stepsToReproduce: z.string().trim().max(2000).optional().or(z.literal("")),
  expectedResult: z.string().trim().max(1000).optional().or(z.literal("")),
  userAgent: z.string().trim().max(500).optional().or(z.literal(""))
});

const feedbackLabels = {
  FEATURE: "Solicitação de função",
  BUG: "Relatório de bug"
} as const;

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  try {
    const recentRequests = await prisma.auditLog.count({
      where: {
        userId: user.id,
        action: "feedback.submitted",
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000)
        }
      }
    });

    if (recentRequests >= 5) {
      return error("Você enviou várias solicitações recentemente. Aguarde alguns minutos e tente novamente.", 429);
    }

    const input = feedbackSchema.parse(await request.json());
    const requestId = crypto.randomUUID();
    const label = feedbackLabels[input.type];

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "feedback.submitted",
      entity: "FeedbackRequest",
      entityId: requestId,
      metadata: {
        type: input.type,
        title: input.title,
        area: input.area || null,
        description: input.description,
        stepsToReproduce: input.stepsToReproduce || null,
        expectedResult: input.expectedResult || null,
        userAgent: input.userAgent || null
      }
    });

    const content = [
      emailRow("Tipo", label),
      emailRow("Protocolo", requestId),
      emailRow("Usuário", `${user.name} (${user.email})`),
      emailRow("Organização", user.organizationId),
      emailRow("Área", input.area || "Não informada"),
      emailSection("Descrição", input.description),
      input.stepsToReproduce ? emailSection("Passos para reproduzir", input.stepsToReproduce) : "",
      input.expectedResult ? emailSection("Resultado esperado", input.expectedResult) : "",
      input.userAgent ? emailSection("Navegador e dispositivo", input.userAgent) : ""
    ].join("");

    try {
      await sendEmail({
        to: process.env.FEEDBACK_EMAIL || process.env.SUPPORT_EMAIL || "contato@clinos.tec.br",
        subject: `[ClinOS] ${label}: ${input.title}`,
        html: buildEmailTemplate(label, content)
      });
    } catch (emailError) {
      console.error("Solicitação registrada, mas a notificação de feedback falhou:", emailError);
    }

    return json({ success: true, requestId }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}

function emailRow(label: string, value: string) {
  return `<p style="margin: 0 0 10px;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

function emailSection(label: string, value: string) {
  return `<div style="margin-top: 20px;"><strong>${escapeHtml(label)}</strong><p style="white-space: pre-wrap; margin: 6px 0 0;">${escapeHtml(value)}</p></div>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
