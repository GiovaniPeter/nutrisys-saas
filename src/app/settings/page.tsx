import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { SettingsClient } from "@/components/settings/settings-client";
import { getCurrentUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="settings" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Administracao</span>
          <h1>Configuracoes</h1>
          <p>Atualize identidade, contato e cores da clinica usadas nos materiais e telas.</p>
        </div>
      </section>

      <SettingsClient />
    </main>
  );
}
