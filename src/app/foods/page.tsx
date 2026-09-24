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
          <span className="eyebrow">Base Nutricional, Suplementos & Nutrição Clínica</span>
          <h1>Alimentos e Fórmulas Cadastradas</h1>
          <p>
            Consulte a base curada TACO/TBCA com medidas caseiras reais, suplementos esportivos, fórmulas enterais/clínicas
            multiprofissionais ou cadastre itens personalizados da sua clínica.
          </p>
        </div>
      </section>

      <FoodsClient />
    </main>
  );
}
