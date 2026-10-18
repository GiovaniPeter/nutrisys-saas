import { NextRequest } from "next/server";
import { Prisma, SubscriptionStatus } from "@prisma/client";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import {
  calculateNextPeriodEnd,
  checkInfinitePayPayment,
  type InfinitePayWebhookPayload,
  parseInfinitePayOrderNsu,
  verifyInfinitePayWebhookSignature
} from "@/lib/infinitepay";
import { findPlan } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  let body: InfinitePayWebhookPayload;

  try {
    body = (await request.json()) as InfinitePayWebhookPayload;
  } catch {
    return error("Payload invalido.", 400);
  }

  const orderNsu = body.order_nsu || request.nextUrl.searchParams.get("order_nsu") || null;
  const reference = parseInfinitePayOrderNsu(orderNsu);

  if (!orderNsu || !reference) {
    return json({ received: true, ignored: "invalid_order_nsu" });
  }

  const signature = request.nextUrl.searchParams.get("sig");
  const hasValidSignature = verifyInfinitePayWebhookSignature(orderNsu, signature);
  const slug = body.invoice_slug || body.slug || null;
  const transactionNsu = body.transaction_nsu || null;
  const plan = findPlan(reference.planCode);

  if (!hasValidSignature) {
    if (!slug || !transactionNsu) {
      return error("Assinatura do webhook invalida.", 401);
    }

    const check = await checkInfinitePayPayment({
      handle: plan?.infinitePayEnrollment?.merchantHandle,
      orderNsu,
      transactionNsu,
      slug
    });

    if (!check.paid) {
      return error("Pagamento nao confirmado na InfinitePay.", 401);
    }
  } else if (slug && transactionNsu) {
    const check = await checkInfinitePayPayment({
      handle: plan?.infinitePayEnrollment?.merchantHandle,
      orderNsu,
      transactionNsu,
      slug
    });

    if (check.success && !check.paid) {
      return json({ received: true, status: "pending" });
    }
  }

  try {
    const subscription = await syncInfinitePaySubscription({
      orderNsu,
      organizationId: reference.organizationId,
      planCode: reference.planCode,
      transactionNsu,
      slug,
      captureMethod: body.capture_method || null,
      receiptUrl: body.receipt_url || null,
      paidAmount: body.paid_amount ?? body.amount ?? null
    });

    return json({
      received: true,
      subscriptionId: subscription?.id || null
    });
  } catch (err) {
    return validationError(err);
  }
}

async function syncInfinitePaySubscription(input: {
  orderNsu: string;
  organizationId: string;
  planCode: string;
  transactionNsu: string | null;
  slug: string | null;
  captureMethod: string | null;
  receiptUrl: string | null;
  paidAmount: number | null;
}) {
  const latest = await prisma.subscription.findFirst({
    where: { organizationId: input.organizationId },
    orderBy: { createdAt: "desc" }
  });

  if (
    latest &&
    latest.provider === "INFINITEPAY" &&
    latest.providerSubId === input.orderNsu &&
    latest.status === SubscriptionStatus.ACTIVE
  ) {
    return latest;
  }

  const currentPeriodEndsAt = calculateNextPeriodEnd(latest);
  const providerCustomerId = input.transactionNsu || input.slug || latest?.providerCustomerId || null;

  const data: Prisma.SubscriptionUncheckedCreateInput | Prisma.SubscriptionUncheckedUpdateInput = {
    organizationId: input.organizationId,
    planCode: input.planCode,
    provider: "INFINITEPAY",
    providerCustomerId,
    providerSubId: input.orderNsu,
    status: SubscriptionStatus.ACTIVE,
    currentPeriodEndsAt
  };

  const subscription = latest
    ? await prisma.subscription.update({
        where: { id: latest.id },
        data
      })
    : await prisma.subscription.create({
        data: {
          ...(data as Prisma.SubscriptionUncheckedCreateInput),
          status: SubscriptionStatus.ACTIVE
        }
      });

  await audit({
    organizationId: input.organizationId,
    action: "subscription.infinitepay_synced",
    entity: "Subscription",
    entityId: subscription.id,
    metadata: {
      orderNsu: input.orderNsu,
      transactionNsu: input.transactionNsu,
      slug: input.slug,
      captureMethod: input.captureMethod,
      receiptUrl: input.receiptUrl,
      paidAmount: input.paidAmount,
      planCode: input.planCode
    }
  });

  return subscription;
}
