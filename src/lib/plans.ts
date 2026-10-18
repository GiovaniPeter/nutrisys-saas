export const PLANS = [
  {
    code: "essential",
    name: "Essencial",
    monthlyPriceCents: 3950,
    infinitePayEnrollment: {
      merchantHandle: "rotuloconforme",
      planId: "XazNjh24Wn",
      url: "https://invoice.infinitepay.io/plans/rotuloconforme/XazNjh24Wn"
    },
    patientLimit: 50,
    features: [
      "Prescrição dietética com Tabela TACO (+1.000 itens)",
      "Medidas caseiras da cozinha brasileira",
      "Antropometria completa (Pollock e Guedes)",
      "Cálculo de TMB e VET (6 equações)",
      "Impressão e laudo em PDF com carimbo e CRN"
    ]
  },
  {
    code: "professional",
    name: "Profissional",
    monthlyPriceCents: 7450,
    infinitePayEnrollment: {
      merchantHandle: "rotuloconforme",
      planId: "Alkv2ysZ62",
      url: "https://invoice.infinitepay.io/plans/rotuloconforme/Alkv2ysZ62"
    },
    patientLimit: null,
    features: [
      "Portal do Paciente PWA no celular",
      "Substituições equivalentes em 1 clique",
      "Diário alimentar com fotos e meta de hidratação",
      "Chat integrado diretamente com o paciente",
      "Agenda, agendamento online e controle financeiro"
    ]
  },
  {
    code: "clinic",
    name: "Clínica",
    monthlyPriceCents: 12450,
    infinitePayEnrollment: {
      merchantHandle: "rotuloconforme",
      planId: "hWKqLMlZnp",
      url: "https://invoice.infinitepay.io/plans/rotuloconforme/hWKqLMlZnp"
    },
    patientLimit: null,
    features: [
      "Até 5 nutricionistas inclusos na equipe",
      "Acesso operacional para Secretária / Recepção",
      "Gestão de permissões e prontuários centralizados",
      "Agenda multi-profissional compartilhada",
      "Relatórios gerenciais e indicadores financeiros (KPIs)"
    ]
  }
] as const;

export type PlanCode = (typeof PLANS)[number]["code"];

export function findPlan(code: string) {
  return PLANS.find((plan) => plan.code === code);
}
