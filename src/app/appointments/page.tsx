import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { AppointmentsClient } from "@/components/appointments/appointments-client";
import { getCurrentUser } from "@/lib/session";

export default async function AppointmentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="appointments" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Consultorio</span>
          <h1>Agenda</h1>
          <p>Consultas reais no Supabase, vinculadas aos pacientes da clinica.</p>
        </div>
      </section>

      <AppointmentsClient />
    </main>
  );
}
