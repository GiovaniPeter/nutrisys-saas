import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { BodyRecordsClient } from "@/components/body-records/body-records-client";
import { getCurrentUser } from "@/lib/session";

export default async function BodyRecordsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="body-records" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Clinico</span>
          <h1>Evolucao corporal</h1>
          <p>Acompanhe peso, gordura corporal e medidas por paciente.</p>
        </div>
      </section>

      <BodyRecordsClient />
    </main>
  );
}
