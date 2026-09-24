import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Metadata } from "next";
import { AnalyticsEvent } from "@/components/analytics/analytics-event";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { DashboardLink } from "@/components/auth/dashboard-link";

export const metadata: Metadata = {
  title: "Software para Nutricionistas — Planos Alimentares, TACO e Portal do Paciente | NutriPlan",
  description:
    "Monte planos alimentares em 3 minutos com tabela TACO, TBCA e medidas caseiras reais. Gere substituições equivalentes, calcule GEB/GET e encante seus pacientes com diário alimentar por fotos e portal exclusivo.",
  alternates: {
    canonical: "/"
  }
};

const features = [
  {
    icon: "meal",
    title: "Planos alimentares em 3 minutos",
    text: "Prescreva em gramas exatas ou medidas caseiras reais (colheres, fatias, conchas, scoops) com mais de 1.000 alimentos da TACO, TBCA e suplementos."
  },
  {
    icon: "leaf",
    title: "Substituições equivalentes em 1 clique",
    text: "Gere automaticamente opções de substituição do mesmo grupo alimentar calculadas para manter exatamente as mesmas calorias e macronutrientes."
  },
  {
    icon: "patient",
    title: "Prontuário, GEB/GET e antropometria",
    text: "Anamneses para nutrição clínica, esportiva e materno-infantil, protocolos de gasto energético (Mifflin, Harris-Benedict, Katch-McArdle) e evolução corporal."
  },
  {
    icon: "message",
    title: "Portal exclusivo do paciente no celular",
    text: "Seu paciente acessa o cardápio publicado, envia fotos das refeições no diário alimentar, registra hidratação diária, bate metas e conversa com você pelo chat."
  },
  {
    icon: "clipboard",
    title: "Receitas calculadas, suplementos e exames",
    text: "Biblioteca de receitas fitness com cálculo automático de macros, lista de compras inteligente, prescrição de suplementos/fitoterápicos e histórico laboratorial."
  },
  {
    icon: "growth",
    title: "Agenda online, WhatsApp e financeiro",
    text: "Link público de agendamento para captação de pacientes, confirmação de consultas, controle de receitas/despesas e indicadores de retenção do consultório."
  }
];

const steps = [
  {
    icon: "clinic",
    title: "Crie sua conta grátis",
    text: "Cadastre seu consultório de nutrição em menos de 1 minuto e libere 7 dias de acesso completo sem precisar de cartão."
  },
  {
    icon: "addPatient",
    title: "Avalie seu paciente",
    text: "Registre a anamnese nutricional, evolução antropométrica, exames laboratoriais e calcule o GEB/GET automaticamente."
  },
  {
    icon: "meal",
    title: "Monte o cardápio com medidas caseiras",
    text: "Adicione alimentos da TACO e suplementos, gere substituições equivalentes em 1 clique e publique no Portal do Paciente."
  },
  {
    icon: "dashboard",
    title: "Fidelize entre as consultas",
    text: "Acompanhe as fotos do diário alimentar, metas de água, dúvidas pelo chat e o faturamento mensal em um único painel."
  }
];

const plans = [
  {
    code: "essential",
    name: "Nutri Essencial",
    price: "R$ 39,50",
    features: [
      "Até 40 pacientes ativos",
      "Planos alimentares ilimitados (TACO + Medidas Caseiras)",
      "Cálculo energético (GEB/GET) e Antropometria",
      "Anamnese nutricional, Recordatório 24h e Exames",
      "Receitas calculadas e Prescrição de Suplementos",
      "Impressão e PDF personalizado do cardápio"
    ]
  },
  {
    code: "professional",
    name: "Nutri Pro",
    price: "R$ 74,50",
    highlighted: true,
    features: [
      "Pacientes e planos alimentares ilimitados",
      "Portal do Paciente exclusivo no celular",
      "Diário alimentar com fotos e feedback da Nutri",
      "Gerador automático de substituições equivalentes",
      "Metas de hidratação, lista de compras e Chat integrado",
      "Agenda online pública, Financeiro completo e KPIs"
    ]
  },
  {
    code: "clinic",
    name: "Clínica de Nutrição",
    price: "R$ 124,50",
    features: [
      "Tudo do plano Nutri Pro liberado",
      "Múltiplos nutricionistas na mesma clínica (CRN)",
      "Acesso exclusivo para Secretária / Recepção",
      "Base compartilhada de alimentos e receitas da clínica",
      "Relatórios gerenciais avançados e Auditoria LGPD",
      "Suporte prioritário no WhatsApp"
    ]
  }
];

