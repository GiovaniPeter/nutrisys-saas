import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { UsersClient } from "@/components/users/users-client";
import { getCurrentUser } from "@/lib/session";

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="shell workspace-shell">
      <AppNav active="users" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Administracao</span>
          <h1>Equipe</h1>
          <p>Gerencie nutricionistas, secretarias e permissões da clínica.</p>
        </div>
      </section>

      <UsersClient currentUserRole={user.role} />
    </main>
  );
}
