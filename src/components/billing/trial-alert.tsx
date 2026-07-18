"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Subscription = {
  status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
  trialEndsAt: string | null;
};

type BillingResponse = {
  subscription: Subscription | null;
};

export function TrialAlert({ userRole }: { userRole: string }) {
  const [subscription, setSubscription] = useState<Subscription | null | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/billing/subscription?summary=1", {
      cache: "no-store",
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as BillingResponse;
        setSubscription(data.subscription);
      })
      .catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Não foi possível carregar o estado da assinatura.", err);
        }
      });

    return () => controller.abort();
  }, []);

  const trial = useMemo(() => {
    if (subscription?.status !== "TRIALING" || !subscription.trialEndsAt) {
      return null;
    }

    const endsAt = new Date(subscription.trialEndsAt);
    const remainingMs = endsAt.getTime() - Date.now();

    if (Number.isNaN(endsAt.getTime()) || remainingMs <= 0) {
      return null;
    }

    return {
      days: Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000))),
      formattedEnd: new Intl.DateTimeFormat("pt-BR").format(endsAt)
    };
  }, [subscription]);

  if (subscription === undefined || subscription?.status === "ACTIVE") {
    return null;
  }

  const canManageBilling = userRole === "OWNER" || userRole === "ADMIN";
  const isTrialActive = Boolean(trial);
  const title = trial
    ? trial.days === 1
      ? "Seu teste gratuito termina hoje"
      : `${trial.days} dias de teste gratuito restantes`
    : "Ative sua assinatura para continuar";
  const description = trial
    ? `Use todos os recursos sem cartão até ${trial.formattedEnd}. Ao ativar agora, a cobrança começa somente após o teste.`
    : "Seu teste terminou ou a assinatura precisa de atenção. Escolha um plano para manter os recursos da clínica disponíveis.";

  return (
    <section
      className={isTrialActive ? "trial-alert" : "trial-alert trial-alert-urgent"}
      role={isTrialActive ? "status" : "alert"}
      aria-label="Situação da assinatura"
    >
      <span className="trial-alert-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </span>

      <div className="trial-alert-copy">
        <span className="trial-alert-kicker">{isTrialActive ? "7 dias grátis · sem cartão" : "Assinatura inativa"}</span>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      {canManageBilling ? (
        <Link className="trial-alert-action" href="/billing">
          {isTrialActive ? "Ativar assinatura" : "Escolher plano"}
          <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <small className="trial-alert-owner-note">Peça ao responsável da clínica para ativar.</small>
      )}
    </section>
  );
}
