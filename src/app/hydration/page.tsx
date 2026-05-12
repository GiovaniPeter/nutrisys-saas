import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { HydrationClient } from "@/components/hydration/hydration-client";
import { getCurrentUser } from "@/lib/session";

export default async function HydrationPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <main className="shell workspace-shell">
      <AppNav active="hydration" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Engajamento</span>
          <h1>Hidratacao e metas</h1>
          <p>Acompanhe ingestao de agua e progresso de metas combinadas com o paciente.</p>
        </div>
      </section>

      <HydrationClient />
    </main>
  );
}
