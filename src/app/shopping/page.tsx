import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { ShoppingClient } from "@/components/shopping/shopping-client";
import { getCurrentUser } from "@/lib/session";

export default async function ShoppingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="shopping" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Planejamento</span>
          <h1>Lista de compras</h1>
          <p>Gere listas automaticas a partir dos planos alimentares publicados ou em rascunho.</p>
        </div>
      </section>

      <ShoppingClient />
    </main>
  );
}
