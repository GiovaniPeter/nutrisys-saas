import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { PatientsClient } from "@/components/patients/patients-client";
import { getCurrentUser } from "@/lib/session";

export default async function PatientsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="patients" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Atendimento</span>
          <h1>Pacientes</h1>
          <p>Cadastro real no Supabase, isolado pela clinica da sessao atual.</p>
        </div>
      </section>

      <PatientsClient />
    </main>
  );
}
