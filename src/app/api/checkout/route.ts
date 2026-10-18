import { NextRequest } from "next/server";
import { SubscriptionStatus } from "@prisma/client";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { createInfinitePayCheckoutLink } from "@/lib/infinitepay";
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
    const input = checkoutSchema.parse(await request.json());
    const plan = findPlan(input.planCode);

    if (!plan) {
      return error("Plano invalido.", 422);
    }

    const [existing, organization] = await Promise.all([
      getLatestSubscription(user.organizationId),
      prisma.organization.findUnique({
        where: { id: user.organizationId },
        select: { phone: true }
      })
    ]);

    const checkout = await createInfinitePayCheckoutLink({
      organizationId: user.organizationId,
      planCode: plan.code,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: organization?.phone
    });

    const isCurrentlyActive = existing?.status === SubscriptionStatus.ACTIVE && hasSubscriptionAccess(existing);
    const subscription = existing
      ? isCurrentlyActive
        ? existing
        : await prisma.subscription.update({
            where: { id: existing.id },
            data: {
              planCode: plan.code,
              provider: "INFINITEPAY",
              providerCustomerId: user.email,
              providerSubId: `pending:${checkout.orderNsu}`,
              status: hasSubscriptionAccess(existing) ? existing.status : SubscriptionStatus.PAST_DUE
            }
          })
      : await prisma.subscription.create({
          data: {
            organizationId: user.organizationId,
            planCode: plan.code,
            provider: "INFINITEPAY",
            providerCustomerId: user.email,
            providerSubId: `pending:${checkout.orderNsu}`,
            status: SubscriptionStatus.PAST_DUE
          }
        });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "subscription.infinitepay_checkout_created",
      entity: "Subscription",
      entityId: subscription.id,
      metadata: {
        planCode: plan.code,
        orderNsu: checkout.orderNsu,
        handle: checkout.handle,
        status: "pending"
      }
    });

    return json({
      success: true,
      checkoutUrl: checkout.checkoutUrl,
      providerSubId: checkout.orderNsu,
      status: "pending"
    });
  } catch (err) {
    if (err instanceof Error && !(err instanceof z.ZodError)) {
      console.error(err);
      return error(err.message, 502);
    }

    return validationError(err);
  }
}
