import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { SupplementsClient } from "@/components/supplements/supplements-client";
import { getCurrentUser } from "@/lib/session";

export default async function SupplementsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="supplements" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Prescricao</span>
          <h1>Suplementos</h1>
          <p>Registre suplementos, fitoterapicos, formulas manipuladas e orientacoes de uso.</p>
        </div>
      </section>

      <SupplementsClient />
    </main>
  );
}
