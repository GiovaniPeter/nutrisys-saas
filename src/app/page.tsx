import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { DashboardLink } from "@/components/auth/dashboard-link";

const features = [
  {
    icon: "patient",
    title: "Prontuário completo",
    text: "Anamnese, evolução nutricional, avaliação antropométrica, recordatório 24h e histórico clínico em um só lugar."
  },
  {
    icon: "meal",
    title: "Planos alimentares e receitas",
    text: "Monte planos alimentares personalizados com tabela TACO/IBGE, calcule macros automaticamente e envie pelo portal do paciente."
  },
  {
    icon: "calendar",
    title: "Agenda e portal do paciente",
    text: "Agenda online com lembretes automáticos, chat, diário alimentar, hidratação e portal exclusivo do paciente."
  },
  {
    icon: "growth",
    title: "Gestão e financeiro",
    text: "Controle financeiro, KPIs, relatórios de atendimento e indicadores para crescer seu consultório ou clínica."
  }
];

const steps = [
  {
    icon: "clinic",
    title: "Crie sua conta",
    text: "Cadastre seu consultório ou clínica em menos de 2 minutos. É grátis por 7 dias."
  },
  {
    icon: "addPatient",
    title: "Cadastre seus pacientes",
    text: "Importe ou adicione pacientes, registre dados clínicos, medidas e exames laboratoriais."
  },
  {
    icon: "clipboard",
    title: "Prescreva e acompanhe",
    text: "Crie planos alimentares, receitas, suplementação e defina metas com seus pacientes."
  },
  {
    icon: "dashboard",
    title: "Gerencie tudo em um painel",
    text: "Agenda, financeiro, portal do paciente e indicadores: controle total da sua rotina."
  }
];

const plans = [
  {
    code: "essential",
    name: "Essencial",
    price: "R$ 39,50",
    features: ["Pacientes", "Agenda", "Prontuários e Planos", "PDFs"]
  },
  {
    code: "professional",
    name: "Profissional",
    price: "R$ 74,50",
    highlighted: true,
    features: ["Pacientes ilimitados", "Portal do paciente", "Chat", "Financeiro", "KPIs"]
  },
  {
    code: "clinic",
    name: "Clínica",
    price: "R$ 124,50",
    features: ["Multi-profissional", "Secretária", "Permissões", "Relatórios avançados"]
  }
];

const faqs = [
  {
    question: "Serve para nutricionistas?",
    answer: "Sim! O ClinOS foi pensado especialmente para nutricionistas: planos alimentares, recordatório 24h, tabela TACO/IBGE, diário alimentar, cálculo de GEB/GET e muito mais."
  },
  {
    question: "E para outros profissionais de saúde?",
    answer: "Também! Psicólogos, fisioterapeutas, médicos e outros profissionais podem usar o prontuário, agenda, financeiro e portal do paciente."
  },
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
    answer: "Sim. Cada clínica tem seus dados 100% separados e seguros, em conformidade com a LGPD."
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
            <strong>Clin<span style={{ color: '#00d8ff' }}>OS</span></strong>
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
          <div className="np-hero-brand">
            <ClinOSLogo />
            <span>Clin<span style={{ color: '#00d8ff' }}>OS</span></span>
          </div>
          <h1>
            O software completo para{" "}
            <span className="np-hero-highlight">nutricionistas</span>
            {" "}e clínicas multiprofissionais
          </h1>
          <p>
            Prontuário, agenda, financeiro, planos alimentares e portal do paciente — tudo em uma <strong>única plataforma</strong>.
          </p>

          <div className="np-hero-features">
            <div className="np-hero-feature">
              <div className="np-feature-icon icon-green"><LineIcon name="meal" /></div>
              <span>Planos<br/>alimentares</span>
            </div>
            <div className="np-hero-feature">
              <div className="np-feature-icon icon-blue"><LineIcon name="clipboard" /></div>
              <span>Prontuário</span>
            </div>
            <div className="np-hero-feature">
              <div className="np-feature-icon icon-green"><LineIcon name="calendar" /></div>
              <span>Agenda</span>
            </div>
            <div className="np-hero-feature">
              <div className="np-feature-icon icon-blue"><LineIcon name="users" /></div>
              <span>Pacientes</span>
            </div>
            <div className="np-hero-feature">
              <div className="np-feature-icon icon-purple"><LineIcon name="clinic" /></div>
              <span>Financeiro</span>
            </div>
            <div className="np-hero-feature">
              <div className="np-feature-icon icon-blue"><LineIcon name="message" /></div>
              <span>Portal do<br/>paciente</span>
            </div>
          </div>

        </div>
        
        <ProductMockup />

        <div className="np-hero-badges">
          <div className="np-hero-badge"><LineIcon name="assistant" /><span>Segurança<br/>de dados</span></div>
          <div className="np-hero-badge"><LineIcon name="dashboard" /><span>Acesso<br/>web e mobile</span></div>
          <div className="np-hero-badge"><LineIcon name="addPatient" /><span>Integração<br/>completa</span></div>
          <div className="np-hero-badge"><LineIcon name="growth" /><span>Gestão<br/>inteligente</span></div>
        </div>
      </section>

      <section className="np-section" id="sobre">
        <div className="np-section-heading np-center">
          <span>Sobre nós</span>
          <h2>Nosso propósito e valores</h2>
        </div>

        <div className="np-feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <article className="np-feature-card">
            <div className="np-feature-icon icon-blue" style={{ marginBottom: '16px' }}><LineIcon name="growth" /></div>
            <h3>Missão</h3>
            <p>Empoderar profissionais de saúde com tecnologia intuitiva e inteligente, simplificando a gestão de clínicas para que possam focar no que realmente importa: o cuidado e a evolução dos pacientes.</p>
          </article>
          
          <article className="np-feature-card">
            <div className="np-feature-icon icon-purple" style={{ marginBottom: '16px' }}><LineIcon name="dashboard" /></div>
            <h3>Visão</h3>
            <p>Ser o sistema operacional padrão e mais amado pelas clínicas multiprofissionais do Brasil, reconhecido pela excelência em usabilidade, segurança de dados e inovação contínua do mercado.</p>
          </article>
          
          <article className="np-feature-card">
            <div className="np-feature-icon icon-green" style={{ marginBottom: '16px' }}><LineIcon name="users" /></div>
            <h3>Valores</h3>
            <p>
              <strong>Cuidado:</strong> Pessoas sempre em primeiro lugar.<br/>
              <strong>Simplicidade:</strong> Menos cliques, mais eficiência.<br/>
              <strong>Transparência:</strong> Ética e segurança em cada dado processado.
            </p>
          </article>
        </div>
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
          <h2>Comece a transformar seus atendimentos</h2>
          <p>
            Experimente o ClinOS por 7 dias grátis. Planos alimentares, prontuário, agenda e
            financeiro para nutricionistas e profissionais de saúde.
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
              <strong>Clin<span style={{ color: '#00d8ff' }}>OS</span></strong>
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
            { label: "Termos de uso", href: "/termos-de-uso" },
            { label: "Politica de privacidade", href: "/politica-de-privacidade" },
            { label: "Exclusao de conta", href: "/exclusao-de-conta" },
            { label: "Recuperar senha", href: "/recuperar-senha" }
          ]}
        />
        <div className="np-footer-column">
          <h3>Fale conosco</h3>
          <a href="mailto:contato@clinos.com.br">contato@clinos.com.br</a>
          <a href="tel:+5569999258988">(69) 99925-8988</a>
        </div>

        <p className="np-copyright">© 2026 ClinOS. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}

