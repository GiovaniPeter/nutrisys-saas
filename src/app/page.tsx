import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Metadata } from "next";
import { AnalyticsEvent } from "@/components/analytics/analytics-event";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { DashboardLink } from "@/components/auth/dashboard-link";

export const metadata: Metadata = {
  title: "NutriPlan | Software para Nutricionistas — Cardápios em 3 Minutos, Tabela TACO e Portal do Paciente",
  description:
    "Prescreva cardápios calculados em minutos com a Tabela TACO (+1.000 itens com medidas caseiras), substituições em 1 clique, antropometria Pollock/Guedes e PDF com CRN por um preço que cabe no seu consultório. Teste 7 dias grátis.",
  alternates: {
    canonical: "/"
  }
};

const painPoints = [
  {
    icon: "calculator",
    badge: "O pesadelo das substituições",
    title: "Horas perdidas calculando equivalências no meio da consulta",
    text: "Ficar fazendo contas de cabeça ou procurando tabelas para descobrir quantas colheres de arroz equivalem a 130g de batata-doce rouba o tempo que você deveria dedicar a ouvir o paciente."
  },
  {
    icon: "clipboard",
    badge: "Planilhas travadas e feias",
    title: "Entregar PDFs amadores que não transmitem autoridade",
    text: "O paciente não segue o plano porque não entende tabelas cinzas e confusas. Você estudou anos para ter um consultório e não merece ficar dependendo de fórmulas quebradas no Excel."
  },
  {
    icon: "growth",
    badge: "Mensalidades abusivas",
    title: "Pagar mais de R$ 100/mês em softwares complexos e cheios de travas",
    text: "A maioria das ferramentas cobra caro, trava recursos essenciais no plano básico e força você a pagar por dezenas de botões inúteis que você nunca vai usar na rotina real de atendimento."
  }
];

const pillars = [
  {
    num: "01",
    tag: "Prescrição Descomplicada",
    title: "Tabela TACO com Medidas Caseiras de Verdade",
    subtitle: "Chega de paciente mandando mensagem perguntando quanto pesam 120g de frango.",
    text: "Todos os alimentos já vêm convertidos para a linguagem da cozinha brasileira: colher de sopa, concha média, fatia, unidade ou gramas exatos. Além disso, você tem 4 templates prontos (Emagrecimento, Hipertrofia, Reeducação e Low Carb) para clonar e adaptar em segundos.",
    highlights: ["+1.014 alimentos e suplementos em português", "Busca instantânea sem acento", "Gramas exatos ou porções caseiras"],
    icon: "meal"
  },
  {
    num: "02",
    tag: "Velocidade na Consulta",
    title: "Substituições Equivalentes em 1 Clique",
    subtitle: "Varie o cardápio sem ter que refazer as contas de cabeça.",
    text: "Basta clicar em '🔄 Substituições' em qualquer alimento e o NutriPlan sugere instantaneamente opções do mesmo grupo alimentar calculadas na gramagem exata para bater as calorias daquela refeição. O paciente ganha autonomia e você economiza horas de trabalho.",
    highlights: ["Equivalência calórica automática", "Mesmo grupo alimentar", "Sem risco de furar o VET planejado"],
    icon: "leaf"
  },
  {
    num: "03",
    tag: "Ciência Clínica & Esportiva",
    title: "Antropometria Pollock 3/7, Guedes & Cunningham/Tinsley",
    subtitle: "Do emagrecimento à alta performance esportiva em um só painel.",
    text: "Preencha as dobras do adipômetro e o sistema calcula sozinho a densidade, o % de gordura por Siri, a Massa Magra e o RCQ. Para atletas, compare Cunningham, Tinsley, Katch-McArdle e Mifflin lado a lado, com adicional de METs para treinos intensos e divisão de macros em g/kg de peso.",
    highlights: ["Pollock 3 e 7 dobras + Guedes (Brasil)", "Cálculo de Massa Magra e Gorda", "Cunningham & Tinsley para esportistas"],
    icon: "clipboard"
  },
  {
    num: "04",
    tag: "Encantamento & Adesão",
    title: "Prescrição A4 com Registro CRN e Portal Instalável (PWA)",
    subtitle: "Entregue um documento médico de altíssimo padrão e acompanhe no celular.",
    text: "Gere um PDF impecável com seu cabeçalho, logo e registro no CRN (em total conformidade com a Lei Federal nº 8.234/91). Seu paciente ainda pode instalar o Portal do Paciente direto na tela inicial do celular como um aplicativo para ver o cardápio, controlar a meta de água e enviar fotos no diário.",
    highlights: ["PDF de consultório com carimbo CRN", "Portal do Paciente PWA no celular", "Diário alimentar com fotos e hidratação"],
    icon: "message"
  }
];

