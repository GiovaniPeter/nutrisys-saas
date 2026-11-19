import type { Metadata } from "next";
import Link from "next/link";
import { CompanyIdentity } from "@/components/marketing/company-identity";

export const metadata: Metadata = {
  title: "Exclusão de Conta e Dados | ClinOSTec",
  description: "Solicite a exclusão da sua conta do aplicativo e plataforma ClinOSTec e dos dados associados.",
  alternates: {
    canonical: "/exclusao-de-conta"
  }
};

const requestEmail = process.env.NEXT_PUBLIC_DPO_EMAIL?.trim() || "contato@clinos.tec.br";
const mailSubject = "Solicitação de exclusão de conta e dados - ClinOSTec";
const mailBody = [
  "Olá, equipe ClinOSTec.",
  "",
  "Solicito a exclusão da minha conta e dos dados associados à plataforma e ao aplicativo ClinOSTec.",
  "",
  "Nome completo:",
  "E-mail da conta:",
  "Tipo de acesso: Profissional ou Paciente",
  "Telefone, se cadastrado:",
  "",
  "Confirmo que entendo que a exclusão removerá meu acesso e poderá impactar dados vinculados, respeitadas as retenções legais."
].join("\n");

const deletionMailTo = `mailto:${requestEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

export default function AccountDeletionPage() {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <Link href="/" className="legal-back">ClinOSTec</Link>
        <span className="eyebrow">Dados e conta (LGPD)</span>
        <h1>Exclusão de conta e dados do ClinOSTec</h1>
        <p>
          Esta é a página oficial para solicitar a exclusão da sua conta no aplicativo e na plataforma ClinOSTec e dos
          dados pessoais associados, nos termos do Art. 18 da LGPD.
        </p>
        <small>Última atualização: 18 de novembro de 2026</small>
        <CompanyIdentity />
      </section>

      <section className="legal-content">
        <article>
          <h2>Como solicitar</h2>
          <p>
            Envie uma solicitação para <strong>{requestEmail}</strong> informando nome completo, e-mail da conta, tipo
            de acesso (Profissional ou Paciente) e telefone, se cadastrado. No assunto, informe “Exclusão de conta e
            dados do ClinOSTec”. Usaremos essas informações exclusivamente para localizar a conta e confirmar sua
            titularidade antes da exclusão.
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
            Após confirmação da titularidade, excluiremos ou anonimizaremos a conta do ClinOSTec e os dados pessoais
            associados, incluindo dados cadastrais, credenciais de acesso e registros vinculados ao usuário.
          </p>
          <p>
            Para contas profissionais (clínicas/nutricionistas), recomendamos realizar previamente a exportação dos
            prontuários dos pacientes (disponível no botão <em>Exportar Dados (LGPD)</em> de cada prontuário) para
            cumprir o dever legal de guarda.
          </p>
        </article>

        <article>
          <h2>Dados que podem ser mantidos por obrigação legal</h2>
          <p>
            Determinadas informações podem ser preservadas pelo prazo legal obrigatório, incluindo registros fiscais e
            de pagamento, logs de acesso e segurança (Marco Civil da Internet), defesa em processos administrativos ou
            judiciais e prontuários de saúde sujeitos à guarda mínima de 20 anos (Lei nº 13.787/2018). Sempre que
            aplicável, os dados remanescentes serão anonimizados.
          </p>
        </article>

        <article>
          <h2>Prazo de atendimento</h2>
          <p>
            Confirmaremos o recebimento e concluiremos a resposta/execução da solicitação em até{" "}
            <strong>15 (quinze) dias corridos</strong> após a validação de identidade, conforme o Art. 19, II da LGPD.
          </p>
        </article>

        <article>
          <h2>Contato e Privacidade</h2>
          <p>
            Dúvidas sobre privacidade, portabilidade ou exclusão de dados: fale com nosso canal de privacidade pelo
            e-mail <a href={`mailto:${requestEmail}`}>{requestEmail}</a> ou consulte a{" "}
            <Link href="/politica-de-privacidade">Política de Privacidade (LGPD)</Link>.
          </p>
        </article>
      </section>
    </main>
  );
}
