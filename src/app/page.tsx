import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { PLANS } from "@/lib/plans";

const modules = [
  {
    title: "Prontuário e pacientes",
    text: "Histórico clínico, evolução corporal, anamnese, metas e consentimento LGPD em um fluxo único."
  },
  {
    title: "Planos alimentares",
    text: "Monte cardápios, recordatórios 24h, listas de compras e materiais educativos conectados à base de alimentos."
  },
  {
    title: "Agenda e relacionamento",
    text: "Consultas, lembretes, portal do paciente, chat, WhatsApp e diário alimentar para manter o acompanhamento vivo."
  },
  {
    title: "Gestão da clínica",
    text: "Equipe, assinatura, financeiro, relatórios, KPIs e auditoria para acompanhar operação e crescimento."
  }
];

const workflow = [
  "Crie sua clínica e convide a equipe",
  "Cadastre pacientes com dados isolados por organização",
  "Monte planos, recordatórios e metas com base nutricional",
  "Acompanhe agenda, portal, financeiro e indicadores"
];

const faqs = [
  {
    question: "Dá para começar grátis?",
    answer: "Sim. O fluxo atual permite criar conta e validar o trial antes de ativar cobrança real."
  },
  {
    question: "Funciona com Mercado Pago?",
    answer: "A estrutura de planos e assinatura já está pronta para receber Checkout Pro e webhooks."
  },
  {
    question: "Os dados ficam separados por clínica?",
    answer: "Sim. Pacientes, agenda, planos e registros usam isolamento por organização."
  }
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <header className="landing-topbar">
          <Link href="/" className="brand landing-brand" aria-label="NutriPlan Pro">
            <span className="brand-mark">N</span>
            <span>NutriPlan Pro</span>
          </Link>

          <nav className="landing-nav" aria-label="Navegação comercial">
            <a href="#recursos">Recursos</a>
            <a href="#planos">Planos</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="landing-actions">
            {user ? (
              <Link href="/dashboard" className="button">
                Abrir dashboard
              </Link>
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
          </div>
        </header>

        <div className="landing-hero-copy">
          <span className="landing-kicker">Software para nutricionistas</span>
          <h1>NutriPlan Pro</h1>
          <p>
            Gestão clínica, planos alimentares, portal do paciente, agenda,
            financeiro e indicadores em uma plataforma SaaS para consultórios e
            clínicas de nutrição.
          </p>
          <div className="actions">
            <Link href={user ? "/dashboard" : "/register"} className="button">
              {user ? "Continuar no sistema" : "Começar trial"}
            </Link>
            <a href="#recursos" className="button secondary">
              Ver recursos
            </a>
          </div>
        </div>
      </section>

      <section className="landing-proof" aria-label="Resumo do NutriPlan Pro">
        <div className="landing-proof-item">
          <strong>1000+</strong>
          <span>alimentos na base inicial</span>
        </div>
        <div className="landing-proof-item">
          <strong>7 dias</strong>
          <span>de trial para validar o fluxo</span>
        </div>
        <div className="landing-proof-item">
          <strong>Multi-clínica</strong>
          <span>dados separados por organização</span>
        </div>
      </section>

      <section className="landing-section" id="recursos">
        <div className="landing-section-heading">
          <span className="landing-kicker">Operação completa</span>
          <h2>Do primeiro cadastro ao acompanhamento contínuo.</h2>
          <p>
            O NutriPlan Pro reúne a rotina clínica e administrativa para reduzir
            retrabalho e deixar cada atendimento mais organizado.
          </p>
        </div>

        <div className="landing-module-grid">
          {modules.map((module) => (
            <article className="landing-card" key={module.title}>
              <h3>{module.title}</h3>
              <p>{module.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-band">
        <div className="landing-section-heading">
          <span className="landing-kicker">Fluxo de trabalho</span>
          <h2>Pronto para vender, atender e acompanhar.</h2>
        </div>

        <div className="landing-steps">
          {workflow.map((item, index) => (
            <article className="landing-step" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section" id="planos">
        <div className="landing-section-heading">
          <span className="landing-kicker">Planos</span>
          <h2>Comece simples e evolua conforme a clínica cresce.</h2>
          <p>
            Os planos já estão modelados no sistema para integração com Mercado
            Pago Checkout Pro.
          </p>
        </div>

        <div className="landing-plan-grid">
          {PLANS.map((plan) => (
            <article className="landing-plan" key={plan.code}>
              <span>{plan.patientLimit ? `${plan.patientLimit} pacientes` : "Pacientes ilimitados"}</span>
              <h3>{plan.name}</h3>
              <strong>{formatMoney(plan.monthlyPriceCents)}</strong>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link href={`/register?plan=${plan.code}`} className="button">
                Iniciar trial
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-band" id="faq">
        <div className="landing-section-heading">
          <span className="landing-kicker">FAQ</span>
          <h2>Perguntas rápidas antes de colocar em produção.</h2>
        </div>

        <div className="landing-faq-grid">
          {faqs.map((item) => (
            <article className="landing-card" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-cta">
        <div>
          <span className="landing-kicker">Publicação ativa</span>
          <h2>Seu próximo passo é validar o uso real.</h2>
          <p>
            Cadastre uma conta, crie pacientes de teste e percorra agenda,
            alimentos, recordatório e plano alimentar antes de conectar a
            cobrança final.
          </p>
        </div>
        <Link href={user ? "/dashboard" : "/register"} className="button">
          {user ? "Abrir dashboard" : "Criar conta agora"}
        </Link>
      </section>
    </main>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value / 100);
}
