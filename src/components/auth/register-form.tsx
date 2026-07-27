"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

type RegisterFormProps = {
  initialPlanCode?: string;
};

export function RegisterForm({ initialPlanCode = "professional" }: RegisterFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasStarted = useRef(false);
  const planName = getPlanName(initialPlanCode);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const planCode = String(form.get("planCode") || initialPlanCode);

    trackEvent("registration_submit", {
      professional_profile: "nutritionist",
      plan_code: planCode
    });

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          organizationName: form.get("organizationName"),
          planCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        trackEvent("registration_error", {
          professional_profile: "nutritionist",
          plan_code: planCode,
          http_status: response.status
        });
        setMessage(data.error || "Não foi possível criar a conta.");
        return;
      }

      trackEvent("sign_up", {
        method: "email",
        professional_profile: "nutritionist",
        plan_code: planCode
      });
      router.push("/dashboard");
      router.refresh();
    } catch {
      trackEvent("registration_error", {
        professional_profile: "nutritionist",
        plan_code: planCode,
        error_type: "network"
      });
      setMessage("Não foi possível conectar ao ClinOS. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleFormStart() {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    trackEvent("registration_start", {
      professional_profile: "nutritionist",
      plan_code: initialPlanCode
    });
  }

  return (
    <form className="form registration-form" onSubmit={handleSubmit} onFocusCapture={handleFormStart}>
      <label>
        Nome completo
        <input name="name" required minLength={3} autoComplete="name" placeholder="Dra. Maria Silva" />
      </label>
      <label>
        E-mail
        <input name="email" type="email" required autoComplete="email" placeholder="maria@clinica.com" />
      </label>
      <label>
        Senha
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
        />
      </label>
      <label>
        Consultório ou clínica
        <input
          name="organizationName"
          required
          autoComplete="organization"
          placeholder="Clínica NutriVida"
        />
      </label>
      <input name="planCode" type="hidden" value={initialPlanCode} />
      <div className="registration-plan-note">
        <span>Teste selecionado</span>
        <strong>Plano {planName} por 7 dias</strong>
        <small>Sem cartão. Você poderá comparar ou trocar o plano depois.</small>
      </div>
      {message ? <p className="form-message error">{message}</p> : null}
      <button className="button" type="submit" disabled={loading}>
        {loading ? "Criando..." : "Começar 7 dias grátis — sem cartão"}
      </button>
    </form>
  );
}

function getPlanName(planCode: string) {
  if (planCode === "essential") return "Essencial";
  if (planCode === "clinic") return "Clínica";
  return "Profissional";
}
