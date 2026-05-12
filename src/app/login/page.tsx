import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="shell">
      <div className="panel" style={{ maxWidth: 620, margin: "48px auto" }}>
        <h1 style={{ marginTop: 0 }}>Login via API</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          Entre na nova base SaaS usando a autenticação segura com cookie
          HTTP-only. A interface clínica completa será migrada em seguida.
        </p>
        <LoginForm />
        <p style={{ color: "var(--muted)", marginTop: 18 }}>
          Ainda não tem conta? <Link href="/register">Criar trial</Link>
        </p>
      </div>
    </main>
  );
}
