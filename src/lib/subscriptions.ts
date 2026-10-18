import { SubscriptionStatus, type Subscription } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const FREE_TRIAL_DAYS = 7;

export function hasSubscriptionAccess(
  subscription:
    | (Pick<Subscription, "status" | "trialEndsAt"> & {
        currentPeriodEndsAt?: Date | null;
      })
    | null
    | undefined,
  now = new Date()
) {
  if (!subscription) {
    return false;
  }

  if (subscription.status === SubscriptionStatus.ACTIVE) {
    if (subscription.currentPeriodEndsAt && subscription.currentPeriodEndsAt <= now) {
      return false;
    }

    return true;
  }

  if (
    subscription.status === SubscriptionStatus.CANCELED &&
    subscription.currentPeriodEndsAt &&
    subscription.currentPeriodEndsAt > now
  ) {
    return true;
  }

  return (
    subscription.status === SubscriptionStatus.TRIALING &&
    Boolean(subscription.trialEndsAt && subscription.trialEndsAt > now)
  );
}

export async function expireElapsedTrials(organizationId: string, now = new Date()) {
  await prisma.subscription.updateMany({
    where: {
      organizationId,
      OR: [
        {
          status: SubscriptionStatus.TRIALING,
          trialEndsAt: { lte: now }
        },
        {
          status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELED] },
          currentPeriodEndsAt: { lte: now }
        }
      ]
    },
    data: {
      status: SubscriptionStatus.EXPIRED
    }
  });
}

export async function getLatestSubscription(organizationId: string) {
  await expireElapsedTrials(organizationId);

  return prisma.subscription.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" }
  });
}
