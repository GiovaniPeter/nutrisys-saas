import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MarketingHeader, MarketingFooter } from "@/components/marketing/marketing-pages";

export const revalidate = 86400; // Cache por 24 horas

export const metadata: Metadata = {
  title: "Tabela TACO Online com Medidas Caseiras — Consulta Completa de Alimentos | NutriPlan",
  description:
    "Consulte a Tabela Brasileira de Composição de Alimentos (TACO 4ª Edição Unicamp) e tabela de macronutrientes com medidas caseiras em colheres, fatias, conchas e gramas exatos.",
  keywords: [
    "tabela taco online",
    "tabela taco unicamp completa",
    "tabela de composicao de alimentos medidas caseiras",
    "tabela de calorias e proteinas alimentos",
    "taco nutricao consulta",
    "software nutricionista tabela taco",
    "equivalencia alimentar medidas caseiras"
  ],
  alternates: {
    canonical: "/tabela-taco"
  },
  openGraph: {
    title: "Tabela TACO Online com Medidas Caseiras | NutriPlan",
    description:
      "Pesquise calorias, proteínas, carboidratos, lipídios e fibras de milhares de alimentos da TACO e culinária brasileira com porções caseiras reais.",
    url: "/tabela-taco",
    type: "website"
  }
};

export default async function TabelaTacoPage() {
  const [totalFoods, sampleFoods] = await Promise.all([
    prisma.food.count({ where: { organizationId: null } }),
    prisma.food.findMany({
      where: { organizationId: null },
      orderBy: [{ name: "asc" }],
      take: 60,
      select: {
        id: true,
        name: true,
        portion: true,
        householdMeasure: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
        fiber: true,
        category: true,
        source: true
      }
    })
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://clinos.tec.br/tabela-taco#webpage",
        url: "https://clinos.tec.br/tabela-taco",
        name: "Tabela TACO Online — Consulta com Medidas Caseiras",
        inLanguage: "pt-BR",
        description:
          "Consulte calorias e macronutrientes da Tabela TACO e base brasileira com medidas caseiras.",
        isPartOf: { "@id": "https://clinos.tec.br/#website" }
      },
      {
        "@type": "Dataset",
        name: "Tabela Brasileira de Composição de Alimentos com Medidas Caseiras",
        description:
          "Base de dados nutricionais com valores de energia, proteínas, carboidratos, lipídios e fibras, enriquecida com porções e medidas caseiras da culinária brasileira.",
        creator: {
          "@type": "Organization",
          name: "NutriPlan / ClinOS"
        },
        license: "https://creativecommons.org/licenses/by/4.0/",
        variableMeasured: ["Energia (kcal)", "Proteínas (g)", "Carboidratos (g)", "Lipídios (g)", "Fibras (g)"]
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "O que é a Tabela TACO?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A Tabela Brasileira de Composição de Alimentos (TACO) foi desenvolvida pelo NEPA/Unicamp com apoio do Ministério da Saúde. É a principal referência científica brasileira para composição centesimal de alimentos."
            }
          },
          {
            "@type": "Question",
            name: "Por que usar medidas caseiras nos planos alimentares?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A maioria dos pacientes não pesa todos os alimentos em balança no dia a dia. Traduzir gramas para colheres de sopa, conchas, xícaras e fatias aumenta em mais de 70% a adesão ao tratamento nutricional."
            }
          },
          {
            "@type": "Question",
            name: "Como o NutriPlan ajuda na montagem do cardápio?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "O NutriPlan integra todo o catálogo da TACO diretamente no cálculo da dieta. Você clica em 'Substituições' e o sistema sugere opções equivalentes da mesma categoria calórica em 1 clique."
            }
          }
        ]
      }
    ]
  };

  return (
    <main className="marketing-page taco-seo-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingHeader />

      <section className="marketing-hero" style={{ textAlign: "center", padding: "64px 20px 40px" }}>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <span className="badge-pill" style={{ background: "#ecfdf5", color: "#065f46", padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
            Base Oficial TACO 4ª Edição + Medidas Caseiras
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#0f172a", marginTop: 20, lineHeight: 1.2 }}>
            Tabela TACO Online com Medidas Caseiras
          </h1>
          <p style={{ fontSize: "1.15rem", color: "#475569", marginTop: 16, lineHeight: 1.6 }}>
            Consulte calorias, proteínas, carboidratos, gorduras e fibras em mais de <strong>{totalFoods.toLocaleString("pt-BR")} alimentos</strong> com porções em colheres, conchas, fatias e gramas.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            <Link
              href="/register?perfil=nutricionista"
              className="btn btn-primary"
              style={{ background: "#059669", color: "#fff", padding: "14px 28px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}
            >
              Testar Prescrição no NutriPlan Grátis
            </Link>
            <Link
              href="/software-para-montar-cardapio-nutricionista"
              className="btn btn-secondary"
              style={{ border: "1px solid #cbd5e1", color: "#334155", padding: "14px 24px", borderRadius: 10, fontWeight: 600, textDecoration: "none" }}
            >
              Como montar cardápios em 3 minutos →
            </Link>
          </div>
        </div>
      </section>

      {/* Grid de Amostra da Tabela */}
      <section style={{ maxWidth: 1140, margin: "0 auto 60px", padding: "0 20px" }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
              Catálogo Nutricional em Destaque (Amostra da Base)
            </h2>
            <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
              Total de <strong>{totalFoods.toLocaleString("pt-BR")}</strong> itens cadastrados
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", background: "#f8fafc", color: "#475569" }}>
                  <th style={{ padding: "12px 14px" }}>Alimento</th>
                  <th style={{ padding: "12px 14px" }}>Medida Caseira Sugerida</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Kcal</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Proteína</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Carbo</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Gordura</th>
                  <th style={{ padding: "12px 14px" }}>Categoria</th>
                </tr>
              </thead>
              <tbody>
                {sampleFoods.map((food) => (
                  <tr key={food.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#0f172a" }}>{food.name}</td>
                    <td style={{ padding: "12px 14px", color: "#059669" }}>{food.householdMeasure || "1 porção (100 g)"}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600 }}>{Number(food.calories).toFixed(0)} kcal</td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>{Number(food.protein).toFixed(1)}g</td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>{Number(food.carbs).toFixed(1)}g</td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>{Number(food.fat).toFixed(1)}g</td>
                    <td style={{ padding: "12px 14px", color: "#64748b", fontSize: "0.85rem" }}>{food.category || "Geral"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: "center", marginTop: 24, padding: "18px", background: "#f8fafc", borderRadius: 12 }}>
            <p style={{ margin: "0 0 12px", color: "#334155", fontWeight: 600 }}>
              Quer buscar qualquer alimento com cálculo instantâneo de macronutrientes na sua consulta?
            </p>
            <Link
              href="/register?perfil=nutricionista"
              style={{ background: "#059669", color: "#fff", padding: "10px 20px", borderRadius: 8, fontWeight: 700, textDecoration: "none", display: "inline-block" }}
            >
              Criar Conta Gratuita e Acessar Catálogo Completo
            </Link>
          </div>
        </div>
      </section>

      {/* Seção Educativa de SEO */}
      <section style={{ maxWidth: 900, margin: "0 auto 80px", padding: "0 20px" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>
          Como a Tabela TACO revoluciona o atendimento nutricional
        </h2>
        <div style={{ display: "grid", gap: 24, color: "#334155", lineHeight: 1.7, fontSize: "1.05rem" }}>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
              1. Precisão científica adaptada aos hábitos alimentares do Brasil
            </h3>
            <p>
              Muitos softwares utilizam bases americanas (USDA) traduzidas literalmente, onde cortes de carne, preparações de arroz e feijão não refletem a absorção e o teor calórico da mesa brasileira. A Tabela TACO (Tabela Brasileira de Composição de Alimentos) foi elaborada com metodologia analítica estrita pela Unicamp, garantindo que o seu plano alimentar reflita a realidade fisiológica do paciente.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
              2. Medidas Caseiras: a chave para o paciente não desistir da dieta
            </h3>
            <p>
              Exigir que um paciente pese 80 gramas de feijão, 110 gramas de arroz ou 25 gramas de queijo branco todos os dias gera fricção e desistência precoce. No NutriPlan, todos os alimentos contam com conversões padronizadas em colheres de sopa cheias, conchas médias, xícaras de chá e fatias de espessura média.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
              3. Substituições equivalentes em 1 clique durante a consulta
            </h3>
            <p>
              Quando o paciente relata aversão a um alimento ou deseja variar as opções do dia a dia, o nutricionista não precisa recalcular os macronutrientes manualmente. O algoritmo do NutriPlan identifica o grupo nutricional e equilibra as porções para manter as mesmas calorias e proporção de carboidratos, proteínas e lipídios.
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
