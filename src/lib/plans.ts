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
    features: ["Pacientes", "Agenda", "Planos alimentares", "PDFs"]
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
    features: ["Pacientes ilimitados", "Portal do paciente", "Chat", "Financeiro", "KPIs"]
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
    features: ["Multi-profissional", "Secretária", "Permissões", "Relatórios avançados"]
  }
] as const;

export type PlanCode = (typeof PLANS)[number]["code"];

export function findPlan(code: string) {
  return PLANS.find((plan) => plan.code === code);
}
