import type { Metadata } from "next";
import { SolutionPage, type MarketingFaq, type MarketingFeature } from "@/components/marketing/marketing-pages";

export const metadata: Metadata = {
  title: "Software para Nutricionistas com Plano Alimentar | ClinOS",
  description: "Organize prontuário, anamnese, avaliação antropométrica, plano alimentar, agenda e acompanhamento do paciente em um software para nutricionistas.",
  alternates: {
    canonical: "/software-para-nutricionistas"
  },
  openGraph: {
    title: "Software para nutricionistas — ClinOS",
    description: "Do primeiro atendimento ao acompanhamento: prontuário, avaliação, plano alimentar, agenda e portal do paciente.",
    url: "/software-para-nutricionistas",
    type: "website"
  }
};

const features: MarketingFeature[] = [
  {
    label: "Atendimento",
    title: "Prontuário e anamnese no mesmo histórico",
    text: "Registre dados clínicos, objetivos, respostas da anamnese e evolução sem espalhar informações entre arquivos e ferramentas."
  },
  {
    label: "Avaliação",
    title: "Antropometria, exames e cálculo energético",
    text: "Acompanhe medidas corporais, resultados laboratoriais e cálculos de gasto energético vinculados ao paciente."
  },
  {
    label: "Prescrição",
    title: "Planos alimentares com macros e porções",
    text: "Estruture refeições, alimentos, quantidades e metas de macronutrientes usando a base alimentar disponível na plataforma."
  },
  {
    label: "Investigação",
    title: "Recordatório alimentar de 24 horas",
    text: "Organize refeições e alimentos relatados pelo paciente para apoiar a avaliação do consumo habitual."
  },
  {
    label: "Conduta",
    title: "Receitas, suplementos e materiais",
    text: "Reúna receitas, orientações, prescrições de suplementos e materiais educativos que complementam o plano de cuidado."
  },
  {
    label: "Acompanhamento",
    title: "Portal, diário alimentar, metas e hidratação",
    text: "Mantenha o paciente próximo entre consultas com registros de rotina e informações compartilhadas pelo profissional."
  }
];

const faqs: MarketingFaq[] = [
  {
    question: "O ClinOS foi criado para nutricionistas?",
    answer: "O ClinOS atende diferentes profissionais, mas inclui fluxos específicos de nutrição, como anamnese, avaliação antropométrica, recordatório 24 horas, cálculo energético, planos alimentares, receitas e acompanhamento do diário alimentar."
  },
  {
    question: "Consigo montar planos alimentares?",
    answer: "Sim. O profissional pode organizar refeições e itens, definir quantidades, acompanhar calorias e macronutrientes e gerar o material do plano para o paciente."
  },
  {
    question: "O paciente tem acesso próprio?",
    answer: "Nos planos que incluem o portal, o profissional pode habilitar o acesso do paciente a informações e fluxos como planos alimentares, metas, diário alimentar, hidratação, materiais e chat."
  },
  {
    question: "Posso usar o ClinOS trabalhando sozinho?",
    answer: "Sim. O plano Essencial atende operações menores, enquanto os planos Profissional e Clínica acrescentam recursos para acompanhamento, gestão e equipes. Os limites atuais devem ser confirmados na página de planos."
  },
  {
    question: "O sistema substitui a decisão do nutricionista?",
    answer: "Não. O ClinOS organiza dados e fluxos de trabalho. A avaliação, a conduta e toda decisão nutricional permanecem sob responsabilidade do profissional habilitado."
  }
];

export default function NutritionistSoftwarePage() {
  return (
    <SolutionPage
      eyebrow="Software para nutricionistas"
      title={<>Mais clareza no atendimento. <span>Mais continuidade no acompanhamento.</span></>}
      lead="O ClinOS reúne os recursos clínicos e administrativos da nutrição em uma jornada única — do cadastro e avaliação à entrega do plano alimentar e evolução do paciente."
      canonical="/software-para-nutricionistas"
      panelTitle="Seu atendimento nutricional, conectado"
      panelItems={[
        "Anamnese e histórico clínico",
        "Avaliação corporal e cálculo energético",
        "Recordatório e plano alimentar",
        "Agenda e evolução do paciente",
        "Portal, diário, metas e hidratação"
      ]}
      featuresTitle="Ferramentas que acompanham o raciocínio e a rotina do nutricionista"
      featuresLead="Cada registro permanece ligado ao paciente, permitindo retomar o contexto e acompanhar a evolução com menos trabalho operacional."
      features={features}
      fitTitle="Para nutricionistas que querem sair das ferramentas desconectadas"
      fitItems={[
        "centralizar prontuário, agenda e plano alimentar;",
        "acompanhar o paciente também entre consultas;",
        "organizar dados de avaliação e evolução;",
        "ter opções de plano para diferentes fases do consultório."
      ]}
      considerations={[
        "quais recursos estão incluídos no plano escolhido;",
        "quantos pacientes e profissionais usarão a conta;",
        "como será feita a migração dos registros atuais;",
        "quais dados o paciente poderá acessar no portal."
      ]}
      steps={[
        {
          title: "Cadastre o paciente",
          text: "Reúna identificação, objetivo, histórico e consentimento no cadastro vinculado ao consultório."
        },
        {
          title: "Avalie o contexto",
          text: "Registre anamnese, medidas, exames, recordatório e informações que apoiam sua avaliação."
        },
        {
          title: "Organize a conduta",
          text: "Monte o plano alimentar, associe receitas, suplementos, metas e materiais necessários."
        },
        {
          title: "Acompanhe a evolução",
          text: "Use agenda, portal, diário alimentar, hidratação e registros corporais para manter o histórico."
        }
      ]}
      faqs={faqs}
    />
  );
}
