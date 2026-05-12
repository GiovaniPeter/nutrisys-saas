import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">N</span>
          <span>NutriSys SaaS</span>
        </Link>
        <nav className="actions">
          {user ? (
            <>
              <Link href="/dashboard" className="button">
                Abrir dashboard
              </Link>
              <Link href="/patients" className="button">
                Abrir pacientes
              </Link>
              <Link href="/appointments" className="button secondary">
                Abrir agenda
              </Link>
              <Link href="/meal-plans" className="button secondary">
                Abrir planos
              </Link>
              <Link href="/foods" className="button secondary">
                Abrir alimentos
              </Link>
              <Link href="/body-records" className="button secondary">
                Abrir evolucao
              </Link>
              <Link href="/anamneses" className="button secondary">
                Abrir anamnese
              </Link>
              <Link href="/api/auth/me" className="button secondary">
                Sessão ativa: {user.name}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="button secondary">
                Entrar
              </Link>
              <Link href="/register" className="button">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <div>
          <h1>Base SaaS pronta para migrar o NutriSys com segurança.</h1>
          <p>
            Esta é a nova trilha do produto: autenticação real, PostgreSQL,
            multi-clínica, assinatura, auditoria e APIs para os módulos que
            hoje vivem no protótipo em localStorage.
          </p>
          <div className="actions">
            <Link href="/api/billing/plans" className="button">
              Ver planos via API
            </Link>
            <Link href="/api/auth/me" className="button secondary">
              Testar sessão
            </Link>
            {user ? (
              <Link href="/patients" className="button secondary">
                Cadastrar paciente
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="panel">
          <h2>Primeira fundação</h2>
          <ul className="checklist">
            <li>
              <span className="check">✓</span>
              <span>Organizações, usuários, papéis e assinatura por tenant.</span>
            </li>
            <li>
              <span className="check">✓</span>
              <span>Senha com hash forte e cookie HTTP-only assinado.</span>
            </li>
            <li>
              <span className="check">✓</span>
              <span>Pacientes e consultas já isolados por clínica.</span>
            </li>
            <li>
              <span className="check">✓</span>
              <span>Auditoria preparada para ações clínicas sensíveis.</span>
            </li>
          </ul>
        </aside>
      </section>

      <section className="grid">
        <div className="metric">
          <strong>Multi-tenant</strong>
          <span>Cada clínica com dados isolados por `organizationId`.</span>
        </div>
        <div className="metric">
          <strong>LGPD-ready</strong>
          <span>Consentimento e logs entram no desenho desde o começo.</span>
        </div>
        <div className="metric">
          <strong>Assinatura</strong>
          <span>Planos e trial modelados para integrar Stripe/Mercado Pago.</span>
        </div>
      </section>
    </main>
  );
}
