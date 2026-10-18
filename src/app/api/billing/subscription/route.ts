import { NextRequest } from "next/server";
import { SubscriptionStatus } from "@prisma/client";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import {
  calculateNextPeriodEnd,
  checkInfinitePayPayment,
  parseInfinitePayOrderNsu
} from "@/lib/infinitepay";
import { findPlan, PLANS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getLatestSubscription } from "@/lib/subscriptions";

const subscriptionUpdateSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("cancel")
  }),
  z.object({
    action: z.literal("reactivate")
  })
]);

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  let subscription = await getLatestSubscription(user.organizationId);

  if (request.nextUrl.searchParams.get("sync") === "infinitepay") {
    const rawOrderNsu =
      request.nextUrl.searchParams.get("order_nsu") ||
      (subscription?.providerSubId?.startsWith("pending:")
        ? subscription.providerSubId.slice("pending:".length)
        : subscription?.providerSubId) ||
      null;
    const transactionNsu = request.nextUrl.searchParams.get("transaction_nsu");
    const slug =
      request.nextUrl.searchParams.get("slug") ||
      request.nextUrl.searchParams.get("invoice_slug");
    const reference = parseInfinitePayOrderNsu(rawOrderNsu);

    if (
      rawOrderNsu &&
      transactionNsu &&
      slug &&
      reference &&
      reference.organizationId === user.organizationId
    ) {
      try {
        const plan = findPlan(reference.planCode);
        const check = await checkInfinitePayPayment({
          handle: plan?.infinitePayEnrollment?.merchantHandle,
          orderNsu: rawOrderNsu,
          transactionNsu,
          slug
        });

        if (
          check.paid &&
          !(
            subscription?.provider === "INFINITEPAY" &&
            subscription.providerSubId === rawOrderNsu &&
            subscription.status === SubscriptionStatus.ACTIVE
          )
        ) {
          const currentPeriodEndsAt = calculateNextPeriodEnd(subscription);

          subscription = subscription
            ? await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                  planCode: reference.planCode,
                  provider: "INFINITEPAY",
                  providerCustomerId: transactionNsu,
                  providerSubId: rawOrderNsu,
                  status: SubscriptionStatus.ACTIVE,
                  currentPeriodEndsAt
                }
              })
            : await prisma.subscription.create({
                data: {
                  organizationId: user.organizationId,
                  planCode: reference.planCode,
                  provider: "INFINITEPAY",
                  providerCustomerId: transactionNsu,
                  providerSubId: rawOrderNsu,
                  status: SubscriptionStatus.ACTIVE,
                  currentPeriodEndsAt
                }
              });

          await audit({
            organizationId: user.organizationId,
            userId: user.id,
            action: "subscription.infinitepay_synced",
            entity: "Subscription",
            entityId: subscription.id,
            metadata: {
              orderNsu: rawOrderNsu,
              transactionNsu,
              slug,
              captureMethod: check.capture_method || null,
              paidAmount: check.paid_amount ?? check.amount ?? null,
              planCode: reference.planCode
            }
          });
        }
      } catch (err) {
        console.error("Falha ao confirmar assinatura no retorno da InfinitePay.", err);
      }
    }
  }

  if (request.nextUrl.searchParams.get("summary") === "1") {
    return json({ subscription });
  }

  const patientCount = await prisma.patient.count({
    where: { organizationId: user.organizationId }
  });

  return json({
    subscription,
    patientCount,
    plans: PLANS
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  if (!["OWNER", "ADMIN"].includes(user.role)) {
    return error("Apenas responsaveis da clinica podem alterar a assinatura.", 403);
  }

  try {
    const input = subscriptionUpdateSchema.parse(await request.json());
    const existing = await getLatestSubscription(user.organizationId);

    if (!existing) {
      return error("Assinatura nao encontrada.", 404);
    }

    if (input.action === "cancel") {
      const subscription = await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          status: SubscriptionStatus.CANCELED,
          currentPeriodEndsAt: existing.currentPeriodEndsAt || addDays(new Date(), 30)
        }
      });

      await audit({
        organizationId: user.organizationId,
        userId: user.id,
        action: "subscription.canceled",
        entity: "Subscription",
        entityId: subscription.id
      });

      return json({ subscription });
    }

    if (
      existing.currentPeriodEndsAt &&
      existing.currentPeriodEndsAt.getTime() > Date.now()
    ) {
      const subscription = await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          status: SubscriptionStatus.ACTIVE
        }
      });

      await audit({
        organizationId: user.organizationId,
        userId: user.id,
        action: "subscription.reactivated",
        entity: "Subscription",
        entityId: subscription.id,
        metadata: {
          provider: existing.provider || "INFINITEPAY",
          providerSubId: existing.providerSubId
        }
      });

      return json({ subscription });
    }

    return error(
      "Escolha um plano e conclua o pagamento na InfinitePay para reativar a assinatura.",
      409
    );
  } catch (err) {
    return validationError(err);
  }
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
