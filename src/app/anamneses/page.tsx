import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { AnamnesesClient } from "@/components/anamneses/anamneses-client";
import { getCurrentUser } from "@/lib/session";

export default async function AnamnesesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="anamneses" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Prontuario</span>
          <h1>Anamnese</h1>
          <p>Registre historico, rotina, preferências, sintomas e condutas iniciais.</p>
        </div>
      </section>

      <AnamnesesClient />
    </main>
  );
}