const faqs = [
  {
    question: "Quais tabelas de alimentos já vêm cadastradas no sistema?",
    answer:
      "O sistema já conta com mais de 1.000 alimentos prontos para uso imediato, unindo a Tabela TACO (Unicamp), referências TBCA/IBGE, preparações caseiras brasileiras e suplementos esportivos/clínicos (Whey, Creatina, módulos proteicos), todos com medidas caseiras em português."
  },
  {
    question: "Consigo prescrever tanto em gramas quanto em medidas caseiras?",
    answer:
      "Sim! Ao montar a refeição você pode escolher prescrever por medidas caseiras (ex: 1 unidade, 2 fatias, 4 colheres de sopa) ou digitar o peso exato em gramas/ml (ex: 130 g de arroz), com cálculo automático de calorias, proteínas, carboidratos, gorduras e fibras."
  },
  {
    question: "Como funciona o gerador de substituições equivalentes?",
    answer:
      "Em qualquer item adicionado ao cardápio, basta clicar em 'Substituições' para o sistema calcular automaticamente opções equivalentes do mesmo grupo alimentar na gramagem exata para manter o valor energético daquela refeição."
  },
  {
    question: "Como meu paciente acessa o plano alimentar pelo celular?",
    answer:
      "Assim que você publica o plano alimentar, o sistema gera um código exclusivo para o paciente acessar o Portal do Paciente pelo navegador do celular, onde ele consulta o cardápio, lista de compras, registra água, envia fotos no diário alimentar e conversa com você."
  },
  {
    question: "Posso cadastrar alimentos personalizados e receitas da minha clínica?",
    answer:
      "Sim! Você pode cadastrar seus próprios alimentos, importar planilhas CSV ou clicar em 'Personalizar' em qualquer alimento da tabela TACO para criar uma versão customizada com um clique."
  },
  {
    question: "Preciso informar cartão de crédito para testar os 7 dias grátis?",
    answer:
      "Não. Você cria sua conta em menos de 1 minuto sem cartão de crédito, testa todas as ferramentas com seus pacientes reais por 7 dias e só assina se gostar."
  }
];

