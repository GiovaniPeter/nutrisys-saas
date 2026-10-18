import { createHmac, timingSafeEqual } from "node:crypto";
import { findPlan, type PlanCode } from "@/lib/plans";

const EXTERNAL_REFERENCE_PREFIX = "nutriplan_subscription";

export const INFINITEPAY_CHECKOUT_LINKS_URL =
  "https://api.checkout.infinitepay.io/links";
export const INFINITEPAY_PAYMENT_CHECK_URL =
  "https://api.checkout.infinitepay.io/payment_check";

export type InfinitePaySubscriptionReference = {
  organizationId: string;
  planCode: PlanCode;
};

export type InfinitePayCreateLinkInput = {
  organizationId: string;
  planCode: PlanCode;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
};

export type InfinitePayWebhookPayload = {
  invoice_slug?: string;
  slug?: string;
  amount?: number;
  paid_amount?: number;
  installments?: number;
  capture_method?: string;
  transaction_nsu?: string;
  order_nsu?: string;
  receipt_url?: string;
};

export type InfinitePayPaymentCheckResult = {
  success: boolean;
  paid: boolean;
  amount?: number;
  paid_amount?: number;
  installments?: number;
  capture_method?: string;
};

export function getInfinitePayHandle(planHandle?: string) {
  const raw = process.env.INFINITEPAY_HANDLE || planHandle || "rotuloconforme";
  return raw.trim().replace(/^\$/, "");
}

export function getAppUrl() {
  const appUrl = process.env.APP_URL?.replace(/\/$/, "");

  if (appUrl) {
    return appUrl.startsWith("http") ? appUrl : `https://${appUrl}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.replace(/\/$/, "");

  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}

export function buildInfinitePayOrderNsu(
  input: InfinitePaySubscriptionReference,
  nonce: string | number = Date.now()
) {
  return `${EXTERNAL_REFERENCE_PREFIX}:${input.organizationId}:${input.planCode}:${nonce}`;
}

export function parseInfinitePayOrderNsu(
  orderNsu?: string | null
): InfinitePaySubscriptionReference | null {
  if (!orderNsu) {
    return null;
  }

  const [prefix, organizationId, planCode] = orderNsu.split(":");
  const plan = planCode ? findPlan(planCode) : undefined;

  if (prefix !== EXTERNAL_REFERENCE_PREFIX || !organizationId || !plan) {
    return null;
  }

  return {
    organizationId,
    planCode: plan.code
  };
}

export function signInfinitePayWebhookOrder(orderNsu: string) {
  const secret =
    process.env.INFINITEPAY_WEBHOOK_SECRET ||
    process.env.SESSION_SECRET ||
    "nutriplan-infinitepay-webhook";

  return createHmac("sha256", secret).update(orderNsu).digest("base64url");
}

export function verifyInfinitePayWebhookSignature(
  orderNsu?: string | null,
  signature?: string | null
) {
  if (!orderNsu || !signature) {
    return false;
  }

  const expected = Buffer.from(signInfinitePayWebhookOrder(orderNsu));
  const received = Buffer.from(signature);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export function normalizeBrazilianPhone(phone?: string | null): string | undefined {
  if (!phone) {
    return undefined;
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }

  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    return `+${digits}`;
  }

  return undefined;
}

export async function createInfinitePayCheckoutLink(input: InfinitePayCreateLinkInput) {
  const plan = findPlan(input.planCode);

  if (!plan) {
    throw new Error("Plano invalido.");
  }

  const handle = getInfinitePayHandle(plan.infinitePayEnrollment?.merchantHandle);
  const orderNsu = buildInfinitePayOrderNsu({
    organizationId: input.organizationId,
    planCode: plan.code
  });
  const appUrl = getAppUrl();
  const signature = signInfinitePayWebhookOrder(orderNsu);
  const redirectUrl = `${appUrl}/billing?checkout=infinitepay`;
  const webhookUrl = `${appUrl}/api/webhooks/infinitepay?sig=${encodeURIComponent(signature)}`;
  const phone = normalizeBrazilianPhone(input.customerPhone);

  const payload = {
    handle,
    order_nsu: orderNsu,
    redirect_url: redirectUrl,
    webhook_url: webhookUrl,
    ...(input.customerName && input.customerEmail
      ? {
          customer: {
            name: input.customerName,
            email: input.customerEmail,
            ...(phone ? { phone_number: phone } : {})
          }
        }
      : {}),
    items: [
      {
        quantity: 1,
        price: plan.monthlyPriceCents,
        description: `ClinOS - Plano ${plan.name} (Mensal)`
      }
    ]
  };

  const response = await fetch(INFINITEPAY_CHECKOUT_LINKS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000)
  });

  const data = (await response.json().catch(() => null)) as {
    url?: string;
    message?: string;
    error?: string;
  } | null;

  if (!response.ok || !data?.url) {
    const reason = data?.message || data?.error || `HTTP ${response.status}`;
    throw new Error(`Erro ao gerar link na InfinitePay: ${reason}`);
  }

  return {
    checkoutUrl: data.url,
    orderNsu,
    handle
  };
}

export async function checkInfinitePayPayment(params: {
  handle?: string;
  orderNsu: string;
  transactionNsu: string;
  slug: string;
}): Promise<InfinitePayPaymentCheckResult> {
  const handle = getInfinitePayHandle(params.handle);

  const response = await fetch(INFINITEPAY_PAYMENT_CHECK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      handle,
      order_nsu: params.orderNsu,
      transaction_nsu: params.transactionNsu,
      slug: params.slug
    }),
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    return { success: false, paid: false };
  }

  const data = (await response.json().catch(() => null)) as {
    success?: boolean;
    paid?: boolean;
    amount?: number;
    paid_amount?: number;
    installments?: number;
    capture_method?: string;
  } | null;

  if (!data) {
    return { success: false, paid: false };
  }

  return {
    success: Boolean(data.success),
    paid: Boolean(data.paid ?? data.success),
    amount: data.amount,
    paid_amount: data.paid_amount,
    installments: data.installments,
    capture_method: data.capture_method
  };
}

export function calculateNextPeriodEnd(
  existing?: {
    status?: string | null;
    trialEndsAt?: Date | null;
    currentPeriodEndsAt?: Date | null;
  } | null,
  now = new Date()
) {
  const candidates = [
    existing?.currentPeriodEndsAt,
    existing?.status === "TRIALING" ? existing.trialEndsAt : null
  ].filter((date): date is Date => Boolean(date && date.getTime() > now.getTime()));

  const baseDate =
    candidates.length > 0
      ? new Date(Math.max(...candidates.map((d) => d.getTime())))
      : new Date(now);

  const next = new Date(baseDate);
  next.setDate(next.getDate() + 30);
  return next;
}
