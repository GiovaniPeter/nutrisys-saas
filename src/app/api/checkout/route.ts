import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { SubscriptionStatus } from "@prisma/client";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import {
  assertMercadoPagoConfigured,
  buildSubscriptionReference,
  getAppUrl,
  moneyFromCents,
  mpPreApproval,
  parseMercadoPagoDate
} from "@/lib/mercadopago";
import { findPlan } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getLatestSubscription, hasSubscriptionAccess } from "@/lib/subscriptions";

const checkoutSchema = z.object({
  planCode: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  if (!["OWNER", "ADMIN"].includes(user.role)) {
    return error("Apenas responsaveis da clinica podem alterar a assinatura.", 403);
  }

  try {
    assertMercadoPagoConfigured();

    const input = checkoutSchema.parse(await request.json());
    const plan = findPlan(input.planCode);

    if (!plan) {
      return error("Plano invalido.", 422);
    }

    let existing = await getLatestSubscription(user.organizationId);
    let providerPreApproval: Awaited<ReturnType<typeof mpPreApproval.get>> | null = null;

    if (
      existing?.provider === "MERCADO_PAGO" &&
      existing.providerSubId &&
      existing.status !== SubscriptionStatus.ACTIVE
    ) {
      providerPreApproval = await mpPreApproval.get({ id: existing.providerSubId });

      if ((providerPreApproval.status || "").toLowerCase() === "authorized") {
        existing = await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            status: SubscriptionStatus.ACTIVE,
            providerCustomerId: providerPreApproval.payer_id
              ? String(providerPreApproval.payer_id)
              : existing.providerCustomerId,
            currentPeriodEndsAt:
              parseMercadoPagoDate(providerPreApproval.next_payment_date) || existing.currentPeriodEndsAt
          }
        });
      }
    }

    if (
      existing?.provider === "MERCADO_PAGO" &&
      existing.providerSubId &&
      existing.status === SubscriptionStatus.ACTIVE
    ) {
      const updatedPreApproval = await mpPreApproval.update({
        id: existing.providerSubId,
        body: {
          reason: buildReason(plan.name),
          external_reference: buildSubscriptionReference({
            organizationId: user.organizationId,
            planCode: plan.code
          }),
          auto_recurring: {
            transaction_amount: moneyFromCents(plan.monthlyPriceCents),
            currency_id: "BRL"
          }
        },
        requestOptions: { idempotencyKey: randomUUID() }
      });

      const subscription = await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planCode: plan.code,
          provider: "MERCADO_PAGO",
          providerCustomerId: updatedPreApproval.payer_id ? String(updatedPreApproval.payer_id) : existing.providerCustomerId,
          providerSubId: updatedPreApproval.id || existing.providerSubId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEndsAt: parseMercadoPagoDate(updatedPreApproval.next_payment_date) || existing.currentPeriodEndsAt
        }
      });

      await audit({
        organizationId: user.organizationId,
        userId: user.id,
        action: "subscription.mercadopago_plan_updated",
        entity: "Subscription",
        entityId: subscription.id,
        metadata: {
          planCode: plan.code,
          providerSubId: subscription.providerSubId
        }
      });

      return json({ success: true, subscription });
    }

    const appUrl = getAppUrl();
    const planReason = buildReason(plan.name);
    const externalReference = buildSubscriptionReference({
      organizationId: user.organizationId,
      planCode: plan.code
    });

    if (
      existing?.providerSubId &&
      providerPreApproval &&
      (providerPreApproval.status || "").toLowerCase() === "pending" &&
      providerPreApproval.init_point
    ) {
      const updatedPreApproval = await mpPreApproval.update({
        id: existing.providerSubId,
        body: {
          reason: planReason,
          external_reference: externalReference,
          payer_email: user.email,
          back_url: `${appUrl}/billing?checkout=mercadopago`,
          auto_recurring: {
            transaction_amount: moneyFromCents(plan.monthlyPriceCents),
            currency_id: "BRL"
          }
        },
        requestOptions: { idempotencyKey: randomUUID() }
      });
      const checkoutUrl = updatedPreApproval.init_point || providerPreApproval.init_point;
      const subscription = await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planCode: plan.code,
          provider: "MERCADO_PAGO",
          providerSubId: updatedPreApproval.id || existing.providerSubId,
          status: hasSubscriptionAccess(existing) ? existing.status : SubscriptionStatus.PAST_DUE
        }
      });

      await audit({
        organizationId: user.organizationId,
        userId: user.id,
        action: "subscription.mercadopago_checkout_reused",
        entity: "Subscription",
        entityId: subscription.id,
        metadata: {
          planCode: plan.code,
          providerSubId: subscription.providerSubId,
          status: "pending"
        }
      });

      return json({
        success: true,
        checkoutUrl,
        providerSubId: subscription.providerSubId,
        status: "pending"
      });
    }

    const trialStartDate = getFutureTrialEnd(existing?.trialEndsAt);
    const preApproval = await mpPreApproval.create({
      body: {
        reason: planReason,
        external_reference: externalReference,
        payer_email: user.email,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          ...(trialStartDate ? { start_date: trialStartDate } : {}),
          transaction_amount: moneyFromCents(plan.monthlyPriceCents),
          currency_id: "BRL"
        },
        back_url: `${appUrl}/billing?checkout=mercadopago`,
        status: "pending"
      },
      requestOptions: { idempotencyKey: randomUUID() }
    });

    if (!preApproval.id || !preApproval.init_point) {
      return error("Erro ao obter link de ativação da assinatura.", 502);
    }

    const subscriptionData = {
      planCode: plan.code,
      provider: "MERCADO_PAGO",
      providerCustomerId: preApproval.payer_id ? String(preApproval.payer_id) : user.email,
      providerSubId: preApproval.id,
      status: hasSubscriptionAccess(existing) ? existing!.status : SubscriptionStatus.PAST_DUE,
      currentPeriodEndsAt: parseMercadoPagoDate(preApproval.next_payment_date)
    };
    const subscription = existing
      ? await prisma.subscription.update({
          where: { id: existing.id },
          data: subscriptionData
        })
      : await prisma.subscription.create({
          data: {
            organizationId: user.organizationId,
            ...subscriptionData
          }
        });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "subscription.mercadopago_checkout_created",
      entity: "Subscription",
      entityId: subscription.id,
      metadata: {
        planCode: plan.code,
        providerSubId: preApproval.id,
        firstChargeAt: trialStartDate,
        status: "pending"
      }
    });

    return json({
      success: true,
      checkoutUrl: preApproval.init_point,
      providerSubId: preApproval.id,
      status: "pending"
    });
  } catch (err) {
    if (isMercadoPagoError(err)) {
      console.error(err);
      return error(`Mercado Pago: ${err.message}`, 502);
    }

    return validationError(err);
  }
}

function buildReason(planName: string) {
  return `ClinOS - Plano ${planName}`;
}

function getFutureTrialEnd(trialEndsAt?: Date | null) {
  if (!trialEndsAt) {
    return null;
  }

  const minimumLeadTime = Date.now() + 10 * 60 * 1000;
  return trialEndsAt.getTime() > minimumLeadTime ? trialEndsAt.toISOString() : null;
}

function isMercadoPagoError(err: unknown): err is { message: string; status?: number } {
  return (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message?: unknown }).message === "string" &&
    "status" in err
  );
}
