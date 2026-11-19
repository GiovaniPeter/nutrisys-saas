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
    <main className="shell workspace-shell foods-page-shell">
      <AppNav active="foods" user={user} />
      <FoodsClient />
    </main>
  );
}
