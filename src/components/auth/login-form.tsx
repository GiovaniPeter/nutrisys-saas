"use client";

import { FormEvent, useState } from "react";

type LoginFormProps = {
  accessMode?: "nutritionist" | "secretary" | "professional";
  buttonLabel?: string;
};

export function LoginForm({ accessMode = "nutritionist", buttonLabel = "Entrar" }: LoginFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    let response: Response;

    try {
      response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          accessMode
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
      setMessage(data.error || "Não foi possível entrar.");
      return;
    }

    window.location.assign("/dashboard");
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        E-mail
        <input name="email" type="email" required placeholder="voce@clinica.com" />
      </label>
      <label>
        Senha
        <input name="password" type="password" required placeholder="Sua senha" />
      </label>
      {message ? <p className="form-message error">{message}</p> : null}
      <button className="button" type="submit" disabled={loading}>
        {loading ? "Entrando..." : buttonLabel}
      </button>
    </form>
  );
}
