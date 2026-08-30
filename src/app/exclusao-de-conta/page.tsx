import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Exclusão de Conta e Dados | ClinOS",
  description: "Solicite a exclusão da sua conta do aplicativo ClinOS e dos dados associados.",
  alternates: {
    canonical: "/exclusao-de-conta"
  }
};

const requestEmail = "contato@clinos.tec.br";
const mailSubject = "Solicitação de exclusão de conta e dados - ClinOS";
const mailBody = [
  "Olá, equipe ClinOS.",
  "",
  "Solicito a exclusão da minha conta e dos dados associados ao aplicativo ClinOS.",
  "",
  "Nome completo:",
  "E-mail da conta:",
  "Tipo de acesso: Profissional ou Paciente",
  "Telefone, se cadastrado:",
  "",
  "Confirmo que entendo que a exclusao pode remover meu acesso ao app e aos dados associados."
].join("\n");

const deletionMailTo = `mailto:${requestEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

export default function AccountDeletionPage() {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <Link href="/" className="legal-back">ClinOS</Link>
        <span className="eyebrow">Dados e conta</span>
        <h1>Exclusão de conta e dados do ClinOS</h1>
        <p>
          Esta é a página oficial para solicitar a exclusão da sua conta do
          aplicativo ClinOS e de todos os dados associados à conta.
        </p>
        <small>Última atualização: 29 de agosto de 2026</small>
      </section>

      <section className="legal-content">
        <article>
          <h2>Como solicitar</h2>
          <p>
            Envie uma solicitação para {requestEmail} informando nome completo,
            e-mail da conta, tipo de acesso (Profissional ou Paciente) e telefone,
            se cadastrado. No assunto, informe “Exclusão de conta e dados do
            ClinOS”. Usaremos essas informações para localizar a conta e
            confirmar a titularidade antes da exclusão.
          </p>
          <div className="legal-actions">
            <a href={deletionMailTo} className="np-button np-button-primary">
              Solicitar exclusão por e-mail
            </a>
          </div>
        </article>

        <article>
          <h2>O que será excluído</h2>
          <p>
            Quando a solicitação for confirmada, excluiremos ou anonimizaremos a
            conta do ClinOS e os dados pessoais associados, incluindo dados de
            cadastro, acesso, registros vinculados ao usuário e informações
            relacionadas ao uso do aplicativo e da plataforma ClinOS.
          </p>
          <p>
            Para contas profissionais, a exclusão pode afetar dados da organização,
            pacientes e históricos mantidos sob responsabilidade do profissional ou
            da clínica. Podemos solicitar confirmação adicional antes de remover
            informações clínicas ou de pacientes.
          </p>
        </article>

        <article>
          <h2>Dados que podem ser mantidos</h2>
          <p>
            Algumas informações podem ser mantidas pelo prazo necessário para
            cumprir obrigações legais, fiscais, contratuais, segurança, prevenção
            a fraude, auditoria ou defesa em processos administrativos e judiciais.
            Quando possível, esses dados serão anonimizados.
          </p>
        </article>

        <article>
          <h2>Prazo de atendimento</h2>
          <p>
            Responderemos à solicitação pelo e-mail informado e concluiremos a
            exclusão em prazo razoável, considerando verificação de identidade,
            obrigações legais e complexidade dos dados envolvidos.
          </p>
        </article>

        <article>
          <h2>Contato</h2>
          <p>
            Para dúvidas sobre exclusão de conta ou dados pessoais do ClinOS,
            fale conosco
            pelo e-mail {requestEmail}.
          </p>
        </article>
      </section>
    </main>
  );
}
