import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { DashboardLink } from "@/components/auth/dashboard-link";

const features = [
  {
    icon: "patient",
    title: "Prontuário e pacientes",
    text: "Prontuário completo, histórico clínico, anamnese, evolução e acompanhamento em um só lugar."
  },
  {
    icon: "meal",
    title: "Segurança de dados",
    text: "Conformidade LGPD e segurança ponta a ponta para proteger os dados da sua clínica."
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
    title: "Prescreva condutas e metas",
    text: "Crie planos de cuidado personalizados e defina metas realistas."
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
    features: ["Pacientes", "Agenda", "Prontuários e Planos", "PDFs"]
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

export default function Home() {
  const trialHref = "/register";

  return (
    <main className="np-page">
      <header className="np-header">
        <Link href="/" className="np-logo" aria-label="ClinOS">
          <span className="np-logo-mark"><ClinOSLogo /></span>
          <span>
            <strong>ClinOS</strong>
            <small>O sistema operacional da sua clínica</small>
          </span>
        </Link>

        <nav className="np-nav" aria-label="Navegação principal">
          <a href="#recursos">Recursos</a>
          <a href="#planos">Planos</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="np-header-actions">
          <DashboardLink />
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
            O sistema operacional da <span>sua clínica</span>
          </h1>
          <p>
            Agenda, prontuário, pacientes, financeiro e acompanhamento em uma única plataforma.
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
            <MiniStat icon="leaf" title="Seguro" text="Conformidade LGPD" />
            <MiniStat icon="calendar" title="Completo" text="Tudo em um só lugar" />
            <MiniStat icon="users" title="Multi-clínica" text="equipes e unidades" />
            <MiniStat icon="assistant" title="Secretária" text="acesso limitado" />
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
          <Image src="/nutritionist-laptop.png" alt="Profissional de saúde usando notebook" width={640} height={380} />
        </div>
        <div className="np-final-copy">
          <h2>Seu próximo passo é validar o uso real</h2>
          <p>
            Experimente o ClinOS por 7 dias e veja como ele pode levar mais organização,
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
          <Link href="/" className="np-logo" aria-label="ClinOS">
            <span className="np-logo-mark"><ClinOSLogo /></span>
            <span>
              <strong>ClinOS</strong>
              <small>O sistema operacional da sua clínica</small>
            </span>
          </Link>
          <p>Solução completa de gestão para consultórios e clínicas multiprofissionais.</p>
          <div className="np-socials" aria-label="Redes sociais">
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="YouTube">▶</a>
          </div>
        </div>

        <FooterColumn title="Produto" links={["Recursos", "Planos", "Integrações"]} />
        <FooterColumn title="Empresa" links={["Sobre nós", "Blog", "Contato"]} />
        <FooterColumn
          title="Suporte"
          links={[
            { label: "Central de ajuda", href: "#" },
            { label: "Termos de uso", href: "#" },
            { label: "Politica de privacidade", href: "/politica-de-privacidade" },
            { label: "Exclusao de conta", href: "/exclusao-de-conta" },
            { label: "Recuperar senha", href: "/recuperar-senha" }
          ]}
        />
        <div className="np-footer-column">
          <h3>Fale conosco</h3>
          <a href="mailto:contato@clinos.com.br">contato@clinos.com.br</a>
          <a href="tel:+5511987654321">(11) 98765-4321</a>
        </div>

        <p className="np-copyright">© 2026 ClinOS. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}

function ProductMockup() {
  return (
    <div className="np-product-wrap" aria-label="Prévia do sistema ClinOS">
      <div className="np-leaf-bg" aria-hidden="true" />
      <div className="np-laptop">
        <div className="np-laptop-top">
          <span>ClinOS</span>
          <div><i /> <i /> <i /></div>
        </div>
        <div className="np-dashboard-preview">
          <aside>
            <div className="np-mock-logo">
              <ClinOSLogo />
              <span>ClinOS</span>
            </div>
            <b><LineIcon name="dashboard" /> Resumo</b>
            <span><LineIcon name="calendar" /> Agenda</span>
            <span><LineIcon name="users" /> Pacientes</span>
            <span><LineIcon name="clipboard" /> Prontuário</span>
            <span><LineIcon name="growth" /> Financeiro</span>
            <span><LineIcon name="growth" /> Relatórios</span>
            <span><LineIcon name="assistant" /> Mensagens</span>
            <span><LineIcon name="settings" /> Configurações</span>
          </aside>
          <section>
            <h3>Resumo da clínica</h3>
            <div className="np-metrics-preview">
              <div className="np-mock-card">
                <span><LineIcon name="calendar" /> Hoje</span>
                <strong>12</strong>
                <small>agendamentos</small>
              </div>
              <div className="np-mock-card">
                <span><LineIcon name="users" /> Pacientes ativos</span>
                <strong>842</strong>
              </div>
              <div className="np-mock-card">
                <span><LineIcon name="growth" /> Receitas (mês)</span>
                <strong>R$ 48.750,00</strong>
                <small className="np-trend-up">↑ 18% vs mês anterior</small>
              </div>
              <div className="np-mock-card">
                <span><LineIcon name="patient" /> Consultas (mês)</span>
                <strong>156</strong>
                <small className="np-trend-up">↑ 12% vs mês anterior</small>
              </div>
            </div>
            <div className="np-charts-grid">
              <div className="np-chart-card np-agenda-mock">
                <div className="np-chart-header">
                  <span>Agenda de hoje</span>
                </div>
                <div className="np-agenda-list">
                  <div className="np-agenda-item"><b>08:00</b> <i className="np-avatar a1" /> <div><strong>Ana Paula Silva</strong><small>Consulta</small></div> <span className="np-status conf">Confirmado</span></div>
                  <div className="np-agenda-item"><b>09:00</b> <i className="np-avatar a2" /> <div><strong>Carlos Mendes</strong><small>Retorno</small></div> <span className="np-status conf">Confirmado</span></div>
                  <div className="np-agenda-item"><b>10:00</b> <i className="np-avatar a3" /> <div><strong>Juliana Castro</strong><small>Consulta</small></div> <span className="np-status andamento">Em andamento</span></div>
                  <div className="np-agenda-item"><b>11:00</b> <i className="np-avatar a4" /> <div><strong>Marcos Vinicius</strong><small>Avaliação</small></div> <span className="np-status conf">Confirmado</span></div>
                  <div className="np-agenda-item"><b>14:00</b> <i className="np-avatar a5" /> <div><strong>Fernanda Lima</strong><small>Consulta</small></div> <span className="np-status conf">Confirmado</span></div>
                </div>
                <div className="np-agenda-link">Ver agenda completa →</div>
              </div>
              
              <div className="np-right-mock-col">
                <div className="np-chart-card np-receitas-mock">
                  <div className="np-chart-header">
                    <span>Receitas</span>
                    <small>Este mês v</small>
                  </div>
                  <div className="np-line-chart" />
                </div>
                <div className="np-chart-card np-activities-mock">
                  <div className="np-chart-header">
                    <span>Atividades recentes</span>
                  </div>
                  <div className="np-activity-list">
                    <div className="np-activity-item"><i className="np-act-icon user"><LineIcon name="users" /></i> <div><strong>Novo paciente cadastrado</strong><small>há 15 min</small></div></div>
                    <div className="np-activity-item"><i className="np-act-icon money"><LineIcon name="growth" /></i> <div><strong>Pagamento recebido</strong><small>há 1 h</small></div></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="np-laptop-base" />
      </div>

      <div className="np-phone">
        <div className="np-phone-notch" />
        <div className="np-phone-screen">
          <div className="np-phone-header">
            <small>Olá, Ana!</small>
            <p>Bem-vinda ao seu<br/>portal do paciente.</p>
          </div>
          <div className="np-phone-cards">
            <div className="np-phone-card">
              <i className="np-pc-icon"><LineIcon name="calendar" /></i>
              <div><b>Agendamentos</b><em>Veja e gerencie seus horários</em></div>
              <small>&gt;</small>
            </div>
            <div className="np-phone-card">
              <i className="np-pc-icon"><LineIcon name="clipboard" /></i>
              <div><b>Prontuário</b><em>Acesse seus registros</em></div>
              <small>&gt;</small>
            </div>
            <div className="np-phone-card">
              <i className="np-pc-icon"><LineIcon name="assistant" /></i>
              <div><b>Mensagens</b><em>Fale com a clínica</em></div>
              <small>&gt;</small>
            </div>
            <div className="np-phone-card">
              <i className="np-pc-icon"><LineIcon name="growth" /></i>
              <div><b>Financeiro</b><em>Boletos e pagamentos</em></div>
              <small>&gt;</small>
            </div>
          </div>
          <nav className="np-phone-nav">
            <div className="active"><LineIcon name="dashboard" /><span>Início</span></div>
            <div><LineIcon name="calendar" /><span>Agenda</span></div>
            <div><LineIcon name="assistant" /><span>Mensagens</span></div>
            <div><LineIcon name="users" /><span>Perfil</span></div>
          </nav>
        </div>
      </div>
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

function FooterColumn({ title, links }: { title: string; links: Array<string | { label: string; href: string }> }) {
  return (
    <div className="np-footer-column">
      <h3>{title}</h3>
      {links.map((link) => {
        const label = typeof link === "string" ? link : link.label;
        const href = typeof link === "string" ? "#" : link.href;

        return <a href={href} key={label}>{label}</a>;
      })}
    </div>
  );
}

function ClinOSLogo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M11.5 5.5v21a3 3 0 003 3h3a3 3 0 003-3v-21a3 3 0 00-3-3h-3a3 3 0 00-3 3z" fill="#115cc7" />
      <path d="M5.5 20.5h21a3 3 0 003-3v-3a3 3 0 00-3-3h-21a3 3 0 00-3 3v3a3 3 0 003 3z" fill="#009981" />
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
    assistant: <><path d="M8 25v-7a8 8 0 0 1 16 0v7" {...common} /><path d="M8 20H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2M24 20h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" {...common} /><path d="M12 18h8M12 23h5M19 27c0 2-1.5 3-4 3h-2" {...common} /></>,
    settings: <><circle cx="16" cy="16" r="3" {...common} /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" {...common} /></>
  };

  return <svg className="np-line-icon" viewBox="0 0 32 32" aria-hidden="true">{icons[name] ?? icons.leaf}</svg>;
}
