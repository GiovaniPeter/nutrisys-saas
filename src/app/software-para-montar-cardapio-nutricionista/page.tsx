import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsEvent } from "@/components/analytics/analytics-event";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/marketing-pages";

const SITE_URL = "https://clinos.tec.br";
const PAGE_PATH = "/software-para-montar-cardapio-nutricionista";

export const metadata: Metadata = {
  title: "Software para Montar Cardápio Nutricional | ClinOS",
  description:
    "Monte cardápios e planos alimentares com refeições, porções, base TACO, metas e cálculo automático de calorias e macronutrientes.",
  alternates: {
    canonical: PAGE_PATH
  },
  openGraph: {
    title: "Software para montar cardápio nutricional — ClinOS",
    description:
      "Organize refeições, calcule calorias e macros e entregue o plano alimentar em PDF ou pelo portal do paciente.",
    url: PAGE_PATH,
    type: "website"
  }
};

const benefits = [
  {
    label: "Organização",
    title: "Refeições, horários e porções em um único editor",
    text: "Estruture o dia alimentar do paciente, nomeie cada refeição e registre quantidades e orientações sem depender de planilhas separadas."
  },
  {
    label: "Cálculo",
    title: "Calorias e macronutrientes atualizados automaticamente",
    text: "Ao adicionar os alimentos e ajustar quantidades, o ClinOS soma calorias, proteínas, carboidratos e gorduras do plano."
  },
  {
    label: "Referência",
    title: "Base TACO e alimentos cadastrados por você",
    text: "Pesquise alimentos da base disponível e complemente o atendimento com alimentos e preparações próprias do consultório."
  },
  {
    label: "Metas",
    title: "Compare o planejado com o total do cardápio",
    text: "Defina metas de energia e macronutrientes para manter os totais visíveis durante a construção do plano alimentar."
  },
  {
    label: "Entrega",
    title: "Material pronto para imprimir ou salvar em PDF",
    text: "Gere uma versão organizada com refeições, porções, macros e orientações para entregar ao paciente."
  },
  {
    label: "Acompanhamento",
    title: "Publique o plano no portal do paciente",
    text: "Compartilhe o plano alimentar no acesso individual do paciente e mantenha a informação conectada ao histórico clínico."
  }
];

const steps = [
  {
    title: "Selecione o paciente",
    text: "Vincule o cardápio ao cadastro e mantenha todo o histórico organizado."
  },
  {
    title: "Defina refeições e metas",
    text: "Informe horários, objetivo energético e distribuição desejada de macros."
  },
  {
    title: "Adicione alimentos e porções",
    text: "Pesquise na base, escolha quantidades e acompanhe os totais calculados."
  },
  {
    title: "Revise e compartilhe",
    text: "Inclua orientações e entregue por impressão, PDF ou portal do paciente."
  }
];

const faqs = [
  {
    question: "O ClinOS gera o cardápio sozinho?",
    answer:
      "Não. O nutricionista monta e revisa o plano alimentar. O ClinOS organiza refeições e porções e calcula automaticamente calorias e macronutrientes a partir dos itens selecionados."
  },
  {
    question: "A plataforma possui uma base de alimentos?",
    answer:
      "Sim. O editor utiliza a base de alimentos disponível no ClinOS, incluindo dados TACO, e também permite trabalhar com alimentos cadastrados pelo consultório."
  },
  {
    question: "Consigo definir metas de calorias e macronutrientes?",
    answer:
      "Sim. É possível registrar metas de calorias, proteínas, carboidratos e gorduras e comparar esses valores com os totais calculados do plano."
  },
  {
    question: "Posso entregar o cardápio em PDF?",
    answer:
      "Sim. A visualização do plano é preparada para impressão e pode ser salva como PDF pelo navegador, com refeições, porções, macros e orientações."
  },
  {
    question: "O paciente consegue ver o plano pelo celular?",
    answer:
      "Nos planos que incluem o portal, o nutricionista pode publicar o plano no acesso do paciente, que funciona pela web em computador ou celular."
  },
  {
    question: "O sistema substitui a avaliação do nutricionista?",
    answer:
      "Não. O ClinOS é uma ferramenta de organização e cálculo. A avaliação, a prescrição e a revisão do plano permanecem sob responsabilidade do profissional habilitado."
  }
];

