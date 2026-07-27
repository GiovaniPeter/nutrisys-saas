"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { AnalyticsParams, trackEvent } from "@/lib/analytics";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  eventName: string;
  eventParams?: AnalyticsParams;
};

export function TrackedLink({
  eventName,
  eventParams = {},
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackEvent(eventName, eventParams);
        onClick?.(event);
      }}
    />
  );
}
