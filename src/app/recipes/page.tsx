import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { RecipesClient } from "@/components/recipes/recipes-client";
import { getCurrentUser } from "@/lib/session";

export default async function RecipesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="recipes" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Biblioteca nutricional</span>
          <h1>Receitas</h1>
          <p>Cadastre preparacoes com ingredientes, macros, porcoes e modo de preparo.</p>
        </div>
      </section>

      <RecipesClient />
    </main>
  );
}
