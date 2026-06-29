import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { SettingsClient } from "@/components/settings/settings-client";
import { UsersClient } from "@/components/users/users-client";
import { getCurrentUser } from "@/lib/session";

export default async function SettingsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const tab = searchParams.tab || "identity";

  return (
    <main className="shell workspace-shell">
      <AppNav active="settings" user={user} />

      <section className="workspace-heading" style={{ flexWrap: "wrap", gap: "20px" }}>
        <div style={{ flex: "1 1 auto" }}>
          <span className="eyebrow">Administracao</span>
          <h1>Configuracoes</h1>
          <p>Atualize identidade da clinica e gerencie os acessos da sua equipe.</p>
        </div>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <a 
            href="/settings?tab=identity" 
            className={tab === "identity" ? "primary-button" : "secondary-button"}
            style={{ textDecoration: "none" }}
          >
            Identidade
          </a>
          <a 
            href="/settings?tab=users" 
            className={tab === "users" ? "primary-button" : "secondary-button"}
            style={{ textDecoration: "none" }}
          >
            Equipe
          </a>
        </div>
      </section>

      {tab === "identity" ? (
        <SettingsClient />
      ) : (
        <UsersClient currentUserRole={user.role} />
      )}
    </main>
  );
}
