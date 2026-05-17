import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/session";

const heroTrust = [
  { icon: "shield", title: "1 teste grátis", text: "sem compromisso" },
  { icon: "credit", title: "Créditos pré-pagos", text: "pague só pelo que usar" },
  { icon: "wallet", title: "Sem recorrência", text: "pagamento único" },
  { icon: "checkShield", title: "Conforme ANVISA", text: "em conformidade" }
];

const features = [
  {
    icon: "calculator",
    title: "Cálculo automatizado",
    text: "Resultados precisos com base em tabelas atualizadas."
  },
  {
    icon: "document",
    title: "Visual profissional",
    text: "Tabelas e rótulos prontos para uso e impressão com padrão premium."
  },
  {
    icon: "checkCircle",
    title: "Fluxo simples",
    text: "Em poucos passos você cria, revisa e gera seu rótulo."
  },
  {
    icon: "folder",
    title: "Dados organizados",
    text: "Receitas e informações sempre salvas e fáceis de encontrar."
  }
];

const steps = [
  {
    icon: "filePlus",
    title: "Cadastre a receita",
    text: "Adicione ingredientes, quantidades e porção."
  },
  {
    icon: "searchCheck",
    title: "Revise os dados",
    text: "O sistema calcula tudo automaticamente."
  },
  {
    icon: "label",
    title: "Gere tabela e rótulo",
    text: "Visualize, exporte e utilize com total conformidade."
  }
];

const audiences = [
  {
    icon: "basket",
    title: "Pequenos produtores",
    text: "Padronize receitas e apresente rótulos com profissionalismo."
  },
  {
    icon: "user",
    title: "Nutricionistas e consultores",
    text: "Entregue mais valor aos seus clientes com agilidade e precisão."
  },
  {
    icon: "jar",
    title: "Marcas artesanais",
    text: "Rótulos atrativos e conformes que valorizam sua marca."
  },
  {
    icon: "store",
    title: "Negócios alimentícios",
    text: "Organize informações, ganhe tempo e facilite a aprovação."
  }
];

const plans = [
  {
    code: "free-test",
    name: "Teste grátis",
    price: "R$ 0",
    badge: "1 crédito gratuito",
    text: "Experimente a plataforma e gere 1 rótulo sem custo.",
    features: ["1 teste grátis", "Visualização profissional", "Ideal para conhecer o sistema"],
    cta: "Começar grátis"
  },
  {
    code: "pro-semestral",
    name: "Plano Pro Semestral",
    price: "R$ 499,00",
    badge: "pagamento único, sem recorrência",
    text: "Acesso Pro por 6 meses.",
    highlighted: true,
    features: ["Uso contínuo", "Mais economia", "Recursos profissionais", "Suporte prioritário"],
    cta: "Assinar plano Pro"
  },
  {
    code: "professional-pack",
    name: "Pacote Profissional",
    price: "R$ 15,00",
    badge: "por rótulo | mínimo 10+",
    text: "Ideal para demandas em volume.",
    features: ["10+ rótulos", "Preço unitário reduzido", "Perfeito para empresas e consultores", "Exportação profissional"],
    cta: "Solicitar pacote"
  }
];

const nutritionRows = [
  ["Valor energético", "227 kcal = 952 kJ", "11%"],
  ["Carboidratos", "28 g", "9%"],
  ["Açúcares totais", "18 g", "-"],
  ["Proteínas", "3,6 g", "5%"],
  ["Gorduras totais", "10 g", "15%"],
  ["Gorduras saturadas", "4,2 g", "21%"],
  ["Gorduras trans", "0 g", "0%"],
  ["Fibra alimentar", "1,6 g", "6%"],
  ["Sódio", "85 mg", "4%"]
];

