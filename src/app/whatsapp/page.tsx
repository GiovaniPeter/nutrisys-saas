import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { WhatsAppClient } from "@/components/whatsapp/whatsapp-client";
import { getCurrentUser } from "@/lib/session";

export default async function WhatsAppPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <main className="shell workspace-shell">
      <AppNav active="whatsapp" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Relacionamento</span>
          <h1>WhatsApp</h1>
          <p>Envie mensagens prontas, lembretes de consulta e textos personalizados pelo WhatsApp.</p>
        </div>
      </section>

      <WhatsAppClient />
    </main>
  );
}