const comparisonRows = [
  {
    feature: "Preço mensal",
    nutriplan: "A partir de R$ 39,50/mês",
    others: "R$ 89,00 a R$ 149,00/mês",
    sheets: "R$ 0 (Custa seu tempo livre)"
  },
  {
    feature: "Tabela TACO + Suplementos com Medidas Caseiras",
    nutriplan: "✅ +1.000 itens padronizados",
    others: "✅ Presente",
    sheets: "❌ Manual, desatualizada e incompleta"
  },
  {
    feature: "Substituições equivalentes em 1 clique",
    nutriplan: "✅ Automático e calibrado",
    others: "⚠️ Lento ou complexo",
    sheets: "❌ Não tem (calcula de cabeça)"
  },
  {
    feature: "Templates de Cardápios Prontos (Emagrecimento, Hipertrofia...)",
    nutriplan: "✅ 4 modelos completos inclusos",
    others: "⚠️ Bloqueado em planos caros",
    sheets: "❌ Não tem"
  },
  {
    feature: "Fórmulas Esportivas (Cunningham, Tinsley & METs)",
    nutriplan: "✅ Incluso nativamente",
    others: "❌ Apenas Harris/Mifflin básicos",
    sheets: "❌ Exige programação avançada"
  },
  {
    feature: "Antropometria Pollock 3/7, Guedes e Laudo PDF",
    nutriplan: "✅ Completo com % de Gordura e Magra",
    others: "⚠️ Muitas vezes cobrado à parte",
    sheets: "⚠️ Risco alto de fórmulas corrompidas"
  },
  {
    feature: "Portal do Paciente instalável no celular (PWA)",
    nutriplan: "✅ Incluso com diário e fotos",
    others: "✅ Presente",
    sheets: "❌ Não tem (apenas arquivos avulsos)"
  },
  {
    feature: "Exige cartão de crédito para testar?",
    nutriplan: "❌ NÃO exige (7 dias livres)",
    others: "⚠️ Exigem cartão antes do teste",
    sheets: "—"
  }
];

const plans = [
  {
    code: "essential",
    name: "Nutri Essencial",
    price: "R$ 39,50",
    description: "Ideal para recém-formados e quem está estruturando os primeiros atendimentos no consultório.",
    features: [
      "Até 50 pacientes ativos",
      "Planos alimentares ilimitados com Tabela TACO",
      "Medidas caseiras reais em português (colheres, conchas, fatias)",
      "Antropometria Pollock (3/7 dobras) e Guedes",
      "Cálculo energético (6 fórmulas + Cunningham/Tinsley)",
      "Anamneses especializadas e recordatório 24h",
      "Impressão e PDF de alto padrão com carimbo CRN"
    ]
  },
  {
    code: "professional",
    name: "Nutri Pro",
    price: "R$ 74,50",
    highlighted: true,
    badge: "Mais Escolhido pelos Nutris",
    description: "O plano definitivo para consultórios em crescimento que buscam velocidade e fidelização máxima.",
    features: [
      "Pacientes e planos alimentares ILIMITADOS",
      "Gerador de substituições equivalentes em 1 clique",
      "Portal do Paciente instalável no celular (PWA)",
      "Diário alimentar com fotos e avaliação da nutri",
      "Controle de hidratação diária (35 ml/kg) e metas",
      "Receitas calculadas, suplementos e exames",
      "Agenda online pública com link de captação",
      "Controle financeiro do consultório e indicadores"
    ]
  },
  {
    code: "clinic",
    name: "Clínica de Nutrição",
    price: "R$ 124,50",
    description: "Para clínicas com múltiplos profissionais e necessidade de recepção organizada.",
    features: [
      "Tudo do plano Nutri Pro liberado",
      "Até 5 nutricionistas na mesma organização (CRN)",
      "Acesso operacional para Secretária / Recepção",
      "Base unificada de pacientes e histórico compartilhado",
      "Relatórios financeiros consolidados da clínica",
      "Auditoria LGPD e suporte prioritário no WhatsApp"
    ]
  }
];