export default function MealPlanSoftwarePage() {
  const pageUrl = `${SITE_URL}${PAGE_PATH}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Software para montar cardápio nutricional",
        description:
          "Página do ClinOS sobre montagem de cardápios e planos alimentares para nutricionistas.",
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
            name: "Software para nutricionistas",
            item: `${SITE_URL}/software-para-nutricionistas`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Montagem de cardápios",
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
    <main className="marketing-page meal-plan-marketing-page">
      <AnalyticsEvent name="marketing_landing_view" params={{ landing_name: "meal_plan_builder" }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingHeader />

      <section className="meal-plan-hero">
        <div className="meal-plan-hero-copy">
          <nav className="marketing-breadcrumb" aria-label="Navegação estrutural">
            <Link href="/">ClinOS</Link>
            <span aria-hidden="true">/</span>
            <Link href="/software-para-nutricionistas">Nutricionistas</Link>
            <span aria-hidden="true">/</span>
            <span>Cardápios</span>
          </nav>
          <span className="marketing-eyebrow">Software de cardápio para nutricionistas</span>
          <h1>
            Monte cardápios personalizados com{" "}
            <span>cálculos nutricionais automáticos.</span>
          </h1>
          <p>
            Organize refeições, alimentos e porções enquanto o ClinOS calcula
            calorias e macronutrientes. Depois, entregue o plano em PDF ou
            publique no portal do paciente.
          </p>
          <div className="marketing-actions">
            <TrackedLink
              href="/register?perfil=nutricionista&plan=professional&source=meal-plan-hero"
              className="np-button np-button-primary np-button-large"
              eventName="cta_click"
              eventParams={{
                cta_name: "create_first_meal_plan",
                cta_location: "meal_plan_hero",
                plan_code: "professional"
              }}
            >
              Criar meu primeiro plano <span aria-hidden="true">→</span>
            </TrackedLink>
            <TrackedLink
              href="#como-funciona"
              className="np-button np-button-outline np-button-large"
              eventName="cta_click"
              eventParams={{ cta_name: "see_how_it_works", cta_location: "meal_plan_hero" }}
            >
              Ver como funciona
            </TrackedLink>
          </div>
          <div className="marketing-proof" aria-label="Condições e recursos">
            <span>7 dias grátis</span>
            <span>Sem cartão</span>
            <span>Base TACO</span>
            <span>PDF e portal do paciente</span>
          </div>
        </div>

        <MealPlanPreview />
      </section>

      <section className="meal-plan-outcome-strip" aria-label="Benefícios da montagem de cardápios">
        <article>
          <strong>Menos retrabalho</strong>
          <span>Paciente, avaliação e plano no mesmo histórico</span>
        </article>
        <article>
          <strong>Cálculo contínuo</strong>
          <span>Totais atualizados ao ajustar as porções</span>
        </article>
        <article>
          <strong>Entrega organizada</strong>
          <span>PDF ou publicação no portal do paciente</span>
        </article>
      </section>

      <section className="marketing-section" id="como-funciona">
        <div className="marketing-section-heading">
          <span>Do atendimento à entrega</span>
          <h2>Um fluxo claro para montar o plano alimentar</h2>
          <p>
            O ClinOS apoia o trabalho do nutricionista sem substituir sua
            avaliação: você escolhe a conduta e o sistema mantém cálculos,
            registros e entrega organizados.
          </p>
        </div>
        <ol className="marketing-steps meal-plan-steps">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span>{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="marketing-section meal-plan-feature-section">
        <div className="marketing-section-heading">
          <span>Recursos do editor</span>
          <h2>Do primeiro alimento ao plano compartilhado</h2>
          <p>
            Cada recurso foi descrito de acordo com o fluxo disponível hoje no
            ClinOS, sem promessas de prescrição automática.
          </p>
        </div>
        <div className="marketing-card-grid">
          {benefits.map((benefit, index) => (
            <article className="marketing-card meal-plan-feature-card" key={benefit.title}>
              <span className="marketing-card-index">{String(index + 1).padStart(2, "0")}</span>
              <small>{benefit.label}</small>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="meal-plan-detail-showcase">
        <div className="meal-plan-detail-copy">
          <span className="marketing-eyebrow">Metas e totais visíveis</span>
          <h2>Confira o equilíbrio do plano enquanto monta</h2>
          <p>
            Defina as metas do atendimento e acompanhe os totais calculados. A
            visualização reúne energia e macronutrientes para facilitar a revisão
            antes de compartilhar o material.
          </p>
          <ul>
            <li>Meta energética e metas de macronutrientes</li>
            <li>Totais gerais e valores por refeição</li>
            <li>Observações gerais e notas por alimento</li>
            <li>Versão preparada para impressão e PDF</li>
          </ul>
        </div>
        <MacroComparison />
      </section>

      <section className="marketing-section">
        <div className="marketing-section-heading">
          <span>Uma escolha prática</span>
          <h2>Troque controles espalhados por uma jornada conectada</h2>
        </div>
        <div className="meal-plan-comparison" role="table" aria-label="Comparação entre controles separados e ClinOS">
          <div className="meal-plan-comparison-heading" role="row">
            <strong role="columnheader">Controles separados</strong>
            <strong role="columnheader">Com o ClinOS</strong>
          </div>
          {[
            ["Cadastro em uma ferramenta e cardápio em outra", "Paciente e plano ligados ao mesmo histórico"],
            ["Somas e ajustes manuais em planilhas", "Calorias e macros recalculados pelas quantidades"],
            ["Arquivos diferentes a cada atualização", "Plano centralizado e pronto para nova impressão"],
            ["Envio disperso por mensagens e anexos", "Publicação no portal individual do paciente"]
          ].map(([before, after]) => (
            <div className="meal-plan-comparison-row" role="row" key={before}>
              <span role="cell">{before}</span>
              <span role="cell">{after}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-section-heading">
          <span>Respostas transparentes</span>
          <h2>Dúvidas sobre a montagem de cardápios</h2>
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

      <section className="marketing-cta meal-plan-final-cta">
        <div>
          <span>Teste o fluxo completo</span>
          <h2>Monte, revise e compartilhe seu próximo plano no ClinOS.</h2>
          <p>7 dias grátis, sem cartão. A decisão nutricional continua sendo sua.</p>
        </div>
        <TrackedLink
          href="/register?perfil=nutricionista&plan=professional&source=meal-plan-final-cta"
          className="np-button np-button-light np-button-large"
          eventName="cta_click"
          eventParams={{
            cta_name: "start_free_trial",
            cta_location: "meal_plan_final_cta",
            plan_code: "professional"
          }}
        >
          Começar agora <span aria-hidden="true">→</span>
        </TrackedLink>
      </section>

      <MarketingFooter />
    </main>
  );
}

function MealPlanPreview() {
  return (
    <aside className="meal-plan-preview" aria-label="Exemplo ilustrativo do editor de plano alimentar">
      <div className="meal-plan-preview-bar">
        <div>
          <span className="meal-plan-preview-dot" />
          <span className="meal-plan-preview-dot" />
          <span className="meal-plan-preview-dot" />
        </div>
        <small>Plano alimentar · exemplo ilustrativo</small>
      </div>
      <div className="meal-plan-preview-heading">
        <div>
          <span>Paciente</span>
          <strong>Mariana Costa</strong>
        </div>
        <span className="meal-plan-preview-status">Rascunho</span>
      </div>
      <div className="meal-plan-preview-targets">
        <span><small>Meta</small><strong>1.800 kcal</strong></span>
        <span><small>Proteína</small><strong>120 g</strong></span>
        <span><small>Carbo</small><strong>210 g</strong></span>
        <span><small>Gordura</small><strong>55 g</strong></span>
      </div>
      <div className="meal-plan-preview-meals">
        <PreviewMeal
          time="07:30"
          name="Café da manhã"
          calories="420 kcal"
          items={["Banana prata · 1 unidade", "Aveia em flocos · 2 colheres", "Iogurte natural · 1 pote"]}
        />
        <PreviewMeal
          time="12:30"
          name="Almoço"
          calories="635 kcal"
          items={["Arroz integral · 4 colheres", "Feijão carioca · 1 concha", "Peito de frango · 1 filé"]}
        />
        <PreviewMeal
          time="16:00"
          name="Lanche"
          calories="285 kcal"
          items={["Pão integral · 2 fatias", "Queijo minas · 1 fatia"]}
        />
      </div>
      <div className="meal-plan-preview-total">
        <div>
          <span>Total parcial</span>
          <strong>1.340 kcal</strong>
        </div>
        <div className="meal-plan-preview-progress"><span /></div>
        <small>Os valores mudam conforme alimentos e porções selecionados.</small>
      </div>
    </aside>
  );
}

function PreviewMeal({
  time,
  name,
  calories,
  items
}: {
  time: string;
  name: string;
  calories: string;
  items: string[];
}) {
  return (
    <article>
      <header>
        <span>{time}</span>
        <strong>{name}</strong>
        <small>{calories}</small>
      </header>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}

function MacroComparison() {
  const macros = [
    { name: "Calorias", current: "1.765", target: "1.800 kcal", percentage: 98 },
    { name: "Proteínas", current: "116", target: "120 g", percentage: 97 },
    { name: "Carboidratos", current: "204", target: "210 g", percentage: 97 },
    { name: "Gorduras", current: "52", target: "55 g", percentage: 95 }
  ];

  return (
    <div className="meal-plan-macro-card" aria-label="Exemplo de comparação entre totais e metas">
      <header>
        <div>
          <span>Resumo nutricional</span>
          <strong>Totais do plano</strong>
        </div>
        <small>Exemplo ilustrativo</small>
      </header>
      <div className="meal-plan-macro-list">
        {macros.map((macro) => (
          <div key={macro.name}>
            <div>
              <span>{macro.name}</span>
              <strong>{macro.current} <small>/ {macro.target}</small></strong>
            </div>
            <div className="meal-plan-macro-track">
              <span style={{ width: `${macro.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
      <footer>
        <span>✓ Pronto para revisão</span>
        <span>Imprimir / PDF</span>
      </footer>
    </div>
  );
}
