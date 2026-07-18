import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { RegisterProfessionalForm } from "@/components/auth/register-professional-form";

type RegisterPageProps = {
  searchParams?: {
    perfil?: string;
    plan?: string;
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

  return (
    <main className="shell auth-shell">
      <section className="auth-layout">
        <div className="auth-copy">
          <Link href="/" className="auth-back">← Voltar para a landing</Link>
          <span className="eyebrow">Criar acesso</span>
          <h1>Criar conta no ClinOS</h1>
          <p>
            Escolha o perfil correto para iniciar o trial da clínica ou acessar
            uma conta já vinculada por um profissional.
          </p>

          <div className="login-role-grid" aria-label="Tipos de cadastro">
            {registerOptions.map((option) => (
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
          {selectedProfile === "nutricionista" ? (
            <>
              <span className="eyebrow">Trial da clínica</span>
              <h2>Cadastro do nutricionista</h2>
              <p>
                Esta conta será a responsável pela clínica e poderá cadastrar
                secretárias, pacientes e outros profissionais depois.
              </p>
              <RegisterForm initialPlanCode={initialPlanCode} />
            </>
          ) : selectedProfile === "profissional" ? (
            <>
              <span className="eyebrow">Trial da clínica</span>
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
