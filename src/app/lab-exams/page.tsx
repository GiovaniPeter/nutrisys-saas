import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { LabExamsClient } from "@/components/lab-exams/lab-exams-client";
import { getCurrentUser } from "@/lib/session";

export default async function LabExamsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="lab-exams" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Acompanhamento clinico</span>
          <h1>Exames laboratoriais</h1>
          <p>Registre resultados, referencias e acompanhe a evolucao bioquimica do paciente.</p>
        </div>
      </section>

      <LabExamsClient />
    </main>
  );
}
