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

  const mealPlan = await prisma.mealPlan.findFirst({
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
  });

  if (!mealPlan) {
    notFound();
  }

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

  return (
    <main className="shell workspace-shell">
      <AppNav active="meal-plans" user={user} />

      <section className="workspace-heading meal-plan-detail-heading">
        <div>
          <span className="eyebrow">Plano alimentar</span>
          <h1>{mealPlan.name}</h1>
          <p>
            {mealPlan.patient.name} · {mealPlan.publishedAt ? "Publicado no portal" : "Rascunho interno"}
          </p>
        </div>
        <div className="row-actions">
          <Link className="text-button" href="/meal-plans">
            Voltar
          </Link>
          <PrintButton label="Imprimir / PDF" />
        </div>
      </section>

      <article className="surface printable-plan">
        <header className="printable-plan-header">
          <div>
            <span className="eyebrow">{mealPlan.organization.name}</span>
            <h2>{mealPlan.name}</h2>
            <p>Paciente: {mealPlan.patient.name}</p>
          </div>
          <div className="printable-plan-badge">
            <strong>{Math.round(totals.calories)}</strong>
            <span>kcal totais</span>
          </div>
        </header>

        <section className="macro-grid printable-macros" aria-label="Resumo nutricional">
          <span>{Math.round(totals.calories)} kcal</span>
          <span>{totals.protein.toFixed(1)}g prot</span>
          <span>{totals.carbs.toFixed(1)}g carb</span>
          <span>{totals.fat.toFixed(1)}g gord</span>
        </section>

        {mealPlan.targetCalories || mealPlan.targetProtein || mealPlan.targetCarbs || mealPlan.targetFat ? (
          <section className="printable-targets">
            <strong>Metas do plano</strong>
            <span>{mealPlan.targetCalories ? `${mealPlan.targetCalories} kcal` : "Kcal livre"}</span>
            <span>{mealPlan.targetProtein ? `${Number(mealPlan.targetProtein).toFixed(1)}g proteina` : "Proteina livre"}</span>
            <span>{mealPlan.targetCarbs ? `${Number(mealPlan.targetCarbs).toFixed(1)}g carboidratos` : "Carbo livre"}</span>
            <span>{mealPlan.targetFat ? `${Number(mealPlan.targetFat).toFixed(1)}g gorduras` : "Gordura livre"}</span>
          </section>
        ) : null}

        <section className="printable-meals">
          {mealPlan.meals.map((meal) => {
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
              <section className="printable-meal" key={meal.id}>
                <div className="printable-meal-title">
                  <div>
                    <h3>{meal.label}</h3>
                    <span>{meal.time || "Horario livre"}</span>
                  </div>
                  <strong>{Math.round(mealTotals.calories)} kcal</strong>
                </div>

                <table className="data-table printable-food-table">
                  <thead>
                    <tr>
                      <th>Alimento</th>
                      <th>Porcao</th>
                      <th>Kcal</th>
                      <th>Macros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meal.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.foodName}</strong>
                          {item.notes ? <span>{item.notes}</span> : null}
                        </td>
                        <td>
                          {Number(item.quantity).toLocaleString("pt-BR")} x {item.portion}
                        </td>
                        <td>{Math.round(Number(item.calories))}</td>
                        <td>
                          P {Number(item.protein).toFixed(1)}g · C {Number(item.carbs).toFixed(1)}g · G{" "}
                          {Number(item.fat).toFixed(1)}g
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })}
        </section>

        {mealPlan.observations ? (
          <section className="printable-notes">
            <strong>Orientacoes</strong>
            <p>{mealPlan.observations}</p>
          </section>
        ) : null}
      </article>
    </main>
  );
}
