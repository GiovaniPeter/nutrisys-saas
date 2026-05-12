import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { ChatClient } from "@/components/chat/chat-client";
import { getCurrentUser } from "@/lib/session";

export default async function ChatPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <main className="shell workspace-shell">
      <AppNav active="chat" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Relacionamento</span>
          <h1>Chat e video</h1>
          <p>Converse com pacientes, envie links de videochamada e abra o WhatsApp sem sair do fluxo de atendimento.</p>
        </div>
      </section>

      <ChatClient />
    </main>
  );
}
