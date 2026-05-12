"use client";

import { useRouter } from "next/navigation";

export function PortalLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <button className="text-button" type="button" onClick={() => void logout()}>
      Sair
    </button>
  );
}
