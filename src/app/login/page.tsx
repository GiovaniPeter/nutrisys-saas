import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { PortalLoginForm } from "@/components/portal/portal-login-form";

export const metadata: Metadata = {
  title: "Entrar no NutriPlan | Software para Nutricionistas",
  description: "Faça login na plataforma NutriPlan para nutricionistas, secretárias de consultório e portal do paciente.",
  robots: { index: false, follow: false }
};

type LoginPageProps = {
  searchParams?: {
    perfil?: string;
  };
};

const accessOptions = [
  {
    key: "nutricionista",
    title: "Nutricionista (CRN)",
    text: "Acesso completo à prescrição dietética, Tabela TACO (+1.000 itens), anamneses nutricionais, antropometria, agenda e financeiro.",
    href: "/login?perfil=nutricionista"
  },
  {
    key: "secretaria",
    title: "Secretária / Recepção",
    text: "Modo operacional para recepção do consultório: agenda de retornos, cadastro básico de pacientes e confirmações.",
    href: "/login?perfil=secretaria"
  },
  {
    key: "paciente",
    title: "Paciente (Portal)",
    text: "Portal exclusivo com plano alimentar publicado, trocas equivalentes, metas de hidratação, diário alimentar e evolução.",
    href: "/login?perfil=paciente"
  }
] as const;

export default function LoginPage({ searchParams }: LoginPageProps) {
  const selectedProfile = normalizeProfile(searchParams?.perfil);
  const canCreateTrial = selectedProfile === "nutricionista";

  return (
    <main className="shell auth-shell">
      <section className="auth-layout">
        <div className="auth-copy">
          <Link href="/" className="auth-back">← Voltar para a página inicial</Link>
          <span className="eyebrow">Central de acesso NutriPlan</span>
          <h1>Entrar no NutriPlan</h1>
          <p>
            Escolha o seu perfil de acesso no software para nutricionistas:
            consultório nutricional, recepção ou portal do paciente.
          </p>

          <div className="login-role-grid" aria-label="Tipos de login">
            {accessOptions.map((option) => (
              <Link
                href={option.href}
                key={option.key}
                className={selectedProfile === option.key ? "login-role-card active" : "login-role-card"}
              >
                <strong>{option.title}</strong>
                <span>{option.text}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="auth-panel">
          {selectedProfile === "paciente" ? (
            <>
              <span className="eyebrow">Portal do paciente</span>
              <h2>Login do paciente</h2>
              <p>Use o e-mail ou telefone cadastrado e o código de acesso enviado pelo seu nutricionista.</p>
              <PortalLoginForm />
            </>
          ) : (
            <>
              <span className="eyebrow">{selectedProfile === "secretaria" ? "Recepção do consultório" : "Área do Nutricionista"}</span>
              <h2>{selectedProfile === "secretaria" ? "Login da secretária" : "Login do nutricionista"}</h2>
              <p>
                {selectedProfile === "secretaria"
                  ? "Este acesso é exclusivo para recepção/secretaria do consultório, sem permissão de prescrição dietética."
                  : "Acesse seu consultório digital para prescrever cardápios, consultar a base TACO e acompanhar seus pacientes."}
              </p>
              <LoginForm
                accessMode={selectedProfile === "secretaria" ? "secretary" : "nutritionist"}
                buttonLabel={selectedProfile === "secretaria" ? "Entrar como secretária" : "Entrar como nutricionista"}
              />
            </>
          )}

          <p className="auth-footer-note">
            {canCreateTrial ? (
              <>
                Ainda não tem conta? <Link href="/register?perfil=nutricionista">Testar 7 dias grátis</Link>
              </>
            ) : selectedProfile === "secretaria" ? (
              "O acesso da secretária deve ser criado pelo nutricionista titular do consultório."
            ) : (
              "O código de acesso do paciente é gerado pelo nutricionista no prontuário."
            )}
          </p>
        </div>
      </section>
    </main>
  );
}

function normalizeProfile(profile?: string) {
  if (profile === "paciente" || profile === "secretaria") {
    return profile;
  }

  return "nutricionista";
}
