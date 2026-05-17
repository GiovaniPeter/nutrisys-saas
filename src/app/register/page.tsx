import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="shell">
      <div className="panel" style={{ maxWidth: 680, margin: "48px auto" }}>
        <h1 style={{ marginTop: 0 }}>Criar conta no NutriPlan Pro</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          Comece seu trial com uma conta segura para sua clínica, equipe e
          pacientes.
        </p>
        <RegisterForm />
        <p style={{ color: "var(--muted)", marginTop: 18 }}>
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
