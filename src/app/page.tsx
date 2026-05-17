import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/session";

const features = [
  {
    icon: "patient",
    title: "Prontuário e pacientes",
    text: "Prontuário completo, histórico clínico, anamnese, evolução e acompanhamento em um só lugar."
  },
  {
    icon: "meal",
    title: "Planos alimentares",
    text: "Monte planos personalizados com mais de 1000 alimentos, listas de substituições e objetivos."
  },
  {
    icon: "calendar",
    title: "Agenda e relacionamento",
    text: "Agenda online, lembretes automáticos, chat e portal do paciente para mais adesão."
  },
  {
    icon: "growth",
    title: "Gestão da clínica",
    text: "Financeiro, indicadores, KPIs e relatórios para decisões mais estratégicas e lucrativas."
  }
];

const steps = [
  {
    icon: "clinic",
    title: "Crie sua clínica",
    text: "Cadastre sua clínica ou consultório e personalize suas preferências."
  },
  {
    icon: "addPatient",
    title: "Cadastre pacientes",
    text: "Adicione pacientes, registre dados clínicos e acompanhe toda a jornada."
  },
  {
    icon: "clipboard",
    title: "Monte planos e metas",
    text: "Crie planos alimentares personalizados e defina metas realistas."
  },
  {
    icon: "dashboard",
    title: "Acompanhe agenda, portal, financeiro e indicadores",
    text: "Tenha controle total da sua clínica em um único painel."
  }
];

const plans = [
  {
    code: "essential",
    name: "Essencial",
    price: "R$ 79,00",
    features: ["Pacientes", "Agenda", "Planos alimentares", "PDFs"]
  },
  {
    code: "professional",
    name: "Profissional",
    price: "R$ 149,00",
    highlighted: true,
    features: ["Pacientes ilimitados", "Portal do paciente", "Chat", "Financeiro", "KPIs"]
  },
  {
    code: "clinic",
    name: "Clínica",
    price: "R$ 249,00",
    features: ["Multi-profissional", "Secretária", "Permissões", "Relatórios avançados"]
  }
];

const faqs = [
  {
    question: "Dá para começar grátis?",
    answer: "Sim! Todos os planos oferecem 7 dias de trial grátis, sem cartão de crédito."
  },
  {
    question: "Funciona com Mercado Pago?",
    answer: "Sim, integramos com o Mercado Pago para facilitar cobranças e conciliação financeira."
  },
  {
    question: "Os dados ficam separados por clínica?",
    answer: "Sim. Cada clínica tem seus dados 100% separados e seguros."
  }
];

