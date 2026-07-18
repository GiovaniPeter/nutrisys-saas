import Link from "next/link";
import type { ReactNode } from "react";

export type MarketingFeature = {
  title: string;
  text: string;
  label: string;
};

export type MarketingFaq = {
  question: string;
  answer: string;
};

type SolutionPageProps = {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  canonical: string;
  panelTitle: string;
  panelItems: string[];
  featuresTitle: string;
  featuresLead: string;
  features: MarketingFeature[];
  fitTitle: string;
  fitItems: string[];
  considerations: string[];
  steps: Array<{ title: string; text: string }>;
  faqs: MarketingFaq[];
};

const SITE_URL = "https://clinos.tec.br";

export function SolutionPage({
  eyebrow,
  title,
  lead,
  canonical,
  panelTitle,
  panelItems,
  featuresTitle,
  featuresLead,
  features,
  fitTitle,
  fitItems,
  considerations,
  steps,
  faqs
}: SolutionPageProps) {
  const pageUrl = `${SITE_URL}${canonical}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: typeof title === "string" ? title : eyebrow,
        inLanguage: "pt-BR",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#software` }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "ClinOS",
            item: `${SITE_URL}/`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: eyebrow,
            item: pageUrl
          }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer
          }
        }))
      }
    ]
  };

  return (
    <main className="marketing-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingHeader />

      <section className="marketing-hero">
        <div className="marketing-hero-copy">
          <nav className="marketing-breadcrumb" aria-label="Navegação estrutural">
            <Link href="/">ClinOS</Link>
            <span aria-hidden="true">/</span>
            <span>{eyebrow}</span>
          </nav>
          <span className="marketing-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{lead}</p>
          <div className="marketing-actions">
            <Link href="/register" className="np-button np-button-primary">
              Testar grátis por 7 dias
            </Link>
            <Link href="/recursos" className="np-button np-button-outline">
              Explorar recursos
            </Link>
          </div>
          <div className="marketing-proof" aria-label="Condições do teste">
            <span>Sem cartão no cadastro</span>
            <span>Acesso web e mobile</span>
            <span>Cancele quando quiser</span>
          </div>
        </div>

        <aside className="marketing-panel" aria-label={panelTitle}>
          <span className="marketing-panel-kicker">Visão prática</span>
          <h2>{panelTitle}</h2>
          <ul>
            {panelItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link href="/#planos">Ver planos e preços <span aria-hidden="true">→</span></Link>
        </aside>
      </section>

      <section className="marketing-section">
        <div className="marketing-section-heading">
          <span>Recursos conectados</span>
          <h2>{featuresTitle}</h2>
          <p>{featuresLead}</p>
        </div>
        <div className="marketing-card-grid">
          {features.map((feature, index) => (
            <article className="marketing-card" key={feature.title}>
              <span className="marketing-card-index">{String(index + 1).padStart(2, "0")}</span>
              <small>{feature.label}</small>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section marketing-fit-section">
        <div className="marketing-fit-copy">
          <span className="marketing-eyebrow">Escolha consciente</span>
          <h2>{fitTitle}</h2>
          <p>
            Uma boa plataforma precisa combinar com o tamanho da operação, o fluxo
            de atendimento e o nível de acompanhamento desejado.
          </p>
        </div>
        <div className="marketing-fit-columns">
          <article>
            <h3>O ClinOS faz sentido se você precisa de:</h3>
            <ul>
              {fitItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <article className="marketing-fit-note">
            <h3>Antes de contratar, considere:</h3>
            <ul>
              {considerations.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-section-heading">
          <span>Do cadastro ao acompanhamento</span>
          <h2>Uma rotina organizada em quatro etapas</h2>
        </div>
        <ol className="marketing-steps">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span>{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="marketing-section">
        <div className="marketing-section-heading">
          <span>Respostas objetivas</span>
          <h2>Dúvidas frequentes</h2>
        </div>
        <div className="marketing-faq-list">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <MarketingCta />
      <MarketingFooter />
    </main>
  );
}

export function MarketingHeader() {
  return (
    <header className="marketing-header">
      <Link href="/" className="marketing-logo" aria-label="ClinOS — página inicial">
        <ClinOSMark />
        <span>
          <strong>Clin<em>OS</em></strong>
          <small>O sistema operacional da sua clínica</small>
        </span>
      </Link>
      <nav aria-label="Navegação principal">
        <Link href="/recursos">Recursos</Link>
        <Link href="/software-para-nutricionistas">Nutricionistas</Link>
        <Link href="/sistema-para-clinicas">Clínicas</Link>
        <Link href="/#planos">Planos</Link>
      </nav>
      <div className="marketing-header-actions">
        <Link href="/login">Entrar</Link>
        <Link href="/register" className="np-button np-button-primary">Criar conta</Link>
      </div>
    </header>
  );
}

export function MarketingCta() {
  return (
    <section className="marketing-cta">
      <div>
        <span>7 dias para conhecer na prática</span>
        <h2>Centralize sua rotina sem perder o foco no paciente.</h2>
        <p>Crie sua conta, escolha o plano e teste os fluxos que fazem sentido para sua operação.</p>
      </div>
      <Link href="/register" className="np-button np-button-light np-button-large">
        Começar teste grátis <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div>
        <Link href="/" className="marketing-logo" aria-label="ClinOS — página inicial">
          <ClinOSMark />
          <span>
            <strong>Clin<em>OS</em></strong>
            <small>Gestão para profissionais e clínicas</small>
          </span>
        </Link>
        <p>Plataforma web brasileira para organizar atendimento, acompanhamento e gestão.</p>
      </div>
      <nav aria-label="Soluções">
        <strong>Soluções</strong>
        <Link href="/software-para-nutricionistas">Para nutricionistas</Link>
        <Link href="/sistema-para-clinicas">Para clínicas</Link>
        <Link href="/recursos">Todos os recursos</Link>
      </nav>
      <nav aria-label="Informações">
        <strong>Informações</strong>
        <Link href="/#planos">Planos e preços</Link>
        <Link href="/termos-de-uso">Termos de uso</Link>
        <Link href="/politica-de-privacidade">Privacidade</Link>
      </nav>
      <nav aria-label="Acesso">
        <strong>Acesso</strong>
        <Link href="/login">Entrar</Link>
        <Link href="/register">Criar conta</Link>
        <a href="mailto:contato@clinos.tec.br">contato@clinos.tec.br</a>
      </nav>
      <small className="marketing-copyright">© 2026 ClinOS. Todos os direitos reservados.</small>
    </footer>
  );
}

function ClinOSMark() {
  return (
    <span className="marketing-logo-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="marketingLogoA" x1="0" y1="0" x2="32" y2="32">
            <stop stopColor="#0284c7" />
            <stop offset="1" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="marketingLogoB" x1="32" y1="0" x2="0" y2="32">
            <stop stopColor="#059669" />
            <stop offset="1" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <path d="M12.5 4A2 2 0 0 1 14.5 2h3a2 2 0 0 1 2 2v24a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V4Z" fill="url(#marketingLogoA)" />
        <path d="M4 12.5h24a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Z" fill="url(#marketingLogoB)" fillOpacity=".9" />
        <circle cx="16" cy="16" r="3.5" fill="#fff" />
      </svg>
    </span>
  );
}
