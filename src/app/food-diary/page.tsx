import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { FoodDiaryClient } from "@/components/food-diary/food-diary-client";
import { getCurrentUser } from "@/lib/session";

export default async function FoodDiaryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="food-diary" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Acompanhamento</span>
          <h1>Diario alimentar</h1>
          <p>Revise registros enviados pelo portal do paciente e devolva orientacoes rapidas.</p>
        </div>
      </section>

      <FoodDiaryClient />
    </main>
  );
}
