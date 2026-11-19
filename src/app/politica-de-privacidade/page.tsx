import type { Metadata } from "next";
import Link from "next/link";
import { CompanyIdentity } from "@/components/marketing/company-identity";

export const metadata: Metadata = {
  title: "Política de Privacidade e LGPD | ClinOSTec",
  description:
    "Política de Privacidade e Proteção de Dados Pessoais (LGPD) da plataforma e aplicativo ClinOSTec.",
  alternates: {
    canonical: "/politica-de-privacidade"
  }
};

const dpoName =
  process.env.NEXT_PUBLIC_DPO_NAME?.trim() ||
  "Encarregado de Privacidade e Proteção de Dados — Egert Sistemas e Consultoria em Alimentos LTDA";
const dpoEmail = process.env.NEXT_PUBLIC_DPO_EMAIL?.trim() || "contato@clinos.tec.br";

const sections = [
  {
    title: "1. Identificação e Papéis no Tratamento (Controlador e Operador)",
    text: [
      "O ClinOSTec é uma plataforma tecnológica voltada a nutricionistas, profissionais de saúde, clínicas e pacientes, operada pela Egert Sistemas e Consultoria em Alimentos LTDA (CNPJ 69.642.291/0001-18).",
      "Para os dados cadastrais, financeiros e de acesso dos profissionais e clínicas assinantes, a Egert Sistemas atua como Controladora (LGPD, Art. 5º, VI).",
      "Para os dados pessoais e dados pessoais sensíveis de saúde dos pacientes inseridos na plataforma (prontuários, anamneses, exames, planos alimentares, evoluções e mensagens), o profissional de saúde ou a clínica assinante atua como Controlador, cabendo ao ClinOSTec a função de Operador (LGPD, Art. 5º, VII), realizando o tratamento estritamente conforme as instruções do Controlador e a legislação vigente."
    ]
  },
  {
    title: "2. Dados Pessoais e Dados Sensíveis Tratados",
    text: [
      "Dados de conta do profissional e equipe: nome completo, e-mail, telefone, senha criptografada (hash PBKDF2-SHA512), registro profissional (CRN/conselho), especialidade, perfil de acesso e dados da clínica/organização (como CPF ou CNPJ).",
      "Dados de pacientes e dados sensíveis de saúde (LGPD, Art. 5º, II): nome, e-mail, telefone, data de nascimento, sexo, medidas antropométricas, anamneses, recordatórios alimentares, planos alimentares, exames laboratoriais, prescrições de suplementos, diário alimentar, hidratação, metas, agenda e mensagens trocadas no portal.",
      "Dados técnicos e registros de auditoria: endereço IP, data e hora de acesso, registros de consentimento, logs de segurança e auditoria (Marco Civil da Internet — Lei nº 12.965/2014).",
      "Dados de pagamento: processados diretamente por provedores de pagamento terceirizados (como InfinitePay); o ClinOSTec não armazena dados completos de cartão de crédito."
    ]
  },
  {
    title: "3. Bases Legais e Finalidades (LGPD, Arts. 7º e 11)",
    text: [
      "Execução de contrato ou procedimentos preliminares (Art. 7º, V): criar contas, autenticar usuários, disponibilizar módulos contratados, Portal do Paciente, agendamento online e suporte técnico.",
      "Tutela da saúde (Art. 7º, VIII e Art. 11, II, 'f'): viabilizar o registro e acompanhamento clínico-nutricional exclusivamente por profissionais de saúde e serviços de saúde habilitados.",
      "Cumprimento de obrigação legal ou regulatória (Art. 7º, II e Art. 11, II, 'a'): preservação de prontuários eletrônicos de saúde (Lei nº 13.787/2018 e normas do CFN), emissão fiscal e guarda de logs de acesso.",
      "Consentimento do titular (Art. 7º, I e Art. 11, I): coleta de consentimento explícito em formulários públicos (como agendamento online) e ativação opcional de cookies analíticos.",
      "Exercício regular de direitos e prevenção à fraude/segurança (Art. 7º, VI e IX): proteção contra acessos não autorizados, controle de taxa de requisições e auditoria."
    ]
  },
  {
    title: "4. Cookies e Tecnologias Analíticas",
    text: [
      "Cookies essenciais: utilizados para autenticação de sessão (HttpOnly, SameSite e Secure), segurança e funcionamento básico do sistema. Não podem ser desativados pois são indispensáveis ao serviço.",
      "Cookies analíticos (Google Analytics): somente são carregados e ativados se você clicar expressamente em 'Aceitar todos' no aviso de cookies. Caso escolha 'Somente essenciais', nenhum script ou evento do Google Analytics será executado.",
      "Você pode limpar ou alterar sua preferência a qualquer momento nas configurações de armazenamento do seu navegador."
    ]
  },
  {
    title: "5. Compartilhamento e Transferência Internacional de Dados",
    text: [
      "Não vendemos, alugamos ou comercializamos dados pessoais ou de saúde sob nenhuma hipótese.",
      "Os dados são compartilhados apenas com suboperadores essenciais à operação da plataforma: infraestrutura de banco de dados (Neon/AWS), hospedagem web (Vercel), armazenamento seguro de arquivos (Cloudflare R2), envio transacional de e-mails (Resend) e processamento de pagamentos (InfinitePay).",
      "Alguns desses provedores operam servidores fora do Brasil (como nos Estados Unidos). A transferência internacional ocorre em conformidade com o Art. 33 da LGPD e a Resolução CD/ANPD nº 19/2024, sob salvaguardas técnicas, criptografia em trânsito (TLS/HTTPS) e compromissos contratuais de proteção de dados."
    ]
  },
  {
    title: "6. Segurança da Informação (LGPD, Art. 46)",
    text: [
      "Adotamos medidas técnicas e administrativas proporcionais à sensibilidade dos dados de saúde, incluindo: criptografia em trânsito (HTTPS/HSTS), hashing forte de senhas (PBKDF2-SHA512 com salt aleatório), isolamento lógico por organização (multi-tenant), controle de acesso baseado em perfil (RBAC — impedindo recepcionistas de acessar prontuários clínicos e restringindo prescrição dietética a nutricionistas conforme a Lei nº 8.234/91), rate limiting, validação de uploads com isolamento por organização e registros de auditoria."
    ]
  },
  {
    title: "7. Retenção, Prontuário Eletrônico e Exclusão",
    text: [
      "Dados cadastrais e de uso são mantidos enquanto a conta estiver ativa ou pelo prazo necessário ao cumprimento de obrigações legais, fiscais e regulatórias.",
      "Prontuários de saúde e registros clínicos estão sujeitos à guarda mínima de 20 (vinte) anos a partir do último registro, conforme a Lei nº 13.787/2018 e normas dos conselhos profissionais de saúde. Cabe ao profissional/clínica (Controlador) observar os prazos legais antes de eliminar prontuários.",
      "Solicitações de exclusão de conta podem ser feitas a qualquer momento pela página pública de exclusão de conta ou por e-mail."
    ]
  },
  {
    title: "8. Direitos dos Titulares (LGPD, Art. 18)",
    text: [
      "Você tem direito a solicitar: (i) confirmação da existência de tratamento; (ii) acesso aos dados; (iii) correção de dados incompletos, inexatos ou desatualizados; (iv) anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos; (v) portabilidade dos dados em formato estruturado (disponível também via exportação JSON no prontuário do paciente); (vi) eliminação dos dados tratados com consentimento; (vii) informação sobre compartilhamentos; (viii) revogação do consentimento; e (ix) peticionamento à Autoridade Nacional de Proteção de Dados (ANPD).",
      "Pacientes atendidos por clínicas assinantes devem direcionar pedidos referentes ao seu prontuário preferencialmente à clínica/profissional responsável (Controlador), podendo também acionar nosso canal de privacidade para apoio no encaminhamento.",
      "Atendemos às solicitações em até 15 (quinze) dias corridos, conforme o Art. 19, II da LGPD."
    ]
  },
  {
    title: "9. Crianças e Adolescentes",
    text: [
      "A plataforma não é destinada ao cadastro autônomo de crianças menores de 13 anos. O tratamento de dados de crianças e adolescentes em contexto clínico deve ser realizado sob responsabilidade do profissional de saúde e mediante consentimento específico e em destaque de ao menos um dos pais ou responsável legal (LGPD, Art. 14)."
    ]
  },
  {
    title: "10. Encarregado pelo Tratamento de Dados (DPO) e Contato",
    text: [
      `Encarregado / Canal de Privacidade (LGPD, Art. 41 e Resoluções CD/ANPD nº 2/2022 e 18/2024): ${dpoName}.`,
      `E-mail dedicado para solicitações de titulares, incidentes e dúvidas de privacidade: ${dpoEmail}.`,
      "Podemos atualizar esta Política periodicamente para refletir evoluções técnicas ou regulatórias. A data da última revisão constará sempre no topo desta página."
    ]
  }
];

export default function PrivacyPolicyPage() {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <Link href="/" className="legal-back">ClinOSTec</Link>
        <span className="eyebrow">Privacidade & LGPD</span>
        <h1>Política de Privacidade do ClinOSTec</h1>
        <p>
          Esta política descreve de forma transparente como o aplicativo e a plataforma ClinOSTec tratam dados
          pessoais, dados sensíveis de saúde, cookies e direitos previstos na LGPD (Lei nº 13.709/2018).
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
        <article>
          <h2>Exclusão de conta e dados do ClinOSTec</h2>
          <p>
            Para solicitar a exclusão da sua conta do ClinOSTec e dos dados associados, acesse a{" "}
            <Link href="/exclusao-de-conta">página oficial de exclusão de conta e dados</Link> ou escreva para{" "}
            <a href={`mailto:${dpoEmail}`}>{dpoEmail}</a>.
          </p>
        </article>
      </section>
    </main>
  );
}
