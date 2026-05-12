import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { KpisClient } from "@/components/kpis/kpis-client";
import { getCurrentUser } from "@/lib/session";

export default async function KpisPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <main className="shell workspace-shell">
      <AppNav active="kpis" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Gestao</span>
          <h1>Retencao e KPIs</h1>
          <p>Indicadores de retorno, faturamento, atividade dos pacientes e risco de no-show.</p>
        </div>
      </section>

      <KpisClient />
    </main>
  );
}
