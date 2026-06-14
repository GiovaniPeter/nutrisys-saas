import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recuperar senha | NutreClin",
  description: "Solicite recuperacao de senha ou codigo de acesso do NutreClin."
};

const supportEmail = "contato@nutreclin.com.br";
const mailSubject = "Recuperacao de acesso - NutreClin";
const mailBody = [
  "Ola, equipe NutreClin.",
  "",
  "Preciso recuperar meu acesso ao app NutreClin.",
  "",
  "Nome completo:",
  "E-mail da conta:",
  "Tipo de acesso: Profissional ou Paciente",
  "Telefone, se cadastrado:",
  "",
  "Obrigado."
].join("\n");

const recoveryMailTo = `mailto:${supportEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

export default function PasswordRecoveryPage() {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <Link href="/" className="legal-back">NutreClin</Link>
        <span className="eyebrow">Acesso</span>
        <h1>Recuperar senha ou codigo</h1>
        <p>
          Use esta pagina para solicitar ajuda na recuperacao da senha de
          profissional ou do codigo de acesso do paciente.
        </p>
        <small>Atendimento por e-mail: {supportEmail}</small>
      </section>

      <section className="legal-content">
        <article>
          <h2>Como recuperar o acesso</h2>
          <p>
            Envie uma solicitacao informando nome completo, e-mail da conta,
            tipo de acesso (Profissional ou Paciente) e telefone, se cadastrado.
            A equipe do NutreClin verificara os dados antes de orientar a
            recuperacao do acesso.
          </p>
          <div className="legal-actions">
            <a href={recoveryMailTo} className="np-button np-button-primary">
              Solicitar recuperacao por e-mail
            </a>
          </div>
        </article>

        <article>
          <h2>Pacientes</h2>
          <p>
            Se voce e paciente e esqueceu o codigo de acesso, tambem pode pedir
            ao seu nutricionista ou clinica para gerar ou reenviar o codigo pelo
            painel profissional.
          </p>
        </article>
      </section>
    </main>
  );
}
