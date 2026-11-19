import type { Metadata } from "next";
import Link from "next/link";
import { CompanyIdentity } from "@/components/marketing/company-identity";

export const metadata: Metadata = {
  title: "Termos de Uso e DPA | ClinOSTec",
  description:
    "Termos de Uso, Acordo de Processamento de Dados (DPA), Direito de Arrependimento e Créditos Nutricionais da plataforma ClinOSTec.",
  alternates: {
    canonical: "/termos-de-uso"
  }
};

const companyForum = process.env.NEXT_PUBLIC_COMPANY_FORUM?.trim() || "comarca de São Paulo/SP";

const sections = [
  {
    title: "1. Aceitação dos Termos",
    text: [
      "Ao criar uma conta, acessar ou utilizar a plataforma e o aplicativo ClinOSTec — operados por Egert Sistemas e Consultoria em Alimentos LTDA (CNPJ 69.642.291/0001-18) —, você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso e com a nossa Política de Privacidade (LGPD).",
      "Caso não concorde com alguma condição, não utilize a plataforma."
    ]
  },
  {
    title: "2. Natureza do Serviço e Responsabilidade Profissional",
    text: [
      "O ClinOSTec é uma ferramenta tecnológica de apoio à gestão de consultórios, prontuários, planos alimentares, agendamentos e comunicação com pacientes. Não prestamos serviços médicos, nutricionais ou de diagnóstico.",
      "Em conformidade com a Lei Federal nº 8.234/1991 e o Código de Ética do Nutricionista (Resolução CFN nº 599/2018), a prescrição dietética e a elaboração de planos alimentares são atividades privativas de nutricionistas regularmente inscritos no CRN. Toda decisão clínica, prescrição, avaliação antropométrica ou conduta registrada é de responsabilidade exclusiva do profissional assinante."
    ]
  },
  {
    title: "3. Cadastro, Segurança e Perfis de Acesso",
    text: [
      "O usuário deve fornecer informações verdadeiras e mantê-las atualizadas. As credenciais de acesso são pessoais e intransferíveis.",
      "O titular da clínica (OWNER/ADMIN) é responsável pela gestão de permissões da sua equipe (nutricionistas, outros profissionais e secretárias), devendo preservar o sigilo clínico dos pacientes e evitar compartilhamento de senhas."
    ]
  },
  {
    title: "4. Assinatura, Teste Grátis, Cancelamento e Direito de Arrependimento (CDC)",
    text: [
      "Oferecemos período de teste gratuito de 7 (sete) dias sem exigência de cartão de crédito. A continuidade do uso após o teste está condicionada à contratação de um plano de assinatura vigente.",
      "Direito de Arrependimento (Art. 49 do Código de Defesa do Consumidor — Lei nº 8.078/1990): para contratações realizadas online, o contratante pode exercer o direito de arrependimento em até 7 (sete) dias corridos contados da primeira contratação paga, com reembolso integral do valor pago, bastando solicitar pelo painel ou pelo e-mail contato@clinos.tec.br.",
      "Após o prazo legal de 7 dias, o cancelamento pode ser solicitado a qualquer momento sem multas contratuais, mantendo o acesso até o fim do ciclo já pago. Caso haja recorrência ativa no gateway de pagamento (como InfinitePay), nossa equipe garante a interrupção das cobranças futuras mediante solicitação no painel ou pelo suporte oficial."
    ]
  },
  {
    title: "5. Acordo de Processamento de Dados (DPA — LGPD)",
    text: [
      "Para os dados pessoais e sensíveis de saúde de pacientes inseridos na plataforma, a clínica/profissional assinante figura como Controlador e a Egert Sistemas (ClinOSTec) figura como Operador, nos termos da Lei nº 13.709/2018 (LGPD).",
      "Obrigações do Controlador (Clínica/Profissional): garantir base legal adequada para coleta e tratamento dos dados de seus pacientes (incluindo consentimento específico para menores de idade, quando aplicável), atender às requisições dos titulares sobre prontuários e observar a guarda legal mínima de 20 anos (Lei nº 13.787/2018).",
      "Obrigações do Operador (ClinOSTec): tratar dados de pacientes exclusivamente para a prestação dos serviços contratados; manter confidencialidade e medidas técnicas de segurança (criptografia, controle de acesso, logs e isolamento por organização); notificar o Controlador em prazo razoável em caso de incidente de segurança relevante que envolva seus dados; e viabilizar a exportação (portabilidade) ou eliminação/devolução dos dados ao término da relação contratual, respeitadas as retenções legais."
    ]
  },
  {
    title: "6. Bases de Dados Nutricionais e Créditos (Propriedade Intelectual)",
    text: [
      "Todos os direitos sobre o software, design, marcas e código-fonte do ClinOSTec pertencem exclusivamente à Egert Sistemas e Consultoria em Alimentos LTDA, sendo vedada cópia, engenharia reversa ou redistribuição não autorizada.",
      "O catálogo de composição nutricional do ClinOSTec integra tabelas de referência pública e aberta com os devidos créditos: (i) TACO — Tabela Brasileira de Composição de Alimentos (NEPA/Unicamp, 4ª edição); (ii) IBGE / POF — Tabelas de Composição Nutricional dos Alimentos Consumidos no Brasil; (iii) INSA — Base de Dados da Composição de Alimentos, Instituto Nacional de Saúde Doutor Ricardo Jorge, I.P. (BDCA v7.1 - 2026); e (iv) Open Food Facts Brasil, disponibilizado sob licença Open Database License (ODbL).",
      "Os valores nutricionais servem como referência técnica; cabe ao nutricionista conferir rotulagens atualizadas de produtos industrializados e adequar porções à necessidade clínica de cada paciente."
    ]
  },
  {
    title: "7. Disponibilidade e Limitação de Responsabilidade",
    text: [
      "Empregamos boas práticas de engenharia para manter a plataforma disponível continuamente, mas não garantimos operação ininterrupta em caso de manutenções programadas ou falhas de serviços de terceiros (provedores de internet, nuvem ou pagamento).",
      "O ClinOSTec não se responsabiliza por danos decorrentes de mau uso, compartilhamento indevido de senhas, prescrições clínicas inadequadas ou comprometimento dos dispositivos do próprio usuário."
    ]
  },
  {
    title: "8. Alterações, Legislação Aplicável e Foro",
    text: [
      "Estes Termos podem ser atualizados periodicamente. Alterações relevantes serão comunicadas na plataforma ou por e-mail com indicação da nova data de vigência.",
      `Estes Termos são regidos pelas leis da República Federativa do Brasil. Para relações empresariais (B2B), fica eleito o foro da ${companyForum}, ressalvado expressamente o foro do domicílio do consumidor pessoa física quando aplicável o Código de Defesa do Consumidor (Art. 101, I do CDC).`,
      "Dúvidas e solicitações formais: contato@clinos.tec.br."
    ]
  }
];

export default function TermsOfUsePage() {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <Link href="/" className="legal-back">ClinOSTec</Link>
        <span className="eyebrow">Jurídico & DPA</span>
        <h1>Termos de Uso</h1>
        <p>
          Leia atentamente as condições de uso, o acordo de processamento de dados (LGPD), a política de cancelamento
          e os créditos das bases nutricionais do ClinOSTec.
        </p>
        <small>Última atualização: 18 de novembro de 2026 (versão 2026-11-18)</small>
        <CompanyIdentity />
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
      </section>

      <footer className="legal-footer">
        <p>
          Consulte também nossa <Link href="/politica-de-privacidade">Política de Privacidade (LGPD)</Link> e a página
          de <Link href="/exclusao-de-conta">Exclusão de Conta e Dados</Link>.
        </p>
      </footer>
    </main>
  );
}
