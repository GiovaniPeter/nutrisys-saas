"use client";

import { useEffect } from "react";
import { AnalyticsParams, trackEvent } from "@/lib/analytics";

type AnalyticsEventProps = {
  name: string;
  params?: AnalyticsParams;
};

export function AnalyticsEvent({ name, params = {} }: AnalyticsEventProps) {
  useEffect(() => {
    trackEvent(name, params);
  }, [name, params]);

  return null;
}
