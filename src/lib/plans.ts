export const PLANS = [
  {
    code: "essential",
    name: "Essencial",
    monthlyPriceCents: 7900,
    patientLimit: 50,
    features: ["Pacientes", "Agenda", "Planos alimentares", "PDFs"]
  },
  {
    code: "professional",
    name: "Profissional",
    monthlyPriceCents: 14900,
    patientLimit: null,
    features: ["Pacientes ilimitados", "Portal do paciente", "Chat", "Financeiro", "KPIs"]
  },
  {
    code: "clinic",
    name: "Clínica",
    monthlyPriceCents: 24900,
    patientLimit: null,
    features: ["Multi-profissional", "Secretária", "Permissões", "Relatórios avançados"]
  }
] as const;

export type PlanCode = (typeof PLANS)[number]["code"];

export function findPlan(code: string) {
  return PLANS.find((plan) => plan.code === code);
}
