import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { NotificationsClient } from "@/components/notifications/notifications-client";
import { getCurrentUser } from "@/lib/session";

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <main className="shell workspace-shell">
      <AppNav active="notifications" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Operacao</span>
          <h1>Notificacoes</h1>
          <p>Acompanhe consultas proximas, mensagens nao lidas e pendencias clinicas em um so painel.</p>
        </div>
      </section>

      <NotificationsClient />
    </main>
  );
}
