import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

type RegisterPageProps = {
  searchParams?: {
    plan?: string;
  };
};

const allowedPlans = new Set(["essential", "professional", "clinic"]);

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const initialPlanCode = searchParams?.plan && allowedPlans.has(searchParams.plan) ? searchParams.plan : "professional";

  return (
    <main className="shell">
      <div className="panel" style={{ maxWidth: 680, margin: "48px auto" }}>
        <h1 style={{ marginTop: 0 }}>Criar conta no NutriPlan Pro</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          Comece seu trial com uma conta segura para sua clínica, equipe e
          pacientes.
        </p>
        <RegisterForm initialPlanCode={initialPlanCode} />
        <p style={{ color: "var(--muted)", marginTop: 18 }}>
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
