import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { EnergyClient } from "@/components/energy/energy-client";
import { getCurrentUser } from "@/lib/session";

export default async function EnergyPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <main className="shell workspace-shell">
      <AppNav active="energy" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Planejamento nutricional</span>
          <h1>Gasto energetico</h1>
          <p>Calcule TMB e GET por Harris-Benedict, Mifflin-St Jeor ou FAO/OMS e salve o historico por paciente.</p>
        </div>
      </section>

      <EnergyClient />
    </main>
  );
}
