import { SubscriptionStatus, type Subscription } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const FREE_TRIAL_DAYS = 7;

export function hasSubscriptionAccess(
  subscription: Pick<Subscription, "status" | "trialEndsAt"> | null | undefined,
  now = new Date()
) {
  if (!subscription) {
    return false;
  }

  if (subscription.status === SubscriptionStatus.ACTIVE) {
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
      status: SubscriptionStatus.TRIALING,
      trialEndsAt: { lte: now }
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
