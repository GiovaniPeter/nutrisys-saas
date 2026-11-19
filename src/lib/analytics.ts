"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { hasAnalyticsConsent } from "@/components/analytics/consent-analytics";

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (
    typeof window === "undefined" ||
    !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    !hasAnalyticsConsent()
  ) {
    return;
  }

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );

  sendGAEvent("event", eventName, cleanParams);
}