function ProductMockup() {
  return (
    <div className="np-product-wrap" aria-label="Prévia do sistema ClinOS">
      <div className="np-tech-bg" aria-hidden="true" />
      <div className="np-laptop">
        <div className="np-laptop-top">
          <span>Clin<span style={{ color: '#00d8ff' }}>OS</span></span>
          <div><i /> <i /> <i /></div>
        </div>
        <div className="np-dashboard-preview">
          <aside>
            <div className="np-mock-logo">
              <ClinOSLogo />
              <span>Clin<span style={{ color: '#00d8ff' }}>OS</span></span>
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
    <svg viewBox="0 0 32 32" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="clinosLogoGrad1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0284c7" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="clinosLogoGrad2" x1="32" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#059669" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <path d="M12.5 4C12.5 2.89543 13.3954 2 14.5 2H17.5C18.6046 2 19.5 2.89543 19.5 4V28C19.5 29.1046 18.6046 30 17.5 30H14.5C13.3954 30 12.5 29.1046 12.5 28V4Z" fill="url(#clinosLogoGrad1)"/>
      <path d="M4 12.5C2.89543 12.5 2 13.3954 2 14.5V17.5C2 18.6046 2.89543 19.5 4 19.5H28C29.1046 19.5 30 18.6046 30 17.5V14.5C30 13.3954 29.1046 12.5 28 12.5H4Z" fill="url(#clinosLogoGrad2)" fillOpacity="0.9"/>
      <circle cx="16" cy="16" r="3.5" fill="#ffffff" opacity="0.95" />
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
    message: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" {...common} /><path d="M8 14h6M8 18h12M8 10h12" {...common} /></>,
    leaf: <><path d="M7 17C7 9 13 5 25 4c0 12-5 18-13 18-2 0-3.6-.5-5-1.5Z" {...common} /><path d="M10 21c4-7 8-11 14-14" {...common} /></>,
    users: <><circle cx="12" cy="11" r="4" {...common} /><path d="M5 24c0-4 3-7 7-7s7 3 7 7" {...common} /><path d="M22 14a3 3 0 1 0 0-6M21 19c3 .2 5 2.4 5 5" {...common} /></>,
    assistant: <><path d="M8 25v-7a8 8 0 0 1 16 0v7" {...common} /><path d="M8 20H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2M24 20h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" {...common} /><path d="M12 18h8M12 23h5M19 27c0 2-1.5 3-4 3h-2" {...common} /></>,
    settings: <><circle cx="16" cy="16" r="3" {...common} /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" {...common} /></>
  };

  return <svg className="np-line-icon" viewBox="0 0 32 32" aria-hidden="true">{icons[name] ?? icons.leaf}</svg>;
}
