import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { PortalLoginForm } from "@/components/portal/portal-login-form";

type LoginPageProps = {
  searchParams?: {
    perfil?: string;
  };
};

const accessOptions = [
  {
    key: "nutricionista",
    title: "Nutricionista",
    text: "Acesso completo ao atendimento, pacientes, planos alimentares, agenda, financeiro e indicadores.",
    href: "/login?perfil=nutricionista"
  },
  {
    key: "secretaria",
    title: "Secretária",
    text: "Modo limitado para recepção: agenda, cadastro básico, lembretes e suporte operacional da clínica.",
    href: "/login?perfil=secretaria"
  },
  {
    key: "paciente",
    title: "Paciente",
    text: "Portal com planos publicados, metas, diário alimentar, hidratação, mensagens e acompanhamento.",
    href: "/login?perfil=paciente"
  }
] as const;

export default function LoginPage({ searchParams }: LoginPageProps) {
  const selectedProfile = normalizeProfile(searchParams?.perfil);

  return (
    <main className="shell auth-shell">
      <section className="auth-layout">
        <div className="auth-copy">
          <Link href="/" className="auth-back">← Voltar para a landing</Link>
          <span className="eyebrow">Central de acesso</span>
          <h1>Entrar no NutreClin</h1>
          <p>
            Escolha o tipo de login para acessar apenas o que faz sentido para sua rotina:
            clínica, recepção ou portal do paciente.
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
              <p>Use o e-mail ou telefone cadastrado e o código de acesso enviado pela clínica.</p>
              <PortalLoginForm />
            </>
          ) : (
            <>
              <span className="eyebrow">{selectedProfile === "secretaria" ? "Modo limitado" : "Área profissional"}</span>
              <h2>{selectedProfile === "secretaria" ? "Login da secretária" : "Login do nutricionista"}</h2>
              <p>
                {selectedProfile === "secretaria"
                  ? "Este acesso é exclusivo para usuários com papel de secretária, com permissões reduzidas."
                  : "Use seu acesso profissional para gerenciar a clínica, pacientes, planos e indicadores."}
              </p>
              <LoginForm
                accessMode={selectedProfile === "secretaria" ? "secretary" : "nutritionist"}
                buttonLabel={selectedProfile === "secretaria" ? "Entrar como secretária" : "Entrar como nutricionista"}
              />
            </>
          )}

          <p className="auth-footer-note">
            Ainda não tem conta? <Link href="/register">Criar trial</Link>
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
