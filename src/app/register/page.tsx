import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="shell">
      <div className="panel" style={{ maxWidth: 680, margin: "48px auto" }}>
        <h1 style={{ marginTop: 0 }}>Cadastro via API</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          Esta rota cria a organização, usuário owner, trial de 7 dias e sessão
          segura. Depois conectamos a landing antiga a este mesmo fluxo.
        </p>
        <RegisterForm />
        <p style={{ color: "var(--muted)", marginTop: 18 }}>
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
