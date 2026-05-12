import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { FoodsClient } from "@/components/foods/foods-client";
import { getCurrentUser } from "@/lib/session";

export default async function FoodsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="foods" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Base nutricional</span>
          <h1>Alimentos</h1>
          <p>Consulte alimentos globais e cadastre itens personalizados da clinica.</p>
        </div>
      </section>

      <FoodsClient />
    </main>
  );
}
