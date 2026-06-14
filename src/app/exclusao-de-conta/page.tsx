import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Exclusao de Conta | NutreClin",
  description: "Solicite a exclusao da sua conta e dos dados associados ao NutreClin."
};

const requestEmail = "contato@nutreclin.com.br";
const mailSubject = "Solicitacao de exclusao de conta - NutreClin";
const mailBody = [
  "Ola, equipe NutreClin.",
  "",
  "Solicito a exclusao da minha conta e dos dados associados ao app NutreClin.",
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
        <Link href="/" className="legal-back">NutreClin</Link>
        <span className="eyebrow">Dados e conta</span>
        <h1>Exclusao de conta</h1>
        <p>
          Use esta pagina para solicitar a exclusao da sua conta do NutreClin
          e dos dados associados ao app.
        </p>
        <small>Ultima atualizacao: 5 de junho de 2026</small>
      </section>

      <section className="legal-content">
        <article>
          <h2>Como solicitar</h2>
          <p>
            Envie uma solicitacao para {requestEmail} informando nome completo,
            e-mail da conta, tipo de acesso (Profissional ou Paciente) e telefone,
            se cadastrado. Usaremos essas informacoes para localizar a conta e
            confirmar a titularidade antes da exclusao.
          </p>
          <div className="legal-actions">
            <a href={deletionMailTo} className="np-button np-button-primary">
              Solicitar exclusao por e-mail
            </a>
          </div>
        </article>

        <article>
          <h2>O que sera excluido</h2>
          <p>
            Quando a solicitacao for confirmada, excluiremos ou anonimizaremos a
            conta e os dados pessoais associados ao app, incluindo dados de
            cadastro, acesso, registros vinculados ao usuario e informacoes
            relacionadas ao uso da plataforma.
          </p>
          <p>
            Para contas profissionais, a exclusao pode afetar dados da organizacao,
            pacientes e historicos mantidos sob responsabilidade do profissional ou
            da clinica. Podemos solicitar confirmacao adicional antes de remover
            informacoes clinicas ou de pacientes.
          </p>
        </article>

        <article>
          <h2>Dados que podem ser mantidos</h2>
          <p>
            Algumas informacoes podem ser mantidas pelo prazo necessario para
            cumprir obrigacoes legais, fiscais, contratuais, seguranca, prevencao
            a fraude, auditoria ou defesa em processos administrativos e judiciais.
            Quando possivel, esses dados serao anonimizados.
          </p>
        </article>

        <article>
          <h2>Prazo de atendimento</h2>
          <p>
            Responderemos a solicitacao pelo e-mail informado e concluiremos a
            exclusao em prazo razoavel, considerando verificacao de identidade,
            obrigacoes legais e complexidade dos dados envolvidos.
          </p>
        </article>

        <article>
          <h2>Contato</h2>
          <p>
            Para duvidas sobre exclusao de conta ou dados pessoais, fale conosco
            pelo e-mail {requestEmail}.
          </p>
        </article>
      </section>
    </main>
  );
}
