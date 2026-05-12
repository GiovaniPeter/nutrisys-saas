import { NextRequest } from "next/server";
import { SubscriptionStatus } from "@prisma/client";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { findPlan, PLANS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const subscriptionUpdateSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("change_plan"),
    planCode: z.string().min(1)
  }),
  z.object({
    action: z.literal("cancel")
  }),
  z.object({
    action: z.literal("reactivate")
  })
]);

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return error("Nao autenticado.", 401);
  }

  const subscription = await getLatestSubscription(user.organizationId);
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

  try {
    const input = subscriptionUpdateSchema.parse(await request.json());
    const existing = await getLatestSubscription(user.organizationId);

    if (!existing) {
      return error("Assinatura nao encontrada.", 404);
    }

    if (input.action === "change_plan") {
      const plan = findPlan(input.planCode);

      if (!plan) {
        return error("Plano invalido.", 422);
      }

      const subscription = await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planCode: plan.code,
          status: existing.status === SubscriptionStatus.CANCELED ? SubscriptionStatus.ACTIVE : existing.status,
          currentPeriodEndsAt: addDays(new Date(), 30)
        }
      });

      await audit({
        organizationId: user.organizationId,
        userId: user.id,
        action: "subscription.plan_changed",
        entity: "Subscription",
        entityId: subscription.id,
        metadata: {
          planCode: plan.code
        }
      });

      return json({ subscription });
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

    const subscription = await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEndsAt: addDays(new Date(), 30)
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "subscription.reactivated",
      entity: "Subscription",
      entityId: subscription.id
    });

    return json({ subscription });
  } catch (err) {
    return validationError(err);
  }
}

function getLatestSubscription(organizationId: string) {
  return prisma.subscription.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" }
  });
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
