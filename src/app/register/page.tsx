import Link from "next/link";
import type { Metadata } from "next";
import { AnalyticsEvent } from "@/components/analytics/analytics-event";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { RegisterForm } from "@/components/auth/register-form";
import { RegisterProfessionalForm } from "@/components/auth/register-professional-form";

export const metadata: Metadata = {
  title: "Criar conta grátis no ClinOS",
  description: "Crie sua conta profissional e teste o ClinOS por 7 dias, sem cartão de crédito.",
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
    title: "Nutricionista",
    text: "Crie o trial da clínica, gerencie pacientes, equipe, planos, agenda e indicadores.",
    href: "/register?perfil=nutricionista"
  },
  {
    key: "profissional",
    title: "Outras Especialidades",
    text: "Clínica para médicos, psicólogos, fisioterapeutas, dentistas e demais especialidades.",
    href: "/register?perfil=profissional"
  },
  {
    key: "secretaria",
    title: "Secretária",
    text: "Acesso operacional para recepção (exclusivo para contas no Plano Clínica), liberado pelo responsável.",
    href: "/register?perfil=secretaria"
  },
  {
    key: "paciente",
    title: "Paciente",
    text: "Portal para acompanhar planos, metas, mensagens, exames e orientações da clínica.",
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
          <Link href="/" className="auth-back">← Voltar para a landing</Link>
          <span className="eyebrow auth-copy-eyebrow">Comece sem compromisso</span>
          <h1>Comece seu teste no ClinOS</h1>
          <p>
            Crie seu espaço profissional em poucos passos. São 7 dias grátis,
            sem cartão de crédito.
          </p>

          <div className="login-role-grid auth-role-options" aria-label="Tipos de cadastro">
            <span className="auth-role-label">Outro tipo de acesso</span>
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
              <h2>Cadastro do nutricionista</h2>
              <p>
                Esta conta será a responsável pela clínica e poderá cadastrar
                secretárias, pacientes e outros profissionais depois.
              </p>
              <RegisterForm initialPlanCode={initialPlanCode} />
            </>
          ) : selectedProfile === "profissional" ? (
            <>
              <span className="eyebrow">7 dias grátis · sem cartão</span>
              <h2>Cadastro para outras especialidades</h2>
              <p>
                Crie a clínica escolhendo sua especialidade. O sistema será adaptado
                para sua área de atuação, sem funcionalidades exclusivas de nutrição.
              </p>
              <RegisterProfessionalForm initialPlanCode={initialPlanCode} />
            </>
          ) : selectedProfile === "secretaria" ? (
            <>
              <span className="eyebrow">Acesso da equipe</span>
              <h2>Cadastro da secretária</h2>
              <p>
                O acesso de secretária precisa ser criado pelo responsável da
                clínica em Usuários. Assim as permissões ficam vinculadas à
                clínica correta.
              </p>
              <div className="form">
                <Link href="/login?perfil=secretaria" className="button">
                  Entrar como secretária
                </Link>
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow">Portal do paciente</span>
              <h2>Acesso do paciente</h2>
              <p>
                Pacientes entram pelo portal usando e-mail ou telefone e o
                código de acesso enviado pela clínica. Se ainda não recebeu o
                código, solicite ao seu profissional de saúde.
              </p>
              <div className="form">
                <Link href="/login?perfil=paciente" className="button">
                  Entrar no portal do paciente
                </Link>
                <Link href="/register?perfil=nutricionista" className="button secondary">
                  Sou profissional de saúde
                </Link>
              </div>
            </>
          )}

          <p className="auth-footer-note">
            Já tem conta? <Link href={`/login?perfil=${selectedProfile}`}>Entrar</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function normalizeProfile(profile?: string) {
  if (profile === "paciente" || profile === "secretaria" || profile === "nutricionista" || profile === "profissional") {
    return profile;
  }

  return "nutricionista";
}

function normalizeSource(source?: string) {
  if (!source) return "direct";
  return source.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48) || "direct";
}
