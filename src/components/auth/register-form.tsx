"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

type RegisterFormProps = {
  initialPlanCode?: string;
};

export function RegisterForm({ initialPlanCode = "professional" }: RegisterFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const hasStarted = useRef(false);
  const planName = getPlanName(initialPlanCode);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!acceptTerms) {
      setMessage("Você precisa ler e aceitar os Termos de Uso e a Política de Privacidade (LGPD) para criar sua conta.");
      return;
    }
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
          planCode,
          acceptTerms: true
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
      <label
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: "10px",
          fontSize: "0.84rem",
          color: "#475569",
          lineHeight: 1.5,
          cursor: "pointer"
        }}
      >
        <input
          type="checkbox"
          name="acceptTerms"
          checked={acceptTerms}
          onChange={(event) => setAcceptTerms(event.target.checked)}
          required
          style={{ width: "auto", marginTop: "3px" }}
        />
        <span>
          Li e concordo com os{" "}
          <Link href="/termos-de-uso" target="_blank" style={{ color: "#059669", textDecoration: "underline", fontWeight: 500 }}>
            Termos de Uso (incluindo DPA)
          </Link>{" "}
          e com a{" "}
          <Link href="/politica-de-privacidade" target="_blank" style={{ color: "#059669", textDecoration: "underline", fontWeight: 500 }}>
            Política de Privacidade (LGPD)
          </Link>
          .
        </span>
      </label>
      {message ? <p className="form-message error">{message}</p> : null}
      <button className="button" type="submit" disabled={loading || !acceptTerms}>
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
