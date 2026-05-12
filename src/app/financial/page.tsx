import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { FinancialClient } from "@/components/financial/financial-client";
import { getCurrentUser } from "@/lib/session";

export default async function FinancialPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="financial" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Gestao</span>
          <h1>Financeiro</h1>
          <p>Controle receitas, despesas, pendencias e pagamentos da clinica.</p>
        </div>
      </section>

      <FinancialClient />
    </main>
  );
}
