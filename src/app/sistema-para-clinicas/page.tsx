import type { Metadata } from "next";
import { SolutionPage, type MarketingFaq, type MarketingFeature } from "@/components/marketing/marketing-pages";

export const metadata: Metadata = {
  title: "Sistema para Clínicas Multiprofissionais | ClinOS",
  description: "Centralize profissionais, pacientes, prontuários, agenda, permissões, financeiro e indicadores em um sistema para clínicas multiprofissionais.",
  alternates: {
    canonical: "/sistema-para-clinicas"
  },
  openGraph: {
    title: "Sistema para clínicas multiprofissionais — ClinOS",
    description: "Equipe, pacientes, agenda, prontuários, financeiro e indicadores organizados em uma plataforma.",
    url: "/sistema-para-clinicas",
    type: "website"
  }
};

const features: MarketingFeature[] = [
  {
    label: "Equipe",
    title: "Profissionais, secretária e funções de acesso",
    text: "Organize usuários da clínica por função para que cada pessoa trabalhe dentro do fluxo correspondente à sua responsabilidade."
  },
  {
    label: "Operação",
    title: "Agenda e pacientes centralizados",
    text: "Acompanhe horários, status dos atendimentos, cadastros e histórico do paciente sem depender de controles paralelos."
  },
  {
    label: "Assistência",
    title: "Prontuário e recursos por especialidade",
    text: "Mantenha registros clínicos ligados à organização e use recursos nutricionais quando esse atendimento fizer parte da clínica."
  },
  {
    label: "Relacionamento",
    title: "Portal do paciente e comunicação",
    text: "Disponibilize planos, metas, materiais e registros de acompanhamento, além do chat entre paciente e profissional."
  },
  {
    label: "Gestão",
    title: "Financeiro, relatórios e indicadores",
    text: "Registre receitas e despesas e acompanhe informações operacionais para orientar a rotina administrativa."
  },
  {
    label: "Governança",
    title: "Dados organizados por clínica",
    text: "Usuários, pacientes e registros são associados à organização responsável, com autenticação, controle de acesso e trilha de auditoria."
  }
];

const faqs: MarketingFaq[] = [
  {
    question: "O ClinOS aceita mais de um profissional?",
    answer: "Sim. O plano Clínica é voltado a operações multiprofissionais e inclui múltiplos profissionais, perfil de secretária, permissões e relatórios avançados."
  },
  {
    question: "Quais especialidades podem usar a plataforma?",
    answer: "Além de nutricionistas, a plataforma pode apoiar psicólogos, fisioterapeutas, médicos e outros profissionais que utilizem cadastro de pacientes, agenda, prontuário, financeiro e portal. Recursos específicos devem ser conferidos para cada fluxo."
  },
  {
    question: "Os dados ficam vinculados à clínica?",
    answer: "Sim. O modelo da aplicação associa usuários, pacientes e registros à organização responsável e aplica autenticação e controle de acesso. A política pública descreve as medidas adotadas."
  },
  {
    question: "A clínica consegue acompanhar o financeiro?",
    answer: "A plataforma permite registrar movimentações financeiras, situação de pagamentos e consultar indicadores e relatórios disponíveis no plano contratado."
  },
  {
    question: "O ClinOS garante conformidade jurídica da clínica?",
    answer: "Não. O sistema oferece recursos técnicos e políticas de privacidade, mas cada clínica continua responsável por suas bases legais, processos internos, obrigações profissionais e avaliação jurídica."
  }
];

export default function ClinicSystemPage() {
  return (
    <SolutionPage
      eyebrow="Sistema para clínicas"
      title={<>Uma operação conectada para uma <span>equipe que cuida em conjunto.</span></>}
      lead="O ClinOS concentra agenda, pacientes, profissionais, prontuários, acompanhamento e gestão para reduzir a fragmentação da rotina em clínicas multiprofissionais."
      canonical="/sistema-para-clinicas"
      panelTitle="Da recepção à gestão clínica"
      panelItems={[
        "Equipe e funções de acesso",
        "Agenda e histórico de pacientes",
        "Prontuários por organização",
        "Portal e comunicação com pacientes",
        "Financeiro, indicadores e relatórios"
      ]}
      featuresTitle="Uma base comum para atendimento e administração"
      featuresLead="A equipe trabalha sobre registros vinculados à mesma organização, preservando contexto e reduzindo controles duplicados."
      features={features}
      fitTitle="Para clínicas que precisam crescer com mais organização"
      fitItems={[
        "reunir equipe, agenda e pacientes em um sistema;",
        "definir funções para profissionais e secretária;",
        "acompanhar atendimento, financeiro e indicadores;",
        "oferecer um portal de acompanhamento ao paciente."
      ]}
      considerations={[
        "quantos profissionais e perfis precisam de acesso;",
        "quais especialidades e formulários serão utilizados;",
        "como os dados existentes serão importados ou cadastrados;",
        "quais políticas internas complementarão os controles do sistema."
      ]}
      steps={[
        {
          title: "Configure a organização",
          text: "Cadastre as informações da clínica e defina a identidade usada nos fluxos e materiais."
        },
        {
          title: "Organize a equipe",
          text: "Crie usuários e distribua funções entre proprietário, profissionais, secretária e administração."
        },
        {
          title: "Centralize a operação",
          text: "Conecte agenda, pacientes, prontuários e acompanhamentos à rotina de cada atendimento."
        },
        {
          title: "Acompanhe a gestão",
          text: "Use financeiro, indicadores, relatórios e registros de atividade para orientar as decisões operacionais."
        }
      ]}
      faqs={faqs}
    />
  );
}
