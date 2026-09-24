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
          <span className="eyebrow">Prontuário Eletrônico Multiprofissional</span>
          <h1>Prontuário, Anamnese e Evolução SOAP</h1>
          <p>
            Registre atendimentos médicos, nutricionais, psicológicos, fisioterapêuticos, esportivos, fonoaudiológicos e
            evoluções SOAP em um único prontuário integrado.
          </p>
        </div>
      </section>

      <AnamnesesClient />
    </main>
  );
}