export default function Home() {
  const trialHref = "/register";

  return (
    <main className="np-page">
      <AnalyticsEvent name="marketing_landing_view" params={{ landing_name: "home_nutri" }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://clinos.tec.br/#website",
                "url": "https://clinos.tec.br/",
                "name": "NutriPlan — Software para Nutricionistas",
                "inLanguage": "pt-BR",
                "publisher": { "@id": "https://clinos.tec.br/#organization" }
              },
              {
                "@type": "Organization",
                "@id": "https://clinos.tec.br/#organization",
                "name": "NutriPlan ClinOS",
                "url": "https://clinos.tec.br/",
                "email": "contato@clinos.tec.br",
                "telephone": "+55-67-99982-4092"
              },
              {
                "@type": "SoftwareApplication",
                "@id": "https://clinos.tec.br/#software",
                "name": "NutriPlan — Software para Nutricionistas",
                "description":
                  "Software completo para nutricionistas com montagem de planos alimentares, tabela TACO com medidas caseiras, substituições equivalentes, cálculo energético GEB/GET, prontuário nutricional e portal do paciente.",
                "url": "https://clinos.tec.br/",
                "applicationCategory": "HealthApplication",
                "applicationSubCategory": "Nutrition Practice Management Software",
                "operatingSystem": "Web, iOS, Android",
                "inLanguage": "pt-BR",
                "audience": [
                  { "@type": "Audience", "audienceType": "Nutricionistas Clínicos e Esportivos" },
                  { "@type": "Audience", "audienceType": "Consultórios e Clínicas de Nutrição" }
                ],
                "featureList": [
                  "Planos alimentares com tabela TACO e medidas caseiras",
                  "Gerador automático de substituições equivalentes",
                  "Cálculo de GEB/GET e avaliação antropométrica",
                  "Prontuário nutricional, anamnese e recordatório 24h",
                  "Portal do paciente com diário alimentar por fotos e hidratação",
                  "Prescrição de suplementos, fitoterápicos e exames laboratoriais",
                  "Agenda online e controle financeiro para nutricionistas"
                ],
                "offers": {
                  "@type": "AggregateOffer",
                  "lowPrice": "39.50",
                  "highPrice": "124.50",
                  "priceCurrency": "BRL",
                  "offerCount": 3,
                  "url": "https://clinos.tec.br/#planos"
                },
                "provider": { "@id": "https://clinos.tec.br/#organization" }
              },
              {
                "@type": "FAQPage",
                "@id": "https://clinos.tec.br/#faq-schema",
                "mainEntity": faqs.map((faq) => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                  }
                }))
              }
            ]
          })
        }}
      />

      <header className="np-header">
        <Link href="/" className="np-logo" aria-label="NutriPlan — Software para Nutricionistas">
          <span className="np-logo-mark">
            <ClinOSLogo />
          </span>
          <span>
            <strong>
              Nutri<span style={{ color: "#00b894" }}>Plan</span>
            </strong>
            <small>Software para Nutricionistas</small>
          </span>
        </Link>

        <nav className="np-nav" aria-label="Navegação principal">
          <a href="#recursos">Recursos</a>
          <Link href="/software-para-montar-cardapio-nutricionista">Montar Cardápios</Link>
          <Link href="/software-para-nutricionistas">Para Nutricionistas</Link>
          <a href="#planos">Planos e Preços</a>
          <a href="#faq">Dúvidas</a>
        </nav>

        <div className="np-header-actions">
          <DashboardLink />
          <Link href="/login" className="np-button np-button-outline">
            Entrar
          </Link>
          <TrackedLink
            href="/register?perfil=nutricionista&source=home-header"
            className="np-button np-button-primary"
            eventName="cta_click"
            eventParams={{ cta_name: "create_account", cta_location: "home_header" }}
          >
            Testar 7 dias grátis
          </TrackedLink>
        </div>
      </header>

      <section className="np-hero">
        <div className="np-hero-copy">
          <div className="np-hero-brand">
            <ClinOSLogo />
            <span>
              Exclusivo para <strong style={{ color: "#059669" }}>Nutricionistas</strong>
            </span>
          </div>

          <h1>
            Monte planos alimentares em minutos e encante seus{" "}
            <span className="np-hero-highlight">pacientes</span>
          </h1>

          <p>
            Mais de <strong>1.000 alimentos TACO/TBCA com medidas caseiras reais</strong>, gerador automático de
            substituições equivalentes, cálculo de GEB/GET, prontuário nutricional e{" "}
            <strong>Portal do Paciente</strong> com diário alimentar por fotos.
          </p>

          <div className="np-hero-actions">
            <TrackedLink
              href="/register?perfil=nutricionista&plan=professional&source=home-hero"
              className="np-button np-button-primary np-button-large"
              eventName="cta_click"
              eventParams={{ cta_name: "start_free_trial", cta_location: "home_hero", plan_code: "professional" }}
            >
              Começar 7 dias grátis <span aria-hidden="true">→</span>
            </TrackedLink>
            <TrackedLink
              href="/software-para-montar-cardapio-nutricionista"
              className="np-button np-button-outline np-button-large"
              eventName="cta_click"
              eventParams={{ cta_name: "view_meal_plan_builder", cta_location: "home_hero" }}
            >
              Ver montagem de cardápios
            </TrackedLink>
          </div>

          <p className="np-hero-trial-note">
            Sem cartão de crédito · Acesso imediato a toda a tabela TACO e medidas caseiras
          </p>

          <div className="np-hero-features" style={{ gap: "12px" }}>
            <div className="np-hero-feature" style={{ minWidth: "130px" }}>
              <div className="np-feature-icon icon-green">
                <LineIcon name="meal" />
              </div>
              <span style={{ whiteSpace: "nowrap" }}>Cardápios TACO</span>
            </div>
            <div className="np-hero-feature" style={{ minWidth: "130px" }}>
              <div className="np-feature-icon icon-blue">
                <LineIcon name="leaf" />
              </div>
              <span style={{ whiteSpace: "nowrap" }}>Medidas Caseiras</span>
            </div>
            <div className="np-hero-feature" style={{ minWidth: "130px" }}>
              <div className="np-feature-icon icon-green">
                <LineIcon name="clipboard" />
              </div>
              <span style={{ whiteSpace: "nowrap" }}>Cálculo GEB/GET</span>
            </div>
            <div className="np-hero-feature" style={{ minWidth: "130px" }}>
              <div className="np-feature-icon icon-blue">
                <LineIcon name="message" />
              </div>
              <span style={{ whiteSpace: "nowrap" }}>App do Paciente</span>
            </div>
            <div className="np-hero-feature" style={{ minWidth: "130px" }}>
              <div className="np-feature-icon icon-purple">
                <LineIcon name="calendar" />
              </div>
              <span style={{ whiteSpace: "nowrap" }}>Agenda & Finanças</span>
            </div>
          </div>
        </div>

        <ProductMockup />

        <div className="np-hero-badges">
          <div className="np-hero-badge">
            <LineIcon name="meal" />
            <span>1.000+ alimentos com medida caseira</span>
          </div>
          <div className="np-hero-badge">
            <LineIcon name="leaf" />
            <span>Substituições equivalentes em 1 clique</span>
          </div>
          <div className="np-hero-badge">
            <LineIcon name="dashboard" />
            <span>Portal do paciente no celular</span>
          </div>
          <div className="np-hero-badge">
            <LineIcon name="growth" />
            <span>Planos a partir de R$ 39,50/mês</span>
          </div>
        </div>
      </section>

      <section className="np-section" id="recursos">
        <div className="np-section-heading np-center">
          <span>Pensado para a rotina real do consultório</span>
          <h2>Tudo que o nutricionista precisa para calcular, prescrever e fidelizar</h2>
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

      <section className="np-section" id="diferenciais">
        <div className="np-section-heading np-center">
          <span>Por que escolher o NutriPlan</span>
          <h2>Mais velocidade na consulta, maior adesão do paciente em casa</h2>
        </div>

        <div className="np-feature-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
          <article className="np-feature-card">
            <div className="np-feature-icon icon-green" style={{ marginBottom: "16px" }}>
              <LineIcon name="meal" />
            </div>
            <h3>Fim dos cardápios demorados</h3>
            <p>
              Busque alimentos com ou sem acento, alterne entre gramas exatas e medidas caseiras, calcule calorias por
              Atwater automaticamente e gere listas de substituições sem precisar abrir planilhas.
            </p>
          </article>

          <article className="np-feature-card">
            <div className="np-feature-icon icon-blue" style={{ marginBottom: "16px" }}>
              <LineIcon name="message" />
            </div>
            <h3>Acompanhamento próximo no celular</h3>
            <p>
              O paciente não leva apenas um papel para casa: ele acompanha as refeições pelo celular, envia fotos do
              prato para sua avaliação, controla a meta de água em ml e tira dúvidas no chat.
            </p>
          </article>

          <article className="np-feature-card">
            <div className="np-feature-icon icon-purple" style={{ marginBottom: "16px" }}>
              <LineIcon name="growth" />
            </div>
            <h3>Preço justo e sem travas escondidas</h3>
            <p>
              Enquanto outros softwares cobram caro e limitam recursos essenciais, você conta com prontuário completo,
              base TACO enriquecida, suplementos, receitas e gestão financeira com o melhor custo-benefício do Brasil.
            </p>
          </article>
        </div>
      </section>

      <section className="np-section np-how">
        <div className="np-section-heading np-center">
          <span>Passo a passo simples</span>
          <h2>Do agendamento ao cardápio no celular em 4 etapas</h2>
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
          <span>Planos transparentes para nutricionistas</span>
          <h2>Escolha o plano ideal para o seu momento profissional</h2>
        </div>

        <div className="np-pricing-grid">
          {plans.map((plan) => (
            <article
              className={plan.highlighted ? "np-price-card np-price-featured" : "np-price-card"}
              key={plan.code}
            >
              {plan.highlighted ? <span className="np-popular">Mais escolhido pelos Nutris</span> : null}
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
              <TrackedLink
                href={`/register?perfil=nutricionista&plan=${plan.code}&source=home-pricing`}
                className={plan.highlighted ? "np-button np-button-primary" : "np-button np-button-outline"}
                eventName="cta_click"
                eventParams={{ cta_name: "select_plan", cta_location: "home_pricing", plan_code: plan.code }}
              >
                Testar 7 dias grátis
              </TrackedLink>
            </article>
          ))}
        </div>

        <p className="np-pricing-note">
          7 dias grátis em todos os planos · Sem fidelidade · Cancele quando quiser com 1 clique.
        </p>
      </section>

      <section className="np-section" id="faq">
        <div className="np-section-heading np-center">
          <span>Perguntas frequentes</span>
          <h2>Tire suas dúvidas sobre o NutriPlan</h2>
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
          <Image
            src="/nutritionist-laptop.png"
            alt="Nutricionista montando plano alimentar no notebook"
            width={640}
            height={380}
          />
        </div>
        <div className="np-final-copy">
          <h2>Pronta(o) para elevar o nível dos seus atendimentos nutricionais?</h2>
          <p>
            Crie sua conta grátis agora e experimente montar seu próximo cardápio com medidas caseiras, substituições
            automáticas e Portal do Paciente.
          </p>
        </div>
        <div className="np-final-action">
          <TrackedLink
            href={`${trialHref}?perfil=nutricionista&plan=professional&source=home-final-cta`}
            className="np-button np-button-light np-button-large"
            eventName="cta_click"
            eventParams={{ cta_name: "create_account", cta_location: "home_final_cta", plan_code: "professional" }}
          >
            Criar conta de Nutricionista <span aria-hidden="true">→</span>
          </TrackedLink>
          <small>7 dias grátis · sem cartão de crédito</small>
        </div>
      </section>

      <footer className="np-footer">
        <div className="np-footer-brand">
          <Link href="/" className="np-logo" aria-label="NutriPlan">
            <span className="np-logo-mark">
              <ClinOSLogo />
            </span>
            <span>
              <strong>
                Nutri<span style={{ color: "#00b894" }}>Plan</span>
              </strong>
              <small>Software para Nutricionistas</small>
            </span>
          </Link>
          <p>
            Plataforma completa de planos alimentares, prontuário nutricional, avaliação antropométrica e Portal do
            Paciente para nutricionistas.
          </p>
        </div>

        <FooterColumn
          title="Software de Nutrição"
          links={[
            { label: "Recursos Completos", href: "/recursos" },
            { label: "Software para Nutricionistas", href: "/software-para-nutricionistas" },
            { label: "Montagem de Cardápios", href: "/software-para-montar-cardapio-nutricionista" },
            { label: "Para Clínicas de Nutrição", href: "/sistema-para-clinicas" },
            { label: "Planos e Preços", href: "/#planos" }
          ]}
        />
        <FooterColumn
          title="Acesso Rápido"
          links={[
            { label: "Criar Conta Grátis", href: "/register?perfil=nutricionista" },
            { label: "Login do Nutricionista", href: "/login" },
            { label: "Portal do Paciente", href: "/portal/login" },
            { label: "Dúvidas Frequentes", href: "/#faq" }
          ]}
        />
        <FooterColumn
          title="Legal e Suporte"
          links={[
            { label: "Termos de uso", href: "/termos-de-uso" },
            { label: "Política de privacidade", href: "/politica-de-privacidade" },
            { label: "Exclusão de conta", href: "/exclusao-de-conta" },
            { label: "Recuperar senha", href: "/recuperar-senha" }
          ]}
        />
        <div className="np-footer-column">
          <h3>Atendimento ao Nutri</h3>
          <a href="mailto:contato@clinos.tec.br">contato@clinos.tec.br</a>
          <a href="https://wa.me/5567999824092" target="_blank" rel="noopener noreferrer">
            WhatsApp: (67) 99982-4092
          </a>
        </div>

        <p className="np-copyright">© 2026 NutriPlan ClinOS. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}

