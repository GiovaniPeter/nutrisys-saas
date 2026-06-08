import { NextRequest } from "next/server";
import { InvalidWebhookSignatureError, WebhookSignatureValidator } from "mercadopago";
import { Prisma, SubscriptionStatus } from "@prisma/client";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import {
  mapMercadoPagoSubscriptionStatus,
  mpPreApproval,
  parseMercadoPagoDate,
  parseSubscriptionReference
} from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";

type MercadoPagoWebhookBody = {
  action?: string;
  data?: {
    id?: string;
  };
  id?: string;
  topic?: string;
  type?: string;
};

export async function POST(request: NextRequest) {
  let body: MercadoPagoWebhookBody;

  try {
    body = (await request.json()) as MercadoPagoWebhookBody;
  } catch {
    return error("Payload invalido.", 400);
  }

  const dataId = request.nextUrl.searchParams.get("data.id") || body.data?.id || body.id || null;

  try {
    validateWebhookSignature(request, dataId);
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) {
      console.error("Webhook Mercado Pago com assinatura invalida:", err.reason, err.requestId);
      return error("Assinatura invalida.", 401);
    }

    throw err;
  }

  const topic = body.type || body.topic || "";

  if (topic !== "subscription_preapproval") {
    return json({ received: true, ignored: topic || "unknown" });
  }

  if (!dataId) {
    return error("ID da assinatura ausente.", 400);
  }

  try {
    const preApproval = await mpPreApproval.get({ id: dataId });
    const subscription = await syncPreApproval(preApproval);

    return json({
      received: true,
      subscriptionId: subscription?.id || null
    });
  } catch (err) {
    return validationError(err);
  }
}

function validateWebhookSignature(request: NextRequest, dataId: string | null) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MERCADOPAGO_WEBHOOK_SECRET nao configurado.");
    }

    return;
  }

  WebhookSignatureValidator.validate({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
    secret,
    toleranceSeconds: 300
  });
}

async function syncPreApproval(preApproval: Awaited<ReturnType<typeof mpPreApproval.get>>) {
  const providerSubId = preApproval.id;

  if (!providerSubId) {
    throw new Error("Mercado Pago nao retornou ID da assinatura.");
  }

  const reference = parseSubscriptionReference(preApproval.external_reference);
  const existingByProvider = await prisma.subscription.findFirst({
    where: {
      provider: "MERCADO_PAGO",
      providerSubId
    },
    orderBy: { createdAt: "desc" }
  });
  const organizationId = reference?.organizationId || existingByProvider?.organizationId;

  if (!organizationId) {
    console.warn("Webhook Mercado Pago sem organizacao vinculada:", providerSubId, preApproval.external_reference);
    return null;
  }

  const latest = existingByProvider || await prisma.subscription.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" }
  });
  const planCode = reference?.planCode || latest?.planCode || "professional";
  const nextStatus = resolveLocalStatus(preApproval.status, latest?.status);
  const currentPeriodEndsAt = parseMercadoPagoDate(preApproval.next_payment_date);
  const providerCustomerId = preApproval.payer_id
    ? String(preApproval.payer_id)
    : preApproval.payer_email || latest?.providerCustomerId || null;

  const data: Prisma.SubscriptionUncheckedCreateInput | Prisma.SubscriptionUncheckedUpdateInput = {
    organizationId,
    planCode,
    provider: "MERCADO_PAGO",
    providerCustomerId,
    providerSubId,
    status: nextStatus,
    ...(currentPeriodEndsAt ? { currentPeriodEndsAt } : {})
  };

  const subscription = latest
    ? await prisma.subscription.update({
        where: { id: latest.id },
        data
      })
    : await prisma.subscription.create({
        data: {
          ...(data as Prisma.SubscriptionUncheckedCreateInput),
          status: nextStatus
        }
      });

  await audit({
    organizationId,
    action: "subscription.mercadopago_synced",
    entity: "Subscription",
    entityId: subscription.id,
    metadata: {
      providerSubId,
      mercadoPagoStatus: preApproval.status || null,
      planCode
    }
  });

  return subscription;
}

function resolveLocalStatus(mercadoPagoStatus?: string | null, currentStatus?: SubscriptionStatus) {
  const normalized = mapMercadoPagoSubscriptionStatus(mercadoPagoStatus);

  if ((mercadoPagoStatus || "").toLowerCase() === "pending" && currentStatus) {
    return currentStatus;
  }

  return normalized;
}
