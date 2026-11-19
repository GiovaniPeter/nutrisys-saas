"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

export const COOKIE_CONSENT_KEY = "clinos-cookie-consent";
export const COOKIE_CONSENT_EVENT = "clinos-cookie-consent-changed";

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  return value === "all";
}

export function ConsentAnalytics({ gaId }: { gaId?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(hasAnalyticsConsent());
    sync();

    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!gaId || !enabled) {
    return null;
  }

  return <GoogleAnalytics gaId={gaId} />;
}
