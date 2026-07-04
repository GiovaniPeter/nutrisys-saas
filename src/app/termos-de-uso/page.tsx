import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso | ClinOS",
  description: "Termos de Uso da plataforma ClinOS.",
  alternates: {
    canonical: "/termos-de-uso"
  }
};

const sections = [
  {
    title: "1. Aceitação dos Termos",
    text: [
      "Ao acessar e usar a plataforma ClinOS, você concorda com estes Termos de Uso. Caso não concorde com alguma condição estabelecida, recomendamos que não utilize a plataforma."
    ]
  },
  {
    title: "2. Uso da Plataforma e Responsabilidade",
    text: [
      "O ClinOS é uma ferramenta tecnológica que auxilia profissionais de saúde na gestão de clínicas, pacientes e prontuários. Não prestamos serviços médicos ou nutricionais.",
      "Toda e qualquer decisão clínica, prescrição, plano alimentar ou tratamento registrado na plataforma é de inteira e exclusiva responsabilidade do profissional de saúde assinante.",
      "O usuário compromete-se a utilizar a plataforma de maneira ética, legal e de acordo com as diretrizes do seu conselho de classe."
    ]
  },
  {
    title: "3. Cadastro e Segurança",
    text: [
      "Para utilizar o ClinOS, o usuário deve fornecer informações verdadeiras e atualizadas. A senha de acesso é pessoal e intransferível.",
      "O usuário é responsável por manter a confidencialidade de sua conta e por todas as atividades que nela ocorrerem."
    ]
  },
  {
    title: "4. Assinatura, Cancelamento e Pagamentos",
    text: [
      "O uso completo da plataforma está condicionado à adesão de um plano de assinatura, cujos valores e condições estão disponíveis no site.",
      "O cancelamento pode ser feito a qualquer momento pelo painel do usuário, sem multas, interrompendo as cobranças dos ciclos seguintes. Não há reembolso de valores já pagos por meses ou anos utilizados."
    ]
  },
  {
    title: "5. Propriedade Intelectual",
    text: [
      "Todos os direitos sobre a plataforma ClinOS (software, design, marcas, textos) são de propriedade exclusiva de seus desenvolvedores.",
      "É expressamente proibida a cópia, engenharia reversa ou distribuição não autorizada do nosso software."
    ]
  },
  {
    title: "6. Disponibilidade e Limitação de Responsabilidade",
    text: [
      "Trabalhamos para manter a plataforma no ar 24/7, porém o ClinOS não se responsabiliza por eventuais instabilidades técnicas, interrupções ou falhas decorrentes de serviços de terceiros (como servidores externos de internet).",
      "Não somos responsáveis por eventuais perdas de dados decorrentes de mau uso, compartilhamento de senhas ou ataques cibernéticos em dispositivos do próprio usuário."
    ]
  },
  {
    title: "7. Alterações nos Termos",
    text: [
      "Podemos modificar estes Termos de Uso a qualquer momento. Caso as mudanças sejam significativas, notificaremos os usuários através da própria plataforma ou por e-mail."
    ]
  },
  {
    title: "8. Foro e Contato",
    text: [
      "Estes Termos são regidos pelas leis do Brasil. Fica eleito o foro da comarca da sede da empresa para dirimir quaisquer dúvidas oriundas deste documento.",
      "Em caso de dúvidas, entre em contato através dos nossos canais oficiais de atendimento."
    ]
  }
];

export default function TermsOfUsePage() {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <Link href="/" className="legal-back">ClinOS</Link>
        <span className="eyebrow">Jurídico</span>
        <h1>Termos de Uso</h1>
        <p>
          Leia atentamente as condições de uso da plataforma ClinOS para profissionais, clínicas e pacientes.
        </p>
        <small>Última atualização: 27 de Junho de 2026</small>
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
          Tem alguma dúvida sobre nossos termos?{" "}
          <Link href="/#faq">Consulte nossa central</Link> ou chame o suporte.
        </p>
      </footer>
    </main>
  );
}
