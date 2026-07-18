import type { Metadata } from "next";
import Link from "next/link";
import { MarketingCta, MarketingFooter, MarketingHeader } from "@/components/marketing/marketing-pages";

export const metadata: Metadata = {
  title: "Recursos para Nutricionistas e Clínicas | ClinOS",
  description: "Conheça os recursos do ClinOS para atendimento nutricional, prontuário, agenda, portal do paciente, financeiro e gestão de clínicas.",
  alternates: {
    canonical: "/recursos"
  },
  openGraph: {
    title: "Recursos do ClinOS",
    description: "Atendimento, nutrição, acompanhamento do paciente e gestão conectados em uma plataforma.",
    url: "/recursos",
    type: "website"
  }
};

const resourceGroups = [
  {
    label: "Atendimento",
    title: "Contexto clínico organizado",
    description: "Recursos para registrar o atendimento e consultar a evolução sem separar a história do paciente.",
    items: [
      "Cadastro e histórico de pacientes",
      "Agenda e status dos atendimentos",
      "Anamneses e evoluções",
      "Avaliação e registros corporais",
      "Exames laboratoriais",
      "Prescrição de suplementos"
    ]
  },
  {
    label: "Nutrição",
    title: "Da avaliação ao plano alimentar",
    description: "Ferramentas especializadas para transformar informações da consulta em uma conduta nutricional organizada.",
    items: [
      "Base de alimentos",
      "Planos alimentares e macronutrientes",
      "Recordatório alimentar 24 horas",
      "Receitas e ingredientes",
      "Cálculo energético",
      "Lista de compras"
    ]
  },
  {
    label: "Acompanhamento",
    title: "Continuidade entre consultas",
    description: "Canais e registros que aproximam profissional e paciente ao longo do acompanhamento.",
    items: [
      "Portal do paciente",
      "Diário alimentar com feedback",
      "Metas e hidratação",
      "Chat com o profissional",
      "Materiais educativos",
      "Planos e informações compartilhadas"
    ]
  },
  {
    label: "Gestão",
    title: "Visibilidade para a operação",
    description: "Controles administrativos para consultórios em crescimento e clínicas com mais de um profissional.",
    items: [
      "Receitas e despesas",
      "KPIs e relatórios",
      "Usuários e funções",
      "Perfil de secretária",
      "Múltiplos profissionais",
      "Registros de auditoria"
    ]
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://clinos.tec.br/recursos#webpage",
  url: "https://clinos.tec.br/recursos",
  name: "Recursos do ClinOS",
  inLanguage: "pt-BR",
  about: { "@id": "https://clinos.tec.br/#software" },
  hasPart: resourceGroups.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "WebPageElement",
      name: item,
      description: group.title
    }))
  )
};

export default function ResourcesPage() {
  return (
    <main className="marketing-page resources-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingHeader />

      <section className="resources-hero">
        <nav className="marketing-breadcrumb" aria-label="Navegação estrutural">
          <Link href="/">ClinOS</Link>
          <span aria-hidden="true">/</span>
          <span>Recursos</span>
        </nav>
        <span className="marketing-eyebrow">Visão completa do produto</span>
        <h1>Recursos que conectam <span>atendimento, acompanhamento e gestão.</span></h1>
        <p>
          Conheça o que o ClinOS organiza em cada etapa. A disponibilidade de alguns
          recursos depende do plano e do perfil de acesso configurado.
        </p>
        <div className="marketing-actions">
          <Link href="/software-para-nutricionistas" className="np-button np-button-primary">
            Solução para nutricionistas
          </Link>
          <Link href="/sistema-para-clinicas" className="np-button np-button-outline">
            Solução para clínicas
          </Link>
        </div>
      </section>

      <section className="resources-directory" aria-label="Diretório de recursos">
        {resourceGroups.map((group, index) => (
          <article key={group.label} id={group.label.toLowerCase()}>
            <header>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <small>{group.label}</small>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
            </header>
            <ul>
              {group.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </section>

      <section className="resources-trust" id="seguranca">
        <div>
          <span className="marketing-eyebrow">Privacidade e controle</span>
          <h2>Segurança descrita com fatos, não com promessas vagas.</h2>
          <p>
            O ClinOS usa autenticação, senhas armazenadas com hash, sessões protegidas,
            controle de acesso e associação dos registros à organização responsável.
            Nenhum sistema é imune a riscos; por isso, processos internos e boas práticas
            da equipe continuam essenciais.
          </p>
        </div>
        <ul>
          <li>Controle de acesso por usuário e organização</li>
          <li>Cookies de sessão HTTP-only e Secure em produção</li>
          <li>Registros de auditoria para eventos da aplicação</li>
          <li>Política pública de privacidade e exclusão de conta</li>
        </ul>
        <Link href="/politica-de-privacidade">Ler a Política de Privacidade <span aria-hidden="true">→</span></Link>
      </section>

      <MarketingCta />
      <MarketingFooter />
    </main>
  );
}
