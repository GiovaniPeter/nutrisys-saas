import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/session";

const features = [
  {
    icon: "patient",
    title: "Prontuário e pacientes",
    text: "Prontuário completo, histórico clínico, anamnese, evolução corporal e acompanhamento em um só lugar."
  },
  {
    icon: "meal",
    title: "Planos alimentares",
    text: "Monte planos personalizados com base de alimentos, listas de substituições e objetivos nutricionais."
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
    title: "Acompanhe indicadores",
    text: "Veja agenda, portal, financeiro e evolução em um único painel."
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
  const primaryHref = user ? "/dashboard" : "/register";

  return (
    <main className="np-page">
      <header className="np-header">
        <Link href="/" className="np-logo" aria-label="NutriPlan Pro">
          <span className="np-logo-mark">
            <LeafIcon />
          </span>
          <span>
            <strong>NutriPlan Pro</strong>
            <small>Software para nutricionistas</small>
          </span>
        </Link>

        <nav className="np-nav" aria-label="Navegação principal">
          <a href="#recursos">Recursos</a>
          <a href="#planos">Planos</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="np-header-actions">
          <Link href={user ? "/dashboard" : "/login"} className="np-button np-button-ghost">
            {user ? "Dashboard" : "Entrar"}
          </Link>
          <Link href={primaryHref} className="np-button np-button-primary">
            {user ? "Abrir conta" : "Criar conta"}
          </Link>
        </div>
      </header>

      <section className="np-hero">
        <div className="np-hero-copy">
          <h1>
            Centralize atendimento, planos alimentares e <span>gestão da sua clínica.</span>
          </h1>
          <p>
            NutriPlan Pro é a plataforma completa para nutricionistas e clínicas:
            prontuário, planos alimentares, portal do paciente, agenda,
            financeiro e indicadores em um só lugar.
          </p>
          <div className="np-hero-actions">
            <Link href={primaryHref} className="np-button np-button-primary np-button-large">
              Começar trial
              <span aria-hidden="true">→</span>
            </Link>
            <a href="#recursos" className="np-button np-button-ghost np-button-large">
              Ver recursos
            </a>
          </div>

          <div className="np-stat-row">
            <MiniStat icon="leaf" title="1000+" text="alimentos na base inicial" />
            <MiniStat icon="calendar" title="7 dias" text="de trial" />
            <MiniStat icon="users" title="Multi-" text="clínica" />
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
              <div className="np-step-icon">
                <LineIcon name={step.icon} />
              </div>
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
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link href={`/register?plan=${plan.code}`} className={plan.highlighted ? "np-button np-button-primary" : "np-button np-button-ghost"}>
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
              </div>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="np-final-cta">
        <Image src="/nutritionist-laptop.png" alt="Nutricionista usando notebook" width={640} height={380} />
        <div>
          <h2>Seu próximo passo é validar o uso real</h2>
          <p>
            Experimente o NutriPlan Pro por 7 dias e veja como ele pode levar
            mais organização, tempo e resultados para sua clínica.
          </p>
        </div>
        <div className="np-final-action">
          <Link href={primaryHref} className="np-button np-button-light np-button-large">
            Criar conta agora
            <span aria-hidden="true">→</span>
          </Link>
          <small>7 dias de trial grátis</small>
        </div>
      </section>

      <footer className="np-footer">
        <div className="np-footer-brand">
          <Link href="/" className="np-logo" aria-label="NutriPlan Pro">
            <span className="np-logo-mark">
              <LeafIcon />
            </span>
            <span>
              <strong>NutriPlan Pro</strong>
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

function ProductMockup() {
  return (
    <div className="np-product-showcase" aria-label="Mockup do painel NutriPlan Pro">
      <div className="np-laptop">
        <div className="np-laptop-screen">
          <div className="np-app-top">
            <span className="np-app-brand">
              <LeafIcon />
              NutriPlan Pro
            </span>
            <span />
            <span />
            <span />
          </div>

          <div className="np-app-body">
            <aside className="np-app-sidebar">
              {["Resumo", "Agenda", "Pacientes", "Planos alimentares", "Financeiro", "Indicadores", "Portal"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </aside>

            <div className="np-dashboard">
              <h3>Resumo</h3>
              <div className="np-dashboard-cards">
                <Metric title="Agenda hoje" value="8" action="Ver agenda" />
                <Metric title="Pacientes ativos" value="128" action="Ver pacientes" />
                <Metric title="Faturamento (mês)" value="R$ 18.450" action="Ver financeiro" />
                <Metric title="Planos ativos" value="96" action="Ver planos" />
              </div>
              <div className="np-dashboard-grid">
                <div className="np-chart-card">
                  <strong>Consultas da semana</strong>
                  <div className="np-bars">
                    {[34, 58, 76, 96, 70, 82, 52].map((height, index) => (
                      <span key={index} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
                <div className="np-chart-card">
                  <strong>Distribuição de planos</strong>
                  <div className="np-donut" />
                  <small>Em andamento · Manutenção · Finalizados</small>
                </div>
                <div className="np-chart-card np-wide">
                  <strong>Evolução de pacientes</strong>
                  <div className="np-line-chart" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="np-laptop-base" />
      </div>

      <div className="np-phone">
        <div className="np-phone-notch" />
        <div className="np-phone-screen">
          <span>Olá, Ana!</span>
          <strong>Seu resumo de hoje</strong>
          <Metric title="Próxima consulta" value="10:30" action="Mariana Silva" compact />
          <Metric title="Pacientes ativos" value="128" action="96 planos ativos" compact />
          <Metric title="Peso médio dos pacientes" value="-2,4 kg" action="Último mês" compact />
          <div className="np-mobile-line" />
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value, action, compact }: { title: string; value: string; action: string; compact?: boolean }) {
  return (
    <article className={compact ? "np-metric np-metric-compact" : "np-metric"}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{action}</small>
    </article>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="np-footer-column">
      <h3>{title}</h3>
      {links.map((link) => (
        <a href="#" key={link}>{link}</a>
      ))}
    </div>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21V9" />
      <path d="M12 9C8.5 3.8 4.4 3.8 3 4.4c-.4 4.2 1.2 7.2 5.1 8.8 1.7.7 3 .2 3.9-1.2Z" />
      <path d="M12 9c3.5-5.2 7.6-5.2 9-4.6.4 4.2-1.2 7.2-5.1 8.8-1.7.7-3 .2-3.9-1.2Z" />
    </svg>
  );
}

function LineIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    leaf: (
      <>
        <path d="M12 21V10" />
        <path d="M12 10C8 5 5 4 3 5c0 4 2 7 6 8" />
        <path d="M12 10c4-5 7-6 9-5 0 4-2 7-6 8" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 3v4M17 3v4M4 9h16" />
        <rect x="4" y="5" width="16" height="16" rx="3" />
        <path d="m8 14 2 2 5-5" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c.7-3 2.7-5 6-5s5.3 2 6 5" />
        <path d="M16 11a3 3 0 1 0-1-5.8" />
        <path d="M18 20c-.3-1.7-1.1-3-2.3-3.9" />
      </>
    ),
    patient: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <circle cx="12" cy="9" r="2.5" />
        <path d="M8 17c.6-2 2-3 4-3s3.4 1 4 3" />
      </>
    ),
    meal: (
      <>
        <path d="M5 11h14a7 7 0 0 1-14 0Z" />
        <path d="M7 11c0-3 2-5 5-5s5 2 5 5" />
        <path d="M9 6V3M12 6V3M15 6V3" />
      </>
    ),
    growth: (
      <>
        <path d="M4 20V10M10 20V6M16 20V13M22 20V4" />
        <path d="M3 20h20" />
      </>
    ),
    clinic: (
      <>
        <path d="M4 21V8l8-5 8 5v13" />
        <path d="M9 21v-7h6v7M9 10h6M12 7v6M6 21h12" />
      </>
    ),
    addPatient: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c.7-3 2.7-5 6-5" />
        <path d="M17 10v8M13 14h8" />
      </>
    ),
    clipboard: (
      <>
        <path d="M9 4h6l1 3H8l1-3Z" />
        <rect x="5" y="6" width="14" height="15" rx="2" />
        <path d="M9 12h6M9 16h4" />
      </>
    ),
    dashboard: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M8 15v-3M12 15V9M16 15v-5M7 19h10" />
      </>
    )
  };

  return (
    <svg className="np-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
