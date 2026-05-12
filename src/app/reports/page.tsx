import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { ReportsClient } from "@/components/reports/reports-client";
import { getCurrentUser } from "@/lib/session";

export default async function ReportsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="reports" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Gestao</span>
          <h1>Relatorios</h1>
          <p>Indicadores clinicos e financeiros por periodo.</p>
        </div>
      </section>

      <ReportsClient />
    </main>
  );
}
