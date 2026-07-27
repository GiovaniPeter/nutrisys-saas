import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { FeedbackClient } from "@/components/feedback/feedback-client";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sugestões e bugs | ClinOS",
  description: "Envie sugestões de novas funções ou reporte problemas encontrados no ClinOS.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function FeedbackPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="feedback" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Ajude a construir o ClinOS</span>
          <h1>Sugestões e bugs</h1>
          <p>Conte o que facilitaria sua rotina ou informe um problema que precisa ser corrigido.</p>
        </div>
      </section>

      <FeedbackClient />
    </main>
  );
}
