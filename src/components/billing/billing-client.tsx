"use client";

import { useEffect, useMemo, useState } from "react";

type Plan = {
  code: string;
  name: string;
  monthlyPriceCents: number;
  patientLimit: number | null;
  features: string[];
};

type Subscription = {
  id: string;
  planCode: string;
  status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
  provider: string | null;
  providerSubId: string | null;
  trialEndsAt: string | null;
  currentPeriodEndsAt: string | null;
};

type BillingResponse = {
  subscription: Subscription | null;
  patientCount: number;
  plans: Plan[];
};

const statusLabels: Record<Subscription["status"], string> = {
  TRIALING: "Trial",
  ACTIVE: "Ativa",
  PAST_DUE: "Pagamento pendente",
  CANCELED: "Cancelada",
  EXPIRED: "Expirada"
};

export function BillingClient() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [patientCount, setPatientCount] = useState(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState<string | null>(null);

  const currentPlan = useMemo(
    () => plans.find((plan) => plan.code === subscription?.planCode) || null,
    [plans, subscription]
  );
  const patientUsagePct =
    currentPlan?.patientLimit && currentPlan.patientLimit > 0
      ? Math.min((patientCount / currentPlan.patientLimit) * 100, 100)
      : null;

  useEffect(() => {
    void loadBilling();
  }, []);

  async function loadBilling() {
    setLoading(true);
    const response = await fetch("/api/billing/subscription");
    const data = (await response.json()) as BillingResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar assinatura.");
      return;
    }

    setSubscription(data.subscription);
    setPatientCount(data.patientCount);
    setPlans(data.plans);
  }

  async function updateSubscription(action: "change_plan" | "cancel" | "reactivate", planCode?: string) {
    const key = planCode ? `${action}:${planCode}` : action;
    setSavingAction(key);
    setMessage(null);

    const response = await fetch("/api/billing/subscription", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...(planCode ? { planCode } : {}) })
    });
    const data = (await response.json()) as { subscription?: Subscription; error?: string };
    setSavingAction(null);

    if (!response.ok || !data.subscription) {
      setMessage(data.error || "Nao foi possivel atualizar assinatura.");
      return;
    }

    setSubscription(data.subscription);
    setMessage("Assinatura atualizada com sucesso.");
  }

  async function startCheckout(planCode: string) {
    const key = `checkout:${planCode}`;
    setSavingAction(key);
    setMessage(null);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planCode })
    });
    const data = (await response.json()) as {
      checkoutUrl?: string;
      subscription?: Subscription;
      error?: string;
    };
    setSavingAction(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel iniciar checkout.");
      return;
    }

    if (data.subscription) {
      setSubscription(data.subscription);
      setMessage("Plano atualizado no Mercado Pago.");
      return;
    }

    if (!data.checkoutUrl) {
      setMessage("Mercado Pago nao retornou o link de checkout.");
      return;
    }

    window.location.assign(data.checkoutUrl);
  }

  return (
    <section className="billing-layout">
      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Plano atual</span>
            <h2>{currentPlan?.name || "Sem plano"}</h2>
          </div>
          <span className={subscription?.status === "ACTIVE" ? "status-pill ok" : "status-pill"}>
            {subscription ? statusLabels[subscription.status] : "Indefinida"}
          </span>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        {subscription?.status === "PAST_DUE" || subscription?.status === "CANCELED" ? (
          <div className="expiration-warning">
            <strong>Atenção:</strong> Sua assinatura está pendente ou cancelada. Regularize para evitar o bloqueio de acesso dos seus pacientes.
          </div>
        ) : subscription?.status === "TRIALING" ? (
          <div className="expiration-warning" style={{ background: '#e0f2fe', borderColor: '#bae6fd', color: '#0369a1' }}>
            <strong>Trial Ativo:</strong> Você está no período de testes. Assine um plano para continuar aproveitando todos os recursos.
          </div>
        ) : null}

        <div className="billing-summary">
          <div>
            <strong>{currentPlan ? formatMoney(currentPlan.monthlyPriceCents) : "-"}</strong>
            <span>Mensalidade</span>
          </div>
          <div>
            <strong>{patientCount}</strong>
            <span>Pacientes cadastrados</span>
          </div>
          <div>
            <strong>{currentPlan?.patientLimit || "Ilimitado"}</strong>
            <span>Limite de pacientes</span>
          </div>
          <div>
            <strong>{formatDate(subscription?.trialEndsAt || subscription?.currentPeriodEndsAt)}</strong>
            <span>{subscription?.status === "TRIALING" ? "Fim do trial" : "Periodo atual"}</span>
          </div>
        </div>

        {patientUsagePct !== null ? (
          <div className="usage-block">
            <div className="usage-label">
              <span>Uso do limite</span>
              <strong>{patientUsagePct.toFixed(0)}%</strong>
            </div>
            <div className="usage-bar" aria-label="Uso do limite de pacientes">
              <span style={{ width: `${patientUsagePct}%` }} />
            </div>
          </div>
        ) : null}

        <div className="row-actions billing-actions">
          {subscription?.status === "CANCELED" ? (
            <button
              className="button"
              type="button"
              disabled={savingAction === "reactivate"}
              onClick={() => void updateSubscription("reactivate")}
            >
              {savingAction === "reactivate" ? "Reativando..." : "Reativar assinatura"}
            </button>
          ) : (
            <button
              className="button secondary"
              type="button"
              disabled={savingAction === "cancel"}
              onClick={() => void updateSubscription("cancel")}
            >
              {savingAction === "cancel" ? "Cancelando..." : "Cancelar assinatura"}
            </button>
          )}
        </div>

        <p className="billing-note">
          As assinaturas sao processadas pelo Mercado Pago. A ativacao pode levar alguns instantes apos a autorizacao.
        </p>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => {
          const active = plan.code === subscription?.planCode;
          const hasMercadoPagoSubscription = Boolean(
            subscription?.provider === "MERCADO_PAGO" &&
            subscription.providerSubId &&
            subscription.status === "ACTIVE"
          );
          const currentPlanIsPaid = active && hasMercadoPagoSubscription;
          const actionKey = `checkout:${plan.code}`;
          const buttonLabel = currentPlanIsPaid
            ? "Plano atual"
            : active
              ? "Ativar assinatura"
              : "Assinar este plano";

          return (
            <article className={active ? "plan-option active" : "plan-option"} key={plan.code}>
              <div>
                <span className="eyebrow">{plan.patientLimit ? `${plan.patientLimit} pacientes` : "Ilimitado"}</span>
                <h3>{plan.name}</h3>
                <strong>{formatMoney(plan.monthlyPriceCents)}</strong>
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button
                className={active ? "button secondary" : "button"}
                type="button"
                disabled={currentPlanIsPaid || savingAction === actionKey}
                onClick={() => void startCheckout(plan.code)}
              >
                {savingAction === actionKey ? "Abrindo..." : buttonLabel}
              </button>
            </article>
          );
        })}

        {loading ? <p className="empty-card">Carregando planos...</p> : null}
      </div>
    </section>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value / 100);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
