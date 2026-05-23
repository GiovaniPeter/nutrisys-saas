"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AuthMeResponse = {
  user?: {
    id: string;
  } | null;
};

export function DashboardLink() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });

        if (!mounted || !response.ok) {
          return;
        }

        const data = (await response.json()) as AuthMeResponse;
        setAuthenticated(Boolean(data.user));
      } catch {
        // The public landing should never wait on the session badge.
      }
    }

    void loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (!authenticated) {
    return null;
  }

  return (
    <Link href="/dashboard" className="np-button np-button-ghost">
      Dashboard
    </Link>
  );
}
