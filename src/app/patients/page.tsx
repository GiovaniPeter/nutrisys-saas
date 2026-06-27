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
          <h1>Pacientes</h1>
        </div>
      </section>

      <PatientsClient />
    </main>
  );
}
