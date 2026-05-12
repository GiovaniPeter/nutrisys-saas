import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { BillingClient } from "@/components/billing/billing-client";
import { getCurrentUser } from "@/lib/session";

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="billing" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">SaaS</span>
          <h1>Assinatura</h1>
          <p>Gerencie plano, trial, limites e estado comercial da clinica.</p>
        </div>
      </section>

      <BillingClient />
    </main>
  );
}
