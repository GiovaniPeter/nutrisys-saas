import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { MealPlansClient } from "@/components/meal-plans/meal-plans-client";
import { getCurrentUser } from "@/lib/session";

export default async function MealPlansPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="meal-plans" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Nutricao</span>
          <h1>Planos alimentares</h1>
          <p>Monte refeicoes com alimentos, metas nutricionais e publique para o paciente.</p>
        </div>
      </section>

      <MealPlansClient />
    </main>
  );
}