export default async function Home() {
  const user = await getCurrentUser();
  const trialHref = "/register";

  return (
    <main className="np-page">
      <header className="np-header">
        <Link href="/" className="np-logo" aria-label="NutriPlan Pro">
          <span className="np-logo-mark"><LeafIcon /></span>
          <span>
            <strong>NutriPlan <em>Pro</em></strong>
            <small>Software para nutricionistas</small>
          </span>
        </Link>

        <nav className="np-nav" aria-label="Navegação principal">
          <a href="#recursos">Recursos</a>
          <a href="#planos">Planos</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="np-header-actions">
          {user ? (
            <Link href="/dashboard" className="np-button np-button-ghost">
              Dashboard
            </Link>
          ) : null}
          <Link href="/login" className="np-button np-button-outline">
            Login
          </Link>
          <Link href="/register" className="np-button np-button-primary">
            Criar conta
          </Link>
        </div>
      </header>

      <section className="np-hero">
        <div className="np-hero-copy">
          <h1>
            Centralize atendimento, planos alimentares e <span>gestão da sua clínica.</span>
          </h1>
          <p>
            NutriPlan Pro é a plataforma completa para nutricionistas e clínicas: prontuário,
            planos alimentares, portal do paciente, agenda, financeiro e indicadores em um só lugar.
          </p>

          <div className="np-hero-actions">
            <Link href={trialHref} className="np-button np-button-primary np-button-large">
              Começar trial <span aria-hidden="true">→</span>
            </Link>
            <a href="#recursos" className="np-button np-button-outline np-button-large">
              Ver recursos <span aria-hidden="true">▣</span>
            </a>
          </div>

          <div className="np-stat-row">
            <MiniStat icon="leaf" title="1000+" text="alimentos na base inicial" />
            <MiniStat icon="calendar" title="7 dias" text="de trial" />
            <MiniStat icon="users" title="Multi-" text="clínica" />
            <MiniStat icon="assistant" title="Acesso secretária" text="modo limitado" />
          </div>
        </div>

        <ProductMockup />
      </section>

      <section className="np-section" id="recursos">
        <div className="np-section-heading np-center">
          <span>Recursos que simplificam sua rotina</span>
          <h2>Tudo que você precisa em uma plataforma completa</h2>
        </div>

        <div className="np-feature-grid">
          {features.map((feature) => (
            <article className="np-feature-card" key={feature.title}>
              <LineIcon name={feature.icon} />
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="np-section np-how">
        <div className="np-section-heading np-center">
          <span>Como funciona</span>
          <h2>Comece em minutos e transforme sua rotina</h2>
        </div>

        <div className="np-step-row">
          {steps.map((step, index) => (
            <article className="np-step" key={step.title}>
              <strong>{index + 1}</strong>
              <div className="np-step-icon"><LineIcon name={step.icon} /></div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="np-section" id="planos">
        <div className="np-section-heading np-center">
          <span>Planos simples e justos</span>
          <h2>Escolha o plano ideal para sua fase</h2>
        </div>

        <div className="np-pricing-grid">
          {plans.map((plan) => (
            <article className={plan.highlighted ? "np-price-card np-price-featured" : "np-price-card"} key={plan.code}>
              {plan.highlighted ? <span className="np-popular">Mais escolhido</span> : null}
              <h3>{plan.name}</h3>
              <div className="np-price">
                <strong>{plan.price}</strong>
                <span>/mês</span>
              </div>
              <ul>
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <Link href={`/register?plan=${plan.code}`} className={plan.highlighted ? "np-button np-button-primary" : "np-button np-button-outline"}>
                Começar trial
              </Link>
            </article>
          ))}
        </div>

        <p className="np-pricing-note">7 dias de trial grátis em todos os planos. Cancele quando quiser.</p>
      </section>

      <section className="np-section" id="faq">
        <div className="np-section-heading np-center">
          <span>Dúvidas frequentes</span>
          <h2>Perguntas rápidas</h2>
        </div>

        <div className="np-faq-grid">
          {faqs.map((faq) => (
            <article className="np-faq-card" key={faq.question}>
              <div>
                <span>?</span>
                <h3>{faq.question}</h3>
                <small>⌃</small>
              </div>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="np-final-cta">
        <div className="np-final-photo">
          <Image src="/nutritionist-laptop.png" alt="Nutricionista usando notebook" width={640} height={380} />
        </div>
        <div className="np-final-copy">
          <h2>Seu próximo passo é validar o uso real</h2>
          <p>
            Experimente o NutriPlan Pro por 7 dias e veja como ele pode levar mais organização,
            tempo e resultados para sua clínica.
          </p>
        </div>
        <div className="np-final-action">
          <Link href={trialHref} className="np-button np-button-light np-button-large">
            Criar conta agora <span aria-hidden="true">→</span>
          </Link>
          <small>7 dias de trial grátis</small>
        </div>
      </section>

      <footer className="np-footer">
        <div className="np-footer-brand">
          <Link href="/" className="np-logo" aria-label="NutriPlan Pro">
            <span className="np-logo-mark"><LeafIcon /></span>
            <span>
              <strong>NutriPlan <em>Pro</em></strong>
              <small>Software para nutricionistas</small>
            </span>
          </Link>
          <p>Plataforma completa para nutricionistas e clínicas de nutrição.</p>
          <div className="np-socials" aria-label="Redes sociais">
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="YouTube">▶</a>
          </div>
        </div>

        <FooterColumn title="Produto" links={["Recursos", "Planos", "Integrações"]} />
        <FooterColumn title="Empresa" links={["Sobre nós", "Blog", "Contato"]} />
        <FooterColumn title="Suporte" links={["Central de ajuda", "Termos de uso", "Política de privacidade"]} />
        <div className="np-footer-column">
          <h3>Fale conosco</h3>
          <a href="mailto:contato@nutriplanpro.com.br">contato@nutriplanpro.com.br</a>
          <a href="tel:+5511987654321">(11) 98765-4321</a>
        </div>

        <p className="np-copyright">© 2026 NutriPlan Pro. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}

function ProductMockup() {
  return (
    <div className="np-product-wrap" aria-label="Prévia do sistema NutriPlan Pro">
      <div className="np-leaf-bg" aria-hidden="true" />
      <div className="np-laptop">
        <div className="np-laptop-top">
          <span>NutriPlan Pro</span>
          <div><i /> <i /> <i /></div>
        </div>
        <div className="np-dashboard-preview">
          <aside>
            <b>Resumo</b>
            <span>Agenda</span>
            <span>Pacientes</span>
            <span>Planos alimentares</span>
            <span>Financeiro</span>
            <span>Indicadores</span>
          </aside>
          <section>
            <h3>Resumo</h3>
            <div className="np-metrics-preview">
              <MetricPreview label="Agenda hoje" value="8" />
              <MetricPreview label="Pacientes ativos" value="128" />
              <MetricPreview label="Faturamento" value="R$ 18.450" />
              <MetricPreview label="Planos ativos" value="96" />
            </div>
            <div className="np-charts-grid">
              <div className="np-chart-card">
                <span>Consultas da semana</span>
                <div className="np-bars"><i /><i /><i /><i /><i /><i /></div>
              </div>
              <div className="np-chart-card">
                <span>Distribuição de planos</span>
                <div className="np-donut" />
              </div>
              <div className="np-chart-card"><span>Evolução de pacientes</span><div className="np-line-chart" /></div>
              <div className="np-chart-card"><span>Faturamento últimos 6 meses</span><div className="np-line-chart np-line-chart-alt" /></div>
            </div>
          </section>
        </div>
        <div className="np-laptop-base" />
      </div>

      <div className="np-phone">
        <div className="np-phone-notch" />
        <div className="np-phone-screen">
          <small>Olá, Ana!</small>
          <h4>Seu resumo de hoje</h4>
          <div className="np-phone-card"><span>Próxima consulta</span><b>10:30</b><em>Mariana Silva</em></div>
          <div className="np-phone-card"><span>Pacientes ativos</span><b>128</b></div>
          <div className="np-phone-card"><span>Peso médio dos pacientes</span><b>-2,4 kg</b></div>
          <div className="np-phone-chart" />
          <nav><span /> <span /> <span /> <span /></nav>
        </div>
      </div>
    </div>
  );
}

function MetricPreview({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniStat({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <article className="np-mini-stat">
      <LineIcon name={icon} />
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </article>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="np-footer-column">
      <h3>{title}</h3>
      {links.map((link) => <a href="#" key={link}>{link}</a>)}
    </div>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 42V27" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M23.8 27.5C15 28 8 22.9 8 15.8 8 8.9 15.2 5.1 30.8 5.3c.4 14.1-5.2 21.7-15.2 21.7-2.4 0-4.5-.5-6.2-1.6Z" fill="rgba(22, 132, 50, 0.12)" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 25.5C18.8 17.8 24.4 13 31 10.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M25 35.5c7.9.4 13.5-4.1 14.6-12.9-7.9.2-13.2 4.4-14.6 12.9Z" fill="rgba(22, 132, 50, 0.12)" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LineIcon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.1, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  const icons: Record<string, ReactNode> = {
    patient: <><rect x="5" y="4" width="14" height="16" rx="2" {...common} /><path d="M9 20v4h12V8h-2M9 10h6M9 14h4M27 20c0-3-2.3-5-5-5s-5 2-5 5M22 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6" {...common} /></>,
    meal: <><path d="M7 8v8M11 8v8M9 8v16M20 8c4 3 4 9 0 12v4" {...common} /><path d="M23 8v16M5 24h22" {...common} /></>,
    calendar: <><rect x="5" y="7" width="22" height="20" rx="3" {...common} /><path d="M10 4v6M22 4v6M5 13h22M11 18h2M16 18h2M21 18h2M11 23h2M16 23h2" {...common} /></>,
    growth: <><path d="M5 27h22M8 23v-7M15 23V10M22 23V6" {...common} /><path d="M7 11l5-5 5 4 8-7" {...common} /></>,
    clinic: <><path d="M6 27V10l10-5 10 5v17" {...common} /><path d="M11 27v-8h10v8M16 9v6M13 12h6" {...common} /></>,
    addPatient: <><path d="M14 17c-4 0-7 2.6-7 6v1h10" {...common} /><circle cx="14" cy="10" r="4" {...common} /><path d="M22 17v10M17 22h10" {...common} /></>,
    clipboard: <><rect x="7" y="6" width="18" height="22" rx="3" {...common} /><path d="M12 6c0-2 1.4-3 4-3s4 1 4 3M12 13h8M12 18h8M12 23h5" {...common} /></>,
    dashboard: <><rect x="5" y="7" width="22" height="18" rx="3" {...common} /><path d="M9 21l4-5 4 3 5-7M10 28h12" {...common} /></>,
    leaf: <><path d="M7 17C7 9 13 5 25 4c0 12-5 18-13 18-2 0-3.6-.5-5-1.5Z" {...common} /><path d="M10 21c4-7 8-11 14-14" {...common} /></>,
    users: <><circle cx="12" cy="11" r="4" {...common} /><path d="M5 24c0-4 3-7 7-7s7 3 7 7" {...common} /><path d="M22 14a3 3 0 1 0 0-6M21 19c3 .2 5 2.4 5 5" {...common} /></>,
    assistant: <><path d="M8 25v-7a8 8 0 0 1 16 0v7" {...common} /><path d="M8 20H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2M24 20h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" {...common} /><path d="M12 18h8M12 23h5M19 27c0 2-1.5 3-4 3h-2" {...common} /></>
  };

  return <svg className="np-line-icon" viewBox="0 0 32 32" aria-hidden="true">{icons[name] ?? icons.leaf}</svg>;
}
