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
  mpPreApprovalPlan,
  parseMercadoPagoDate
} from "@/lib/mercadopago";
import { findPlan } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

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

    const existing = await prisma.subscription.findFirst({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: "desc" }
    });

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

    // Encontra ou cria o plano no Mercado Pago para evitar o bug de trial em assinaturas diretas
    const planSearch = await mpPreApprovalPlan.search({
      options: { status: "active", q: planReason }
    });

    let mpPlanId = planSearch.results?.find((p) => p.reason === planReason)?.id;

    if (!mpPlanId) {
      const newPlan = await mpPreApprovalPlan.create({
        body: {
          reason: planReason,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: moneyFromCents(plan.monthlyPriceCents),
            currency_id: "BRL",
            free_trial: {
              frequency: 7,
              frequency_type: "days"
            }
          },
          back_url: `${appUrl}/billing?checkout=mercadopago`
        },
        requestOptions: { idempotencyKey: randomUUID() }
      });
      mpPlanId = newPlan.id;
    }

    if (!mpPlanId) {
      return error("Erro ao configurar plano de assinatura no provedor.", 502);
    }

    const preApproval = await mpPreApproval.create({
      body: {
        reason: planReason,
        external_reference: buildSubscriptionReference({
          organizationId: user.organizationId,
          planCode: plan.code
        }),
        payer_email: user.email,
        preapproval_plan_id: mpPlanId,
        back_url: `${appUrl}/billing?checkout=mercadopago`,
        status: "pending"
      },
      requestOptions: { idempotencyKey: randomUUID() }
    });

    if (!preApproval.init_point) {
      return error("Mercado Pago nao retornou o link de checkout.", 502);
    }

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "subscription.mercadopago_checkout_created",
      entity: "Subscription",
      entityId: existing?.id,
      metadata: {
        planCode: plan.code,
        providerSubId: preApproval.id,
        status: preApproval.status
      }
    });

    return json({
      success: true,
      checkoutUrl: preApproval.init_point,
      providerSubId: preApproval.id,
      status: preApproval.status
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
  return `NutreClin - Plano ${planName}`;
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
