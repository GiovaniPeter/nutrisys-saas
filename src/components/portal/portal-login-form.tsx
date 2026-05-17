"use client";

import { FormEvent, useState } from "react";

export function PortalLoginForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    let response: Response;

    try {
      response = await fetch("/api/portal/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.get("identifier"),
          accessCode: form.get("accessCode")
        })
      });
    } catch {
      setLoading(false);
      setMessage("Não foi possível conectar ao servidor.");
      return;
    }

    const data = await response.json().catch(() => ({} as { error?: string }));

    if (!response.ok) {
      setLoading(false);
      setMessage(data.error || "Não foi possível entrar no portal.");
      return;
    }

    window.location.assign("/portal");
  }

  return (
    <form className="form portal-login-form" onSubmit={handleSubmit}>
      <label>
        E-mail ou telefone
        <input name="identifier" required placeholder="paciente@email.com" />
      </label>
      <label>
        Código de acesso
        <input name="accessCode" required placeholder="Ex.: A1B2C3D4" />
      </label>
      {message ? <p className="form-message error">{message}</p> : null}
      <button className="button" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar no portal"}
      </button>
    </form>
  );
}