export default async function Home() {
  const user = await getCurrentUser();
  const primaryHref = user ? "/dashboard" : "/register";

  return (
    <main className="rc-page">
      <section className="rc-hero" id="inicio">
        <header className="rc-header">
          <Link href="/" className="rc-brand" aria-label="RótuloConforme">
            <span className="rc-brand-mark">R</span>
            <strong>RótuloConforme</strong>
          </Link>

          <nav className="rc-nav" aria-label="Navegação principal">
            <a href="#como-funciona">Como funciona</a>
            <a href="#publico">Para quem é</a>
            <a href="#planos">Planos</a>
          </nav>

          <Link href={user ? "/dashboard" : "/login"} className="rc-menu-button" aria-label={user ? "Abrir dashboard" : "Entrar"}>
            <span />
            <span />
            <span />
          </Link>
        </header>

        <div className="rc-hero-grid">
          <div className="rc-hero-copy">
            <span className="rc-badge"><Icon name="shield" /> App de rotulagem nutricional</span>
            <h1>
              Rotulagem profissional com <span>visual de app nativo</span>
            </h1>
            <p>
              Crie tabelas nutricionais, organize receitas e gere rótulos com mais agilidade e segurança.
              <strong> Tudo conforme a ANVISA.</strong>
            </p>
            <div className="rc-actions">
              <Link href={primaryHref} className="rc-button rc-button-primary">
                Testar grátis <span aria-hidden="true">›</span>
              </Link>
              <a href="#planos" className="rc-button rc-button-secondary">Ver planos</a>
            </div>
          </div>

          <PhoneMockup />
        </div>

        <div className="rc-trust-strip">
          {heroTrust.map((item) => (
            <TrustItem key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className="rc-section rc-feature-section" id="recursos">
        <div className="rc-feature-grid">
          {features.map((feature) => (
            <article className="rc-feature-card" key={feature.title}>
              <Icon name={feature.icon} />
              <h2>{feature.title}</h2>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rc-section" id="como-funciona">
        <SectionHeading title="Como funciona" />
        <div className="rc-step-row">
          {steps.map((step, index) => (
            <article className="rc-step-card" key={step.title}>
              <div className="rc-step-icon">
                <span>{index + 1}</span>
                <Icon name={step.icon} />
              </div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rc-section" id="publico">
        <SectionHeading title="Feito para quem precisa vender mais" />
        <div className="rc-audience-grid">
          {audiences.map((audience) => (
            <article className="rc-audience-card" key={audience.title}>
              <Icon name={audience.icon} />
              <h3>{audience.title}</h3>
              <p>{audience.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rc-section rc-pricing-section" id="planos">
        <SectionHeading title="Planos simples, transparentes e sem mensalidade" />
        <p className="rc-prepaid-note"><Icon name="credit" /> Créditos pré-pagos: pague apenas pelo que usar.</p>

        <div className="rc-pricing-grid">
          {plans.map((plan) => (
            <article className={plan.highlighted ? "rc-price-card rc-price-featured" : "rc-price-card"} key={plan.code}>
              {plan.highlighted ? <span className="rc-popular">Mais vantajoso</span> : null}
              <h3>{plan.name}</h3>
              <div className="rc-price-value">{plan.price}</div>
              <span className="rc-plan-badge">{plan.badge}</span>
              <p>{plan.text}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}><Icon name="miniCheck" /> {feature}</li>
                ))}
              </ul>
              <Link href={`/register?plan=${plan.code}`} className={plan.highlighted ? "rc-button rc-button-primary" : "rc-button rc-button-outline"}>
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="rc-section rc-proof-section" aria-label="Prova social e confiança">
        <article className="rc-testimonial-card">
          <span className="rc-quote">“</span>
          <div className="rc-stars" aria-label="5 estrelas">★★★★★</div>
          <p>O RótuloConforme mudou nossa rotina. É rápido, intuitivo e os rótulos ficam com um visual incrível.</p>
          <div className="rc-person">
            <span>JM</span>
            <div>
              <strong>Juliana Mendes</strong>
              <small>Nutricionista</small>
            </div>
          </div>
        </article>

        <div className="rc-stats-stack">
          <Stat icon="users" value="+3.500" text="usuários ativos" />
          <Stat icon="document" value="+12 mil" text="rótulos gerados" />
          <Stat icon="heart" value="98%" text="satisfação dos usuários" />
        </div>

        <article className="rc-compliance-card">
          <Icon name="checkShield" />
          <h3>Compatível com normas ANVISA</h3>
          <p>Segurança e conformidade para o seu negócio.</p>
        </article>
      </section>

      <section className="rc-final-cta">
        <div>
          <h2>Pronto para profissionalizar seus rótulos?</h2>
          <p>Comece com 1 teste grátis ou escolha o plano ideal para sua demanda.</p>
          <div className="rc-actions">
            <Link href={primaryHref} className="rc-button rc-button-primary">Testar grátis <span aria-hidden="true">›</span></Link>
            <a href="#planos" className="rc-button rc-button-secondary">Ver opções</a>
          </div>
        </div>
        <div className="rc-cta-illustration" aria-hidden="true">
          <Icon name="label" />
        </div>
      </section>

      <footer className="rc-footer">
        <Link href="/" className="rc-brand" aria-label="RótuloConforme">
          <span className="rc-brand-mark">R</span>
          <strong>RótuloConforme</strong>
        </Link>
        <p>Rotulagem nutricional inteligente para negócios alimentícios.</p>
      </footer>
    </main>
  );
}

function PhoneMockup() {
  return (
    <div className="rc-phone-wrap" aria-label="Prévia do aplicativo RótuloConforme">
      <div className="rc-phone">
        <div className="rc-phone-notch" />
        <div className="rc-phone-screen">
          <div className="rc-app-top">
            <span><span className="rc-mini-logo">R</span> RótuloConforme</span>
            <span className="rc-app-menu">☰</span>
          </div>

          <div className="rc-product-head">
            <div className="rc-product-image" />
            <div>
              <strong>Bolo de Chocolate</strong>
              <small>Porção: 60 g (1 fatia)</small>
            </div>
          </div>

          <div className="rc-nutrition-card">
            <h3>Informação Nutricional</h3>
            <small>Porção de 60 g (1 fatia)</small>
            <table>
              <thead>
                <tr>
                  <th>Quantidade por porção</th>
                  <th>%VD*</th>
                </tr>
              </thead>
              <tbody>
                {nutritionRows.map(([name, value, percent]) => (
                  <tr key={name}>
                    <td><span>{name}</span><strong>{value}</strong></td>
                    <td>{percent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>*Percentual de valores diários fornecidos pela porção.</p>
          </div>

          <button className="rc-generate-button" type="button"><Icon name="label" /> Gerar rótulo</button>
        </div>
      </div>
    </div>
  );
}

function TrustItem({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <article className="rc-trust-item">
      <span><Icon name={icon} /></span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </article>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="rc-section-heading">
      <h2>{title}</h2>
      <span />
    </div>
  );
}

function Stat({ icon, value, text }: { icon: string; value: string; text: string }) {
  return (
    <article className="rc-stat-card">
      <Icon name={icon} />
      <div>
        <strong>{value}</strong>
        <span>{text}</span>
      </div>
    </article>
  );
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    shield: <path d="M12 3 5 6v6c0 4.6 2.9 7.8 7 9 4.1-1.2 7-4.4 7-9V6l-7-3Z" />,
    checkShield: <><path d="M12 3 5 6v6c0 4.6 2.9 7.8 7 9 4.1-1.2 7-4.4 7-9V6l-7-3Z" /><path d="m8.8 12.4 2 2L15.6 9" /></>,
    credit: <><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M3 10h18M7 15h4" /></>,
    wallet: <><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" /><path d="M16 12h4" /></>,
    calculator: <><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0" /></>,
    document: <><path d="M7 3h7l4 4v14H7V3Z" /><path d="M14 3v5h5M9 12h6M9 16h6" /></>,
    checkCircle: <><circle cx="12" cy="12" r="8" /><path d="m8.8 12.4 2 2L15.6 9" /></>,
    folder: <><path d="M3 7h7l2 2h9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /><path d="M3 7V5a2 2 0 0 1 2-2h5l2 4" /></>,
    filePlus: <><path d="M7 3h7l4 4v14H7V3Z" /><path d="M14 3v5h5M10 14h5M12.5 11.5v5" /></>,
    searchCheck: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4M8.8 11.5l1.5 1.5 3.2-3.5" /></>,
    label: <><path d="M5 4h10l4 4v12H5V4Z" /><path d="M9 9h6M9 13h6M9 17h4" /></>,
    basket: <><path d="m6 10 2-5M18 10l-2-5M4 10h16l-1.5 9h-13L4 10Z" /><path d="M9 14h6" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4.5 4-7 8-7s7 2.5 8 7" /></>,
    jar: <><path d="M8 3h8v4H8V3ZM7 8h10l1 11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L7 8Z" /><path d="M10 14c1.1-1.8 3-1.8 4 0-1 2-3 2-4 0Z" /></>,
    store: <><path d="M4 10h16l-2-5H6l-2 5Z" /><path d="M6 10v10h12V10M9 20v-6h6v6" /></>,
    miniCheck: <path d="m5 12 4 4L19 6" />,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c.7-3 2.7-5 6-5s5.3 2 6 5" /><path d="M16 11a3 3 0 1 0-1-5.8M18 20c-.3-1.7-1.1-3-2.3-3.9" /></>,
    heart: <path d="M12 20s-7-4.4-9-9.2C1.7 7.7 3.8 5 6.8 5c1.8 0 3.1 1 4.2 2.3C12.1 6 13.4 5 15.2 5c3 0 5.1 2.7 3.8 5.8C19 15.6 12 20 12 20Z" />
  };

  return (
    <svg className="rc-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
