import Link from "next/link";

const workflows = [
  {
    title: "Durante a consulta", href: "/software-para-montar-cardapio-nutricionista",
    description: "Prontuário e planejamento alimentar no mesmo fluxo de atendimento.",
    features: ["Cadastro e anamnese", "Avaliação e evolução corporal", "Cardápios, alimentos e substituições"]
  },
  {
    title: "Entre as consultas", href: "/recursos",
    description: "Um portal para manter o paciente próximo do acompanhamento.",
    features: ["Planos publicados pelo profissional", "Diário alimentar e hidratação", "Chat e materiais educativos"]
  },
  {
    title: "Na gestão da clínica", href: "/sistema-para-clinicas",
    description: "Informações organizadas para cuidar também do seu negócio.",
    features: ["Agenda e agendamento público", "Controle financeiro e indicadores", "Equipe e identidade da clínica"]
  }
];

export function ConnectedCare() {
  return (
    <section id="comparativo" className="py-20 px-4 sm:px-6 bg-sand-50 scroll-mt-24">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sage-800">Atendimento conectado</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 font-display">
            Sua rotina vai além do plano alimentar
          </h2>
          <p className="text-base text-ink-600 max-w-2xl mx-auto">
            Reúna o atendimento nutricional, o acompanhamento do paciente e a gestão do consultório no ClinOSTec.
            Explore os recursos e avalie o que funciona para sua prática.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workflows.map((workflow, index) => (
            <article key={workflow.title} className="p-6 rounded-2xl bg-white border border-sand-200 flex flex-col gap-4">
              <span className="text-xs font-bold text-sage-800">0{index + 1}</span>
              <h3 className="text-xl font-bold font-display">{workflow.title}</h3>
              <p className="text-sm text-ink-600">{workflow.description}</p>
              <ul className="text-sm text-ink-700 space-y-3 flex-1">
                {workflow.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
              </ul>
              <Link href={workflow.href} className="font-semibold text-sm text-sage-900 underline underline-offset-4 min-h-11 inline-flex items-center">
                Conhecer os recursos <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
