import { MercadoPagoConfig, PreApproval, PreApprovalPlan, Preference } from "mercadopago";
import { SubscriptionStatus } from "@prisma/client";
import { findPlan } from "@/lib/plans";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";

export const mpClient = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });

export const mpPreference = new Preference(mpClient);
export const mpPreApproval = new PreApproval(mpClient);
export const mpPreApprovalPlan = new PreApprovalPlan(mpClient);

const EXTERNAL_REFERENCE_PREFIX = "nutriplan_subscription";

export type MercadoPagoSubscriptionReference = {
  organizationId: string;
  planCode: string;
};

export function assertMercadoPagoConfigured() {
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN nao configurado.");
  }
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

export function moneyFromCents(cents: number) {
  return Number((cents / 100).toFixed(2));
}

export function buildSubscriptionReference(input: MercadoPagoSubscriptionReference) {
  return `${EXTERNAL_REFERENCE_PREFIX}:${input.organizationId}:${input.planCode}`;
}

export function parseSubscriptionReference(reference?: string | null): MercadoPagoSubscriptionReference | null {
  if (!reference) {
    return null;
  }

  const [prefix, organizationId, planCode] = reference.split(":");

  if (prefix !== EXTERNAL_REFERENCE_PREFIX || !organizationId || !planCode || !findPlan(planCode)) {
    return null;
  }

  return { organizationId, planCode };
}

export function mapMercadoPagoSubscriptionStatus(status?: string | null): SubscriptionStatus {
  switch ((status || "").toLowerCase()) {
    case "authorized":
      return SubscriptionStatus.ACTIVE;
    case "cancelled":
    case "canceled":
      return SubscriptionStatus.CANCELED;
    case "paused":
    case "pending":
      return SubscriptionStatus.PAST_DUE;
    default:
      return SubscriptionStatus.PAST_DUE;
  }
}

export function parseMercadoPagoDate(value?: string | number | null) {
  if (!value) {
    return null;
  }

  const date = typeof value === "number" ? new Date(value) : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}
