import Link from "next/link";
import type { Metadata } from "next";
import { AnalyticsEvent } from "@/components/analytics/analytics-event";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Criar conta grátis de Nutricionista | NutriPlan",
  description: "Crie sua conta de nutricionista e teste o NutriPlan por 7 dias grátis, sem cartão de crédito.",
  alternates: {
    canonical: "/register"
  },
  robots: {
    index: false,
    follow: true
  }
};

type RegisterPageProps = {
  searchParams?: {
    perfil?: string;
    plan?: string;
    source?: string;
  };
};

const allowedPlans = new Set(["essential", "professional", "clinic"]);

const registerOptions = [
  {
    key: "nutricionista",
    title: "Nutricionista (CRN)",
    text: "Crie sua conta profissional, monte cardápios com base TACO, gerencie pacientes, agenda e portal do paciente.",
    href: "/register?perfil=nutricionista"
  },
  {
    key: "secretaria",
    title: "Secretária / Recepção",
    text: "Acesso operacional para agenda, confirmação de consultas e cadastro de pacientes do consultório.",
    href: "/register?perfil=secretaria"
  },
  {
    key: "paciente",
    title: "Paciente (Portal)",
    text: "Acesse seu plano alimentar, lista de substituições, diário com fotos, meta de água e chat com a Nutri.",
    href: "/register?perfil=paciente"
  }
] as const;

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const selectedProfile = normalizeProfile(searchParams?.perfil);
  const initialPlanCode = searchParams?.plan && allowedPlans.has(searchParams.plan) ? searchParams.plan : "professional";
  const acquisitionSource = normalizeSource(searchParams?.source);

  return (
    <main className="shell auth-shell">
      <AnalyticsEvent
        name="registration_view"
        params={{
          professional_profile: selectedProfile,
          plan_code: initialPlanCode,
          acquisition_source: acquisitionSource
        }}
      />
      <section className="auth-layout">
        <div className="auth-copy">
          <Link href="/" className="auth-back">
            ← Voltar para a página inicial
          </Link>
          <span className="eyebrow auth-copy-eyebrow">Exclusivo para Nutrição · 7 dias grátis</span>
          <h1>Comece seu teste grátis no NutriPlan</h1>
          <p>
            Configure seu consultório digital em menos de 1 minuto. Acesso imediato à tabela TACO com medidas caseiras,
            planos alimentares e Portal do Paciente — sem cartão de crédito.
          </p>

          <div className="login-role-grid auth-role-options" aria-label="Tipos de cadastro">
            <span className="auth-role-label">Selecione seu perfil de acesso</span>
            {registerOptions.map((option) => (
              <TrackedLink
                href={option.href}
                key={option.key}
                className={selectedProfile === option.key ? "login-role-card active" : "login-role-card"}
                eventName="registration_profile_select"
                eventParams={{ selected_profile: option.key }}
              >
                <strong>{option.title}</strong>
                <span>{option.text}</span>
              </TrackedLink>
            ))}
          </div>
        </div>

        <div className="auth-panel">
          {selectedProfile === "nutricionista" ? (
            <>
              <span className="eyebrow">7 dias grátis · sem cartão</span>
              <h2>Cadastro do(a) Nutricionista</h2>
              <p>
                Crie sua conta titular para montar cardápios, acompanhar pacientes pelo portal e gerenciar seu
                consultório ou clínica de nutrição.
              </p>
              <RegisterForm initialPlanCode={initialPlanCode} />
            </>
          ) : selectedProfile === "secretaria" ? (
            <>
              <span className="eyebrow">Acesso da recepção</span>
              <h2>Acesso da Secretária</h2>
              <p>
                O login de secretária é criado pelo(a) nutricionista titular dentro do menu <strong>Equipe</strong>. Se
                você já recebeu seu e-mail e senha, clique abaixo para entrar.
              </p>
              <div className="form">
                <Link href="/login?perfil=secretaria" className="button">
                  Entrar como secretária
                </Link>
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow">Portal do Paciente</span>
              <h2>Acesso ao Meu Plano Alimentar</h2>
              <p>
                Entre no portal com o código exclusivo enviado pelo(a) seu(sua) nutricionista para ver seu cardápio,
                registrar fotos das refeições e acompanhar sua meta de hidratação.
              </p>
              <div className="form">
                <Link href="/portal/login" className="button">
                  Entrar no Portal do Paciente
                </Link>
                <Link href="/register?perfil=nutricionista" className="button secondary">
                  Sou Nutricionista (Criar Conta)
                </Link>
              </div>
            </>
          )}

          <p className="auth-footer-note">
            Já tem conta? <Link href={`/login?perfil=${selectedProfile}`}>Fazer login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function normalizeProfile(profile?: string) {
  if (profile === "paciente" || profile === "secretaria" || profile === "nutricionista") {
    return profile;
  }

  return "nutricionista";
}

function normalizeSource(source?: string) {
  if (!source) return "direct";
  return source.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48) || "direct";
}