function ProductMockup() {
  return (
    <div className="np-product-wrap" aria-label="Prévia do sistema NutriPlan para Nutricionistas">
      <div className="np-tech-bg" aria-hidden="true" />
      <div className="np-laptop">
        <div className="np-laptop-top">
          <span>
            Nutri<span style={{ color: "#00b894" }}>Plan</span> · Consultório Nutricional
          </span>
          <div>
            <i /> <i /> <i />
          </div>
        </div>
        <div className="np-dashboard-preview">
          <aside>
            <div className="np-mock-logo">
              <ClinOSLogo />
              <span>
                Nutri<span style={{ color: "#00b894" }}>Plan</span>
              </span>
            </div>
            <b>
              <LineIcon name="dashboard" /> Resumo
            </b>
            <span>
              <LineIcon name="meal" /> Cardápios
            </span>
            <span>
              <LineIcon name="leaf" /> Alimentos TACO
            </span>
            <span>
              <LineIcon name="users" /> Pacientes
            </span>
            <span>
              <LineIcon name="clipboard" /> Antropometria
            </span>
            <span>
              <LineIcon name="calendar" /> Agenda
            </span>
            <span>
              <LineIcon name="message" /> Diário & Chat
            </span>
            <span>
              <LineIcon name="growth" /> Financeiro
            </span>
          </aside>
          <section>
            <h3>Painel da Nutricionista</h3>
            <div className="np-metrics-preview">
              <div className="np-mock-card">
                <span>
                  <LineIcon name="meal" /> Cardápios ativos
                </span>
                <strong>148</strong>
                <small>publicados no app</small>
              </div>
              <div className="np-mock-card">
                <span>
                  <LineIcon name="users" /> Pacientes ativos
                </span>
                <strong>184</strong>
                <small className="np-trend-up">94% de retenção</small>
              </div>
              <div className="np-mock-card">
                <span>
                  <LineIcon name="message" /> Diário alimentar
                </span>
                <strong>19 fotos</strong>
                <small className="np-trend-up">enviadas hoje</small>
              </div>
              <div className="np-mock-card">
                <span>
                  <LineIcon name="growth" /> Faturamento (mês)
                </span>
                <strong>R$ 18.450</strong>
                <small className="np-trend-up">↑ 22% vs mês anterior</small>
              </div>
            </div>
            <div className="np-charts-grid">
              <div className="np-chart-card np-agenda-mock">
                <div className="np-chart-header">
                  <span>Atendimentos e Retornos de Hoje</span>
                </div>
                <div className="np-agenda-list">
                  <div className="np-agenda-item">
                    <b>08:30</b> <i className="np-avatar a1" />{" "}
                    <div>
                      <strong>Mariana Costa</strong>
                      <small>1ª Consulta · Emagrecimento</small>
                    </div>{" "}
                    <span className="np-status conf">Confirmado</span>
                  </div>
                  <div className="np-agenda-item">
                    <b>10:00</b> <i className="np-avatar a2" />{" "}
                    <div>
                      <strong>Rafael Oliveira</strong>
                      <small>Retorno · Hipertrofia (2.850 kcal)</small>
                    </div>{" "}
                    <span className="np-status conf">Cardápio pronto</span>
                  </div>
                  <div className="np-agenda-item">
                    <b>11:30</b> <i className="np-avatar a3" />{" "}
                    <div>
                      <strong>Camila Nogueira</strong>
                      <small>Bioimpedância & Reeducação</small>
                    </div>{" "}
                    <span className="np-status andamento">Em atendimento</span>
                  </div>
                  <div className="np-agenda-item">
                    <b>14:30</b> <i className="np-avatar a4" />{" "}
                    <div>
                      <strong>Lucas Fernandes</strong>
                      <small>Nutrição Esportiva · Suplementação</small>
                    </div>{" "}
                    <span className="np-status conf">Confirmado</span>
                  </div>
                </div>
                <div className="np-agenda-link">Abrir agenda completa da nutri →</div>
              </div>

              <div className="np-right-mock-col">
                <div className="np-chart-card np-receitas-mock">
                  <div className="np-chart-header">
                    <span>Evolução de Consultas</span>
                    <small>Últimos 30 dias</small>
                  </div>
                  <div className="np-line-chart" />
                </div>
                <div className="np-chart-card np-activities-mock">
                  <div className="np-chart-header">
                    <span>Atualizações dos Pacientes</span>
                  </div>
                  <div className="np-activity-list">
                    <div className="np-activity-item">
                      <i className="np-act-icon user">
                        <LineIcon name="meal" />
                      </i>{" "}
                      <div>
                        <strong>Mariana enviou foto do almoço</strong>
                        <small>há 8 min no Diário Alimentar</small>
                      </div>
                    </div>
                    <div className="np-activity-item">
                      <i className="np-act-icon money">
                        <LineIcon name="leaf" />
                      </i>{" "}
                      <div>
                        <strong>Rafael bateu a meta de 3.000 ml de água</strong>
                        <small>há 25 min no Portal</small>
                      </div>
                    </div>
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
            <small>Olá, Mariana! 🥑</small>
            <p>Seu plano alimentar e metas do dia</p>
          </div>
          <div className="np-phone-cards">
            <div className="np-phone-card">
              <i className="np-pc-icon">
                <LineIcon name="meal" />
              </i>
              <div>
                <b>Meu Cardápio (1.650 kcal)</b>
                <em>6 refeições e lista de substituições</em>
              </div>
              <small>&gt;</small>
            </div>
            <div className="np-phone-card">
              <i className="np-pc-icon">
                <LineIcon name="clipboard" />
              </i>
              <div>
                <b>Diário Alimentar com Foto</b>
                <em>Envie o registro das suas refeições</em>
              </div>
              <small>&gt;</small>
            </div>
            <div className="np-phone-card">
              <i className="np-pc-icon">
                <LineIcon name="leaf" />
              </i>
              <div>
                <b>Meta de Água: 2.400 ml</b>
                <em>Você já bebeu 1.800 ml hoje</em>
              </div>
              <small>&gt;</small>
            </div>
            <div className="np-phone-card">
              <i className="np-pc-icon">
                <LineIcon name="message" />
              </i>
              <div>
                <b>Falar com minha Nutri</b>
                <em>Chat direto e materiais educativos</em>
              </div>
              <small>&gt;</small>
            </div>
          </div>
          <nav className="np-phone-nav">
            <div className="active">
              <LineIcon name="meal" />
              <span>Cardápio</span>
            </div>
            <div>
              <LineIcon name="clipboard" />
              <span>Diário</span>
            </div>
            <div>
              <LineIcon name="leaf" />
              <span>Água</span>
            </div>
            <div>
              <LineIcon name="message" />
              <span>Chat</span>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

function FooterColumn({
  title,
  links
}: {
  title: string;
  links: Array<string | { label: string; href: string }>;
}) {
  return (
    <div className="np-footer-column">
      <h3>{title}</h3>
      {links.map((link) => {
        const label = typeof link === "string" ? link : link.label;
        const href = typeof link === "string" ? `/#${link.toLowerCase()}` : link.href;

        return (
          <a href={href} key={label}>
            {label}
          </a>
        );
      })}
    </div>
  );
}

function ClinOSLogo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="clinosLogoGrad1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#059669" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="clinosLogoGrad2" x1="32" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0284c7" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <path
        d="M12.5 4C12.5 2.89543 13.3954 2 14.5 2H17.5C18.6046 2 19.5 2.89543 19.5 4V28C19.5 29.1046 18.6046 30 17.5 30H14.5C13.3954 30 12.5 29.1046 12.5 28V4Z"
        fill="url(#clinosLogoGrad1)"
      />
      <path
        d="M4 12.5C2.89543 12.5 2 13.3954 2 14.5V17.5C2 18.6046 2.89543 19.5 4 19.5H28C29.1046 19.5 30 18.6046 30 17.5V14.5C30 13.3954 29.1046 12.5 28 12.5H4Z"
        fill="url(#clinosLogoGrad2)"
        fillOpacity="0.9"
      />
      <circle cx="16" cy="16" r="3.5" fill="#ffffff" opacity="0.95" />
    </svg>
  );
}