const faqs = [
  {
    question: "Preciso informar cartão de crédito para testar?",
    answer:
      "Não! Você cria sua conta em menos de 30 segundos informando apenas seu nome e e-mail. Tem 7 dias de acesso completo sem compromisso e sem renovação automática surpresa."
  },
  {
    question: "Já uso outro software ou planilhas no Excel. É difícil migrar para o NutriPlan?",
    answer:
      "É muito simples e intuitivo. O NutriPlan já vem 100% configurado com mais de 1.000 alimentos da Tabela TACO com medidas caseiras, templates prontos e fórmulas científicas. No seu primeiro paciente você já prescreve em menos de 3 minutos."
  },
  {
    question: "A prescrição dietética fica em conformidade com o Conselho (CFN)?",
    answer:
      "Sim, rigorosamente! O NutriPlan respeita a Lei Federal nº 8.234/91. A prescrição de dietas é de uso privativo do nutricionista habilitado com CRN. O sistema gera automaticamente o cabeçalho e rodapé oficial com seu nome, número de registro profissional e termos legais."
  },
  {
    question: "Como meu paciente visualiza o plano alimentar no celular?",
    answer:
      "Assim que você clica em 'Publicar', o paciente recebe um link direto ou pode instalar o Portal do Paciente como aplicativo (PWA) na tela inicial do celular. Ele vê as refeições organizadas por horário, as substituições liberadas, registra a ingestão de água e envia fotos do prato no diário alimentar."
  },
  {
    question: "Como funciona o gerador de substituições equivalentes em 1 clique?",
    answer:
      "Em qualquer alimento adicionado à refeição, basta clicar em 'Substituições'. O algoritmo do NutriPlan busca itens equivalentes da mesma categoria nutricional e ajusta a gramagem exata para manter o mesmo aporte calórico e de macronutrientes do prato."
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer:
      "Sim. Não há fidelidade nem multas. Você pode cancelar sua assinatura com apenas um clique diretamente no painel de configurações a qualquer momento."
  }
];

