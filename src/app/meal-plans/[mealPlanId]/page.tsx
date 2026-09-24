import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { PrintButton } from "@/components/print-button";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    mealPlanId: string;
  };
};

export default async function MealPlanDetailPage({ params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [mealPlan, dbUser] = await Promise.all([
    prisma.mealPlan.findFirst({
      where: {
        id: params.mealPlanId,
        organizationId: user.organizationId
      },
      include: {
        organization: true,
        patient: true,
        meals: {
          orderBy: { position: "asc" },
          include: {
            items: true
          }
        }
      }
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { professionalCouncil: true }
    })
  ]);

  if (!mealPlan) {
    notFound();
  }

  const councilLabel = dbUser?.professionalCouncil || "CRN Ativo — Uso Exclusivo (Lei 8.234/91)";

  const totals = mealPlan.meals
    .flatMap((meal) => meal.items)
    .reduce(
      (total, item) => ({
        calories: total.calories + Number(item.calories),
        protein: total.protein + Number(item.protein),
        carbs: total.carbs + Number(item.carbs),
        fat: total.fat + Number(item.fat)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

  const totalKcalSafe = Math.max(1, totals.calories);
  const pPct = totals.calories > 0 ? Math.round(((totals.protein * 4) / totalKcalSafe) * 100) : 0;
  const cPct = totals.calories > 0 ? Math.round(((totals.carbs * 4) / totalKcalSafe) * 100) : 0;
  const fPct = totals.calories > 0 ? Math.max(0, 100 - pPct - cPct) : 0;

  const patientWeight = Number(mealPlan.patient.weightKg || 0) || 68;
  const pGPerKg = (totals.protein / patientWeight).toFixed(2);
  const cGPerKg = (totals.carbs / patientWeight).toFixed(2);
  const fGPerKg = (totals.fat / patientWeight).toFixed(2);
  const waterMl = Math.round(patientWeight * 35);
  const waterGlasses = Math.round(waterMl / 250);

  return (
    <main className="shell workspace-shell">
      <div className="no-print">
        <AppNav active="meal-plans" user={user} />

        <section className="workspace-heading meal-plan-detail-heading">
          <div>
            <span className="eyebrow">Visualização & Impressão Oficial (A4 / PDF)</span>
            <h1>{mealPlan.name}</h1>
            <p>
              Paciente: <strong>{mealPlan.patient.name}</strong> ·{" "}
              {mealPlan.publishedAt ? "Publicado no Portal do Paciente" : "Rascunho Interno"}
            </p>
          </div>
          <div className="row-actions">
            <Link className="button secondary" href="/meal-plans">
              ← Voltar aos Cardápios
            </Link>
            <PrintButton label="🖨️ Imprimir / Salvar PDF com CRN" />
          </div>
        </section>
      </div>

      {/* FOLHA DE PRESCRIÇÃO DIETÉTICA PREMIUM (TELA + IMPRESSÃO A4) */}
      <article className="surface printable-plan luxury-diet-sheet">
        <header className="luxury-diet-header">
          <div className="luxury-diet-brand">
            <div className="luxury-diet-logo-badge">NP</div>
            <div>
              <span className="luxury-diet-clinic">{mealPlan.organization.name}</span>
              <h2>{mealPlan.name}</h2>
              <p>
                Prescrição Dietética Individualizada · Emitido em{" "}
                {new Intl.DateTimeFormat("pt-BR").format(new Date())}
              </p>
            </div>
          </div>
          <div className="luxury-diet-professional">
            <strong>{user.name}</strong>
            <span>Nutricionista Responsável</span>
            <small>{councilLabel}</small>
          </div>
        </header>

        {/* FAIXA DO PACIENTE & META DE HIDRATAÇÃO */}
        <section className="luxury-patient-strip">
          <div>
            <span>Paciente</span>
            <strong>{mealPlan.patient.name}</strong>
          </div>
          <div>
            <span>Peso de Referência</span>
            <strong>
              {mealPlan.patient.weightKg
                ? `${Number(mealPlan.patient.weightKg).toFixed(1)} kg`
                : `${patientWeight} kg (est.)`}
            </strong>
          </div>
          <div>
            <span>Meta de Hidratação (35 ml/kg)</span>
            <strong style={{ color: "#0284c7" }}>
              💧 {(waterMl / 1000).toFixed(1)} Litros/dia (~{waterGlasses} copos de 250ml)
            </strong>
          </div>
          <div>
            <span>Refeições no Dia</span>
            <strong>{mealPlan.meals.length} refeições estruturadas</strong>
          </div>
        </section>

        {/* RESUMO ENERGÉTICO E BARRA % VET + G/KG */}
        <section className="luxury-macro-summary" aria-label="Resumo nutricional">
          <div className="luxury-macro-cards">
            <div className="luxury-macro-box kcal">
              <span>Valor Energético Total (VET)</span>
              <strong>{Math.round(totals.calories)} kcal</strong>
              <small>
                {mealPlan.targetCalories ? `Meta prescrita: ${mealPlan.targetCalories} kcal` : "Cálculo TACO/IBGE"}
              </small>
            </div>
            <div className="luxury-macro-box prot">
              <span>Proteínas ({pPct}% VET)</span>
              <strong>{totals.protein.toFixed(1)} g</strong>
              <small>{pGPerKg} g/kg de peso</small>
            </div>
            <div className="luxury-macro-box carb">
              <span>Carboidratos ({cPct}% VET)</span>
              <strong>{totals.carbs.toFixed(1)} g</strong>
              <small>{cGPerKg} g/kg de peso</small>
            </div>
            <div className="luxury-macro-box fat">
              <span>Lipídios ({fPct}% VET)</span>
              <strong>{totals.fat.toFixed(1)} g</strong>
              <small>{fGPerKg} g/kg de peso</small>
            </div>
          </div>

          <div className="luxury-vet-bar-wrap">
            <div className="luxury-vet-bar">
              <div style={{ width: `${pPct}%`, background: "#059669" }} />
              <div style={{ width: `${cPct}%`, background: "#0284c7" }} />
              <div style={{ width: `${fPct}%`, background: "#d97706" }} />
            </div>
            <div className="luxury-vet-legend">
              <span><i style={{ background: "#059669" }} /> Proteínas: {pPct}% ({pGPerKg} g/kg)</span>
              <span><i style={{ background: "#0284c7" }} /> Carboidratos: {cPct}% ({cGPerKg} g/kg)</span>
              <span><i style={{ background: "#d97706" }} /> Lipídios: {fPct}% ({fGPerKg} g/kg)</span>
            </div>
          </div>
        </section>

        {/* LISTA DE REFEIÇÕES */}
        <section className="luxury-meals-container">
          {mealPlan.meals.map((meal, index) => {
            const mealTotals = meal.items.reduce(
              (total, item) => ({
                calories: total.calories + Number(item.calories),
                protein: total.protein + Number(item.protein),
                carbs: total.carbs + Number(item.carbs),
                fat: total.fat + Number(item.fat)
              }),
              { calories: 0, protein: 0, carbs: 0, fat: 0 }
            );

            return (
              <section className="luxury-meal-card" key={meal.id}>
                <div className="luxury-meal-card-header">
                  <div className="luxury-meal-title-group">
                    <span className="luxury-meal-badge">
                      {meal.time ? `🕒 ${meal.time}` : `Refeição ${index + 1}`}
                    </span>
                    <h3>{meal.label}</h3>
                  </div>
                  <div className="luxury-meal-subtotal">
                    <strong>{Math.round(mealTotals.calories)} kcal</strong>
                    <span>
                      P {mealTotals.protein.toFixed(1)}g · C {mealTotals.carbs.toFixed(1)}g · G{" "}
                      {mealTotals.fat.toFixed(1)}g
                    </span>
                  </div>
                </div>

                <div className="luxury-meal-items">
                  {meal.items.map((item) => {
                    const qty = Number(item.quantity);
                    const formattedPortion =
                      qty > 1 && qty !== 1
                        ? `${qty.toLocaleString("pt-BR")} × ${item.portion}`
                        : item.portion;

                    return (
                      <div className="luxury-food-row" key={item.id}>
                        <div className="luxury-food-main">
                          <div className="luxury-food-name-col">
                            <strong>{item.foodName}</strong>
                            {item.notes ? (
                              <div className="luxury-food-substitutions">
                                <span>🔄 {item.notes}</span>
                              </div>
                            ) : null}
                          </div>
                          <div className="luxury-food-portion-col">
                            <span className="luxury-portion-pill">{formattedPortion}</span>
                          </div>
                          <div className="luxury-food-macros-col">
                            <strong>{Math.round(Number(item.calories))} kcal</strong>
                            <span>
                              P {Number(item.protein).toFixed(1)}g · C {Number(item.carbs).toFixed(1)}g · G{" "}
                              {Number(item.fat).toFixed(1)}g
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </section>

        {/* ORIENTAÇÕES NUTRICIONAIS */}
        {mealPlan.observations ? (
          <section className="luxury-observations-box">
            <h4>📋 Orientações Nutricionais, Preparo e Hidratação</h4>
            <p>{mealPlan.observations}</p>
          </section>
        ) : null}

        {/* RODAPÉ COM CARIMBO / ASSINATURA DO NUTRICIONISTA */}
        <footer className="luxury-diet-footer">
          <div>
            <strong>{mealPlan.organization.name} · NutriPlan</strong>
            <span>Plano alimentar calculado segundo a Tabela Brasileira de Composição de Alimentos (TACO/IBGE).</span>
          </div>
          <div className="luxury-signature-block">
            <div className="luxury-signature-line" />
            <strong>{user.name}</strong>
            <span>Nutricionista — {dbUser?.professionalCouncil || "CRN"}</span>
          </div>
        </footer>
      </article>
    </main>
  );
}