function LineIcon({ name }: { name: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  const icons: Record<string, ReactNode> = {
    patient: (
      <>
        <rect x="5" y="4" width="14" height="16" rx="2" {...common} />
        <path
          d="M9 20v4h12V8h-2M9 10h6M9 14h4M27 20c0-3-2.3-5-5-5s-5 2-5 5M22 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
          {...common}
        />
      </>
    ),
    meal: (
      <>
        <path d="M7 8v8M11 8v8M9 8v16M20 8c4 3 4 9 0 12v4" {...common} />
        <path d="M23 8v16M5 24h22" {...common} />
      </>
    ),
    calendar: (
      <>
        <rect x="5" y="7" width="22" height="20" rx="3" {...common} />
        <path d="M10 4v6M22 4v6M5 13h22M11 18h2M16 18h2M21 18h2M11 23h2M16 23h2" {...common} />
      </>
    ),
    growth: (
      <>
        <path d="M5 27h22M8 23v-7M15 23V10M22 23V6" {...common} />
        <path d="M7 11l5-5 5 4 8-7" {...common} />
      </>
    ),
    clinic: (
      <>
        <path d="M6 27V10l10-5 10 5v17" {...common} />
        <path d="M11 27v-8h10v8M16 9v6M13 12h6" {...common} />
      </>
    ),
    addPatient: (
      <>
        <path d="M14 17c-4 0-7 2.6-7 6v1h10" {...common} />
        <circle cx="14" cy="10" r="4" {...common} />
        <path d="M22 17v10M17 22h10" {...common} />
      </>
    ),
    clipboard: (
      <>
        <rect x="7" y="6" width="18" height="22" rx="3" {...common} />
        <path d="M12 6c0-2 1.4-3 4-3s4 1 4 3M12 13h8M12 18h8M12 23h5" {...common} />
      </>
    ),
    dashboard: (
      <>
        <rect x="5" y="7" width="22" height="18" rx="3" {...common} />
        <path d="M9 21l4-5 4 3 5-7M10 28h12" {...common} />
      </>
    ),
    message: (
      <>
        <path
          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
          {...common}
        />
        <path d="M8 14h6M8 18h12M8 10h12" {...common} />
      </>
    ),
    leaf: (
      <>
        <path d="M7 17C7 9 13 5 25 4c0 12-5 18-13 18-2 0-3.6-.5-5-1.5Z" {...common} />
        <path d="M10 21c4-7 8-11 14-14" {...common} />
      </>
    ),
    users: (
      <>
        <circle cx="12" cy="11" r="4" {...common} />
        <path d="M5 24c0-4 3-7 7-7s7 3 7 7" {...common} />
        <path d="M22 14a3 3 0 1 0 0-6M21 19c3 .2 5 2.4 5 5" {...common} />
      </>
    ),
    assistant: (
      <>
        <path d="M8 25v-7a8 8 0 0 1 16 0v7" {...common} />
        <path d="M8 20H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2M24 20h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" {...common} />
        <path d="M12 18h8M12 23h5M19 27c0 2-1.5 3-4 3h-2" {...common} />
      </>
    ),
    settings: (
      <>
        <circle cx="16" cy="16" r="3" {...common} />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
          {...common}
        />
      </>
    )
  };

  return (
    <svg className="np-line-icon" viewBox="0 0 32 32" aria-hidden="true">
      {icons[name] ?? icons.leaf}
    </svg>
  );
}
