import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { RecallsClient } from "@/components/recalls/recalls-client";
import { getCurrentUser } from "@/lib/session";

export default async function RecallsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="recalls" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Consumo alimentar</span>
          <h1>Recordatorio 24h</h1>
          <p>Registre refeicoes, porcoes, horarios e observacoes do consumo nas ultimas 24 horas.</p>
        </div>
      </section>

      <RecallsClient />
    </main>
  );
}
