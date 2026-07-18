import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade | ClinOS",
  description: "Política de Privacidade do ClinOS.",
  alternates: {
    canonical: "/politica-de-privacidade"
  }
};

const sections = [
  {
    title: "1. Quem somos",
    text: [
      "O ClinOS é uma plataforma para nutricionistas, clínicas e pacientes, voltada à organização de atendimentos, prontuários, planos alimentares, receitas, agenda, comunicação e acompanhamento nutricional.",
      "Esta Politica de Privacidade explica quais dados podem ser tratados, para quais finalidades e quais direitos os usuarios possuem."
    ]
  },
  {
    title: "2. Dados que podemos coletar",
    text: [
      "Dados de conta: nome, e-mail, telefone, hash da senha, perfil de acesso, organização ou clínica vinculada.",
      "Dados profissionais e de atendimento: dados de pacientes cadastrados, anamneses, medidas corporais, exames, recordatorios, planos alimentares, receitas, metas, hidratacao, suplementos, agenda, mensagens e materiais enviados.",
      "Dados de uso e seguranca: registros de acesso, identificadores tecnicos, data e horario de uso, informacoes necessarias para autenticar sessoes, prevenir fraude e manter o funcionamento do app.",
      "Dados de pagamento e assinatura podem ser tratados por provedores de pagamento, quando usados para contratar planos ou gerenciar cobrancas."
    ]
  },
  {
    title: "3. Como usamos os dados",
    text: [
      "Usamos os dados para entregar as funcionalidades contratadas, permitir login, organizar pacientes e atendimentos, gerar planos e relatorios, manter historico clinico/nutricional e facilitar a comunicacao entre profissional e paciente.",
      "Tambem usamos dados para suporte, seguranca, melhoria do produto, cumprimento de obrigacoes legais e administracao de assinaturas."
    ]
  },
  {
    title: "4. Compartilhamento",
    text: [
      "Nao vendemos dados pessoais.",
      "Podemos compartilhar dados somente quando necessario com provedores de infraestrutura, banco de dados, hospedagem, e-mail, armazenamento, pagamentos, suporte tecnico e ferramentas essenciais ao funcionamento da plataforma.",
      "Tambem poderemos compartilhar dados quando exigido por lei, ordem judicial ou autoridade competente."
    ]
  },
  {
    title: "5. Dados de saude e informacoes sensiveis",
    text: [
      "O ClinOS pode tratar dados relacionados à saúde, nutrição, composição corporal, exames e acompanhamento alimentar. Esses dados são usados para permitir que profissionais e pacientes acompanhem o tratamento nutricional e as informações registradas na plataforma.",
      "O uso desses dados deve respeitar a legislacao aplicavel, incluindo a Lei Geral de Protecao de Dados Pessoais (LGPD)."
    ]
  },
  {
    title: "6. Seguranca",
    text: [
      "Adotamos medidas técnicas e organizacionais para proteger os dados, incluindo controle de acesso, autenticação, armazenamento de senhas com hash e separação de dados por organização.",
      "Apesar dos esforcos de seguranca, nenhum sistema e totalmente imune a riscos. Por isso, os usuarios devem proteger suas credenciais e evitar compartilhar senhas."
    ]
  },
  {
    title: "7. Retencao e exclusao",
    text: [
      "Mantemos os dados pelo tempo necessario para prestar o servico, cumprir obrigacoes legais, resolver disputas, preservar seguranca e manter historicos essenciais ao atendimento.",
      "Usuarios podem solicitar acesso, correcao, exportacao ou exclusao de dados pelo contato informado nesta politica ou pela pagina publica de exclusao de conta. Algumas informacoes podem ser mantidas quando houver obrigacao legal ou necessidade legitima de preservacao."
    ]
  },
  {
    title: "8. Criancas e adolescentes",
    text: [
      "O app nao e direcionado a criancas menores de 13 anos. Quando houver dados de pacientes menores de idade, eles devem ser informados por responsavel legal ou por profissional autorizado, conforme a legislacao aplicavel."
    ]
  },
  {
    title: "9. Alteracoes nesta politica",
    text: [
      "Podemos atualizar esta Politica de Privacidade para refletir mudancas no produto, exigencias legais ou melhorias de seguranca. A data de atualizacao sera indicada nesta pagina."
    ]
  },
  {
    title: "10. Contato",
    text: [
      "Para dúvidas, solicitações de privacidade ou pedidos relacionados a dados pessoais, entre em contato pelo e-mail: contato@clinos.tec.br."
    ]
  }
];

export default function PrivacyPolicyPage() {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <Link href="/" className="legal-back">ClinOS</Link>
        <span className="eyebrow">Privacidade</span>
        <h1>Politica de Privacidade</h1>
        <p>
          Esta política descreve como o ClinOS trata dados pessoais,
          dados de saúde e informações usadas para operar a plataforma.
        </p>
        <small>Última atualização: 18 de julho de 2026</small>
      </section>

      <section className="legal-content">
        {sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            {section.text.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
        <article>
          <h2>Exclusao de conta</h2>
          <p>
            Para solicitar a exclusao da sua conta e dos dados associados ao app,
            acesse <Link href="/exclusao-de-conta">a pagina de exclusao de conta</Link>.
          </p>
        </article>
      </section>
    </main>
  );
}