export default function Home() {
  const trialHref = "/register?perfil=nutricionista";

  return (
    <main className="np-page">
      <AnalyticsEvent name="marketing_landing_view" params={{ landing_name: "home_nutri_vsl" }} />
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
                  "Software completo para nutricionistas com montagem de planos alimentares em minutos, tabela TACO com medidas caseiras, substituições equivalentes em 1 clique, antropometria Pollock/Guedes, fórmulas esportivas e portal do paciente.",
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
                  "Tabela TACO com mais de 1.000 alimentos e medidas caseiras",
                  "Substituições equivalentes em 1 clique",
                  "Antropometria com Pollock 3 e 7 dobras, Guedes e equação de Siri",
                  "Cálculo de TMB e GET com Mifflin, Cunningham, Tinsley e METs",
                  "Prescrição em PDF A4 de alto padrão com carimbo CRN",
                  "Portal do Paciente instalável no celular com diário por fotos e hidratação"
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

      {/* HEADER DE NAVEGAÇÃO */}
      <header className="np-header">
        <Link href="/" className="np-logo" aria-label="ClinOSTec — Software para Nutricionistas">
          <span className="np-logo-mark">
            <ClinOSLogo />
          </span>
          <span>
            <strong>
              ClinOS<span style={{ color: "#059669" }}>Tec</span>
            </strong>
            <small>Software para Nutricionistas</small>
          </span>
        </Link>

        <nav className="np-nav" aria-label="Navegação principal">
          <a href="#diferenciais">Por que o ClinOSTec</a>
          <a href="#pilares">Recursos Clínicos</a>
          <a href="#comparativo">Comparativo</a>
          <a href="#planos">Planos e Preços</a>
          <a href="#faq">Dúvidas</a>
        </nav>

        <div className="np-header-actions">
          <DashboardLink />
          <Link href="/login" className="np-button np-button-outline">
            Entrar
          </Link>
          <TrackedLink
            href={`${trialHref}&source=home-header`}
            className="np-button np-button-primary"
            eventName="cta_click"
            eventParams={{ cta_name: "create_account", cta_location: "home_header" }}
          >
            Testar 7 dias grátis
          </TrackedLink>
        </div>
      </header>

      {/* 1. HERO SECTION (GANCHO FORTE + PROPOSTA ÚNICA DE VALOR) */}
      <section className="np-hero">
        <div className="np-hero-copy">
          <div className="np-hero-brand">
            <span className="np-pill-badge">
              ⚡ O Software Feito para a Rotina Real do Nutricionista
            </span>
          </div>

          <h1>
            Prescreva cardápios calculados em minutos, fidelize pacientes e{" "}
            <span className="np-hero-highlight">recupere o seu tempo livre.</span>
          </h1>

          <p>
            Esqueça as noites perdidas no Excel e as mensalidades abusivas de outros softwares.
            O <strong>ClinOSTec</strong> reúne mais de <strong>5.000 alimentos (Tabela TACO e marcas brasileiras)</strong>,
            substituições em 1 clique, antropometria Pollock/Guedes e PDF com CRN por um valor que cabe no seu consultório.
          </p>

          <div className="np-hero-actions">
            <TrackedLink
              href={`${trialHref}&plan=professional&source=home-hero`}
              className="np-button np-button-primary np-button-large"
              eventName="cta_click"
              eventParams={{ cta_name: "start_free_trial", cta_location: "home_hero", plan_code: "professional" }}
            >
              Começar Teste Grátis de 7 Dias <span aria-hidden="true">→</span>
            </TrackedLink>
            <a
              href="#pilares"
              className="np-button np-button-outline np-button-large"
            >
              Ver Recursos Clínicos 📄
            </a>
          </div>

          <p className="np-hero-trial-note">
            ✓ Sem exigir cartão de crédito &nbsp;·&nbsp; ✓ Cancele quando quiser &nbsp;·&nbsp; ✓ Configurado em 2 minutos
          </p>

          <div className="np-hero-features">
            <div className="np-hero-feature">
              <div className="np-feature-icon icon-green">
                <LineIcon name="meal" />
              </div>
              <span>Base TACO (+5.000 itens)</span>
            </div>
            <div className="np-hero-feature">
              <div className="np-feature-icon icon-blue">
                <LineIcon name="leaf" />
              </div>
              <span>Substituições em 1 Clique</span>
            </div>
            <div className="np-hero-feature">
              <div className="np-feature-icon icon-green">
                <LineIcon name="clipboard" />
              </div>
              <span>Pollock & Cunningham</span>
            </div>
            <div className="np-hero-feature">
              <div className="np-feature-icon icon-blue">
                <LineIcon name="message" />
              </div>
              <span>App do Paciente (PWA)</span>
            </div>
            <div className="np-hero-feature">
              <div className="np-feature-icon icon-purple">
                <LineIcon name="calendar" />
              </div>
              <span>Agenda & Retornos</span>
            </div>
            <div className="np-hero-feature">
              <div className="np-feature-icon icon-green">
                <LineIcon name="growth" />
              </div>
              <span>PDF Oficial c/ CRN</span>
            </div>
          </div>
        </div>

        <ProductMockup />

        <div className="np-hero-badges">
          <div className="np-hero-badge">
            <LineIcon name="meal" />
            <span>Medidas caseiras em português (colher, concha, fatia)</span>
          </div>
          <div className="np-hero-badge">
            <LineIcon name="clipboard" />
            <span>Dobras cutâneas com % Gordura e Massa Magra automáticos</span>
          </div>
          <div className="np-hero-badge">
            <LineIcon name="growth" />
            <span>Planos completos a partir de R$ 39,50/mês</span>
          </div>
          <div className="np-hero-badge">
            <LineIcon name="patient" />
            <span>Conformidade com o CFN e Lei Federal nº 8.234/91</span>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE PROVA & AUTORIDADE CLÍNICA */}
      <section className="np-authority-strip">
        <div className="np-authority-content">
          <div className="np-authority-item">
            <strong>+5.000</strong>
            <span>Alimentos TACO, Marcas e Suplementos</span>
          </div>
          <div className="np-authority-item">
            <strong>3 minutos</strong>
            <span>Tempo médio de montagem do cardápio</span>
          </div>
          <div className="np-authority-item">
            <strong>6 equações</strong>
            <span>TMB e GET Clínicos e Esportivos</span>
          </div>
          <div className="np-authority-item">
            <strong>100% Legal</strong>
            <span>Exclusivo para Nutricionistas (CRN)</span>
          </div>
        </div>
      </section>

      {/* 3. AGITAÇÃO DA DOR: "O CONSULTÓRIO NÃO DEVERIA CUSTAR SUAS NOITES" */}
      <section className="np-section" id="diferenciais">
        <div className="np-section-heading np-center">
          <span>A rotina real do consultório</span>
          <h2>Você ainda perde suas noites de sábado no Excel e no Word?</h2>
          <p style={{ maxWidth: "680px", margin: "14px auto 0", color: "#64748b", fontSize: "1.05rem" }}>
            A faculdade te ensinou a cuidar da saúde das pessoas, mas ninguém te avisou que você passaria
            mais tempo calculando gramas e formatando tabelas do que atendendo.
          </p>
        </div>

        <div className="np-pain-grid">
          {painPoints.map((item) => (
            <article className="np-pain-card" key={item.title}>
              <span className="np-pain-badge">{item.badge}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 4. OS 4 PILARES DO NUTRIPLAN (O QUE FAZ O SISTEMA VENDER) */}
      <section className="np-section np-pillars-section" id="pilares">
        <div className="np-section-heading np-center">
          <span>Como o NutriPlan resolve isso</span>
          <h2>As 4 ferramentas que transformam a velocidade do seu atendimento</h2>
        </div>

        <div className="np-pillars-list">
          {pillars.map((pillar, idx) => (
            <div className={`np-pillar-row ${idx % 2 === 1 ? "reverse" : ""}`} key={pillar.num}>
              <div className="np-pillar-copy">
                <span className="np-pillar-num">{pillar.num} · {pillar.tag}</span>
                <h3>{pillar.title}</h3>
                <h4>{pillar.subtitle}</h4>
                <p>{pillar.text}</p>
                <ul className="np-pillar-highlights">
                  {pillar.highlights.map((h) => (
                    <li key={h}>✓ {h}</li>
                  ))}
                </ul>
              </div>
              <div className="np-pillar-visual">
                <div className="np-pillar-card-mock">
                  <div className="np-pillar-card-header">
                    <LineIcon name={pillar.icon} />
                    <span>Recurso Oficial NutriPlan</span>
                  </div>
                  <div className="np-pillar-card-body">
                    <strong>{pillar.title}</strong>
                    <p>{pillar.subtitle}</p>
                    <div className="np-pillar-badge-box">
                      <span>✓ Pronto para uso imediato</span>
                      <span>✓ Atualizado conforme TACO e CFN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TABELA COMPARATIVA MATADORA */}
      <section className="np-section" id="comparativo">
        <div className="np-section-heading np-center">
          <span>Comparativo transparente</span>
          <h2>Por que os nutricionistas estão migrando para o NutriPlan?</h2>
          <p style={{ maxWidth: "680px", margin: "14px auto 0", color: "#64748b", fontSize: "1.05rem" }}>
            Compare o poder das ferramentas e veja como economizar mais de 50% todos os meses sem abrir mão de nada.
          </p>
        </div>

        <div className="np-table-comparison-wrap">
          <table className="np-comparison-table">
            <thead>
              <tr>
                <th style={{ width: "38%" }}>Funcionalidade</th>
                <th className="highlight-col" style={{ width: "24%" }}>
                  NutriPlan 🚀
                </th>
                <th style={{ width: "20%" }}>Softwares Tradicionais (Dietbox/WebDiet)</th>
                <th style={{ width: "18%" }}>Planilhas Excel</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={i}>
                  <td>
                    <strong>{row.feature}</strong>
                  </td>
                  <td className="highlight-col">
                    <strong>{row.nutriplan}</strong>
                  </td>
                  <td>{row.others}</td>
                  <td>{row.sheets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. PLANOS E PREÇOS TRANSPARENTES */}
      <section className="np-section" id="planos">
        <div className="np-section-heading np-center">
          <span>Planos Justos e Sem Pegadinhas</span>
          <h2>Escolha o plano ideal para a fase do seu consultório</h2>
          <p style={{ maxWidth: "620px", margin: "14px auto 0", color: "#64748b", fontSize: "1.02rem" }}>
            Todos os planos incluem 7 dias de teste grátis sem pedir cartão de crédito. Cancele com 1 clique a qualquer momento.
          </p>
        </div>

        <div className="np-pricing-grid">
          {plans.map((plan) => (
            <article
              className={plan.highlighted ? "np-price-card np-price-featured" : "np-price-card"}
              key={plan.code}
            >
              {plan.highlighted ? <span className="np-popular">{plan.badge}</span> : null}
              <h3>{plan.name}</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", minHeight: "38px", margin: "0 0 16px" }}>
                {plan.description}
              </p>
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
                href={`${trialHref}&plan=${plan.code}&source=home-pricing`}
                className={plan.highlighted ? "np-button np-button-primary" : "np-button np-button-outline"}
                eventName="cta_click"
                eventParams={{ cta_name: "select_plan", cta_location: "home_pricing", plan_code: plan.code }}
              >
                Testar 7 dias grátis →
              </TrackedLink>
            </article>
          ))}
        </div>

        <p className="np-pricing-note">
          7 dias grátis em todos os planos · Sem fidelidade · Cancele quando quiser com 1 clique direto no painel.
        </p>
      </section>

      {/* 7. FAQ QUEBRA-OBJEÇÕES */}
      <section className="np-section" id="faq">
        <div className="np-section-heading np-center">
          <span>Perguntas Frequentes</span>
          <h2>Tudo o que você precisa saber antes de começar</h2>
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

      {/* 8. CTA FINAL DE IMPACTO */}
      <section className="np-final-cta">
        <div className="np-final-photo">
          <Image
            src="/nutritionist-laptop.png"
            alt="Nutricionista prescrevendo cardápio no NutriPlan"
            width={640}
            height={380}
          />
        </div>
        <div className="np-final-copy">
          <h2>Pronto para prescrever cardápios melhores na metade do tempo?</h2>
          <p>
            Junte-se aos nutricionistas que escolheram ter um consultório ágil, moderno e sem mensalidades abusivas.
            Comece agora mesmo com seus pacientes reais.
          </p>
        </div>
        <div className="np-final-action">
          <TrackedLink
            href={`${trialHref}&plan=professional&source=home-final-cta`}
            className="np-button np-button-light np-button-large"
            eventName="cta_click"
            eventParams={{ cta_name: "create_account", cta_location: "home_final_cta", plan_code: "professional" }}
          >
            Criar Conta e Testar 7 Dias Grátis <span aria-hidden="true">→</span>
          </TrackedLink>
          <small>✓ Sem exigência de cartão de crédito &nbsp;|&nbsp; ✓ Acesso imediato</small>
        </div>
      </section>

      {/* RODAPÉ OFICIAL */}
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
            A plataforma completa e acessível de prescrição dietética com Tabela TACO, antropometria Pollock/Guedes,
            fórmulas esportivas e Portal do Paciente.
          </p>
        </div>

        <FooterColumn
          title="Software de Nutrição"
          links={[
            { label: "Recursos Clínicos", href: "/#pilares" },
            { label: "Comparativo de Softwares", href: "/#comparativo" },
            { label: "Montagem de Cardápios", href: "/software-para-montar-cardapio-nutricionista" },
            { label: "Para Nutricionistas", href: "/software-para-nutricionistas" },
            { label: "Planos e Preços", href: "/#planos" }
          ]}
        />
        <FooterColumn
          title="Acesso Rápido"
          links={[
            { label: "Criar Conta Grátis", href: trialHref },
            { label: "Login do Nutricionista", href: "/login" },
            { label: "Portal do Paciente", href: "/portal/login" },
            { label: "Dúvidas Frequentes", href: "/#faq" }
          ]}
        />
        <FooterColumn
          title="Transparência & Legal"
          links={[
            { label: "Termos de uso", href: "/termos-de-uso" },
            { label: "Política de privacidade", href: "/politica-de-privacidade" },
            { label: "Exclusão de conta", href: "/exclusao-de-conta" },
            { label: "Contexto para IA (llms.txt)", href: "/llms.txt" }
          ]}
        />
        <div className="np-footer-column">
          <h3>Atendimento ao Nutri</h3>
          <a href="mailto:contato@clinos.tec.br">contato@clinos.tec.br</a>
          <a href="https://wa.me/5567999824092" target="_blank" rel="noopener noreferrer">
            WhatsApp: (67) 99982-4092
          </a>
        </div>

        <p className="np-copyright">© 2026 NutriPlan. Todos os direitos reservados. Em conformidade com o CFN e LGPD.</p>
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
              <LineIcon name="meal" /> Cardápios TACO
            </span>
            <span>
              <LineIcon name="leaf" /> +1.000 Alimentos
            </span>
            <span>
              <LineIcon name="users" /> Pacientes
            </span>
            <span>
              <LineIcon name="clipboard" /> Pollock & Dobras
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
            <h3>Painel da Nutricionista (CRN)</h3>
            <div className="np-metrics-preview">
              <div className="np-mock-card">
                <span>
                  <LineIcon name="meal" /> Cardápios ativos
                </span>
                <strong>148</strong>
                <small>com medidas caseiras</small>
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
    calculator: (
      <>
        <rect x="5" y="4" width="22" height="24" rx="3" {...common} />
        <line x1="9" y1="9" x2="23" y2="9" {...common} />
        <line x1="9" y1="14" x2="13" y2="14" {...common} />
        <line x1="19" y1="14" x2="23" y2="14" {...common} />
        <line x1="9" y1="19" x2="13" y2="19" {...common} />
        <line x1="19" y1="19" x2="23" y2="19" {...common} />
        <line x1="9" y1="24" x2="13" y2="24" {...common} />
        <line x1="19" y1="24" x2="23" y2="24" {...common} />
      </>
    ),
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
    )
  };

  return (
    <svg className="np-line-icon" viewBox="0 0 32 32" aria-hidden="true">
      {icons[name] ?? icons.leaf}
    </svg>
  );
}
