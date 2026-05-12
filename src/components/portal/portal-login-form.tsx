"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function PortalLoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/portal/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: form.get("identifier"),
        accessCode: form.get("accessCode")
      })
    });
    const data = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel entrar no portal.");
      return;
    }

    router.push("/portal");
    router.refresh();
  }

  return (
    <form className="form portal-login-form" onSubmit={handleSubmit}>
      <label>
        E-mail ou telefone
        <input name="identifier" required placeholder="paciente@email.com" />
      </label>
      <label>
        Codigo de acesso
        <input name="accessCode" required placeholder="Ex.: A1B2C3D4" />
      </label>
      {message ? <p className="form-message error">{message}</p> : null}
      <button className="button" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar no portal"}
      </button>
    </form>
  );
}
