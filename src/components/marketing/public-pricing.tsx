import { PLANS } from "@/lib/plans";

const descriptions = {
  essential: "Para começar a organizar o atendimento do seu consultório.",
  professional: "Para acompanhar pacientes e reunir a gestão em um só lugar.",
  clinic: "Para clínicas que precisam organizar o trabalho em equipe."
};

export function PublicPricing() {
  return (
    <section id="planos" className="py-20 px-4 sm:px-6 bg-white border-t border-sand-200 scroll-mt-24">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sage-800">Planos para sua rotina</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 font-display">
            Do primeiro consultório à sua clínica
          </h2>
          <p className="text-base text-ink-600 max-w-xl mx-auto">
            Teste por 7 dias sem cartão. Após o teste, escolha se deseja contratar uma assinatura mensal.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => (
            <article key={plan.code} className={`p-7 rounded-3xl bg-white flex flex-col gap-6 ${
              plan.code === "professional" ? "border-2 border-sage-900 shadow-card" : "border border-sand-200"
            }`}>
              <div>
                <span className="text-xs font-semibold text-sage-800">
                  {plan.code === "professional" ? "Para o acompanhamento contínuo" : plan.code === "clinic" ? "Para equipes" : "Para começar"}
                </span>
                <h3 className="text-2xl font-bold font-display mt-2">{plan.name}</h3>
                <p className="text-sm text-ink-600 mt-2">{descriptions[plan.code]}</p>
              </div>
              <div>
                <strong className="text-4xl font-extrabold font-display">
                  {(plan.monthlyPriceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </strong>
                <span className="text-sm text-ink-600"> /mês</span>
                <p className="text-xs text-ink-600 mt-2">Cobrança mensal recorrente após a contratação.</p>
              </div>
              <ul className="text-sm text-ink-700 space-y-3 flex-1">
                <li className="font-semibold">
                  {plan.patientLimit === null ? "Pacientes ilimitados" : `Até ${plan.patientLimit} pacientes`}
                </li>
                {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
              </ul>
              <a href={`/register?perfil=nutricionista&plan=${plan.code}&source=home-pricing`}
                className={`inline-flex justify-center items-center min-h-12 px-5 rounded-xl font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 focus-visible:ring-offset-2 ${
                  plan.code === "professional" ? "bg-sage-900 text-white hover:bg-sage-800" : "border border-sand-300 text-ink-900 hover:bg-sand-50"
                }`}>
                Testar {plan.name} por 7 dias
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
