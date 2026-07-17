import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { SettingsClient } from "@/components/settings/settings-client";
import { UsersClient } from "@/components/users/users-client";
import { BillingClient } from "@/components/billing/billing-client";
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
          <span className="eyebrow">Administração</span>
          <h1>Perfil</h1>
          <p>Atualize a identidade da clínica, gerencie os acessos da sua equipe e sua assinatura.</p>
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
          <a 
            href="/settings?tab=billing" 
            className={tab === "billing" ? "primary-button" : "secondary-button"}
            style={{ textDecoration: "none" }}
          >
            Assinatura
          </a>
        </div>
      </section>

      {tab === "identity" ? (
        <SettingsClient />
      ) : tab === "billing" ? (
        <BillingClient />
      ) : (
        <UsersClient currentUserRole={user.role} />
      )}
    </main>
  );
}
