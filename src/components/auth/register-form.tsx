"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type RegisterFormProps = {
  initialPlanCode?: string;
};

export function RegisterForm({ initialPlanCode = "professional" }: RegisterFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        organizationName: form.get("organizationName"),
        planCode: form.get("planCode")
      })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível criar a conta.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Nome completo
        <input name="name" required minLength={3} placeholder="Dra. Maria Silva" />
      </label>
      <label>
        E-mail
        <input name="email" type="email" required placeholder="maria@clinica.com" />
      </label>
      <label>
        Senha
        <input name="password" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" />
      </label>
      <label>
        Nome da clínica
        <input name="organizationName" required placeholder="Clínica NutriVida" />
      </label>
      <label>
        Plano inicial
        <select name="planCode" defaultValue={initialPlanCode}>
          <option value="essential">Essencial</option>
          <option value="professional">Profissional</option>
          <option value="clinic">Clínica</option>
        </select>
      </label>
      {message ? <p className="form-message error">{message}</p> : null}
      <button className="button" type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar conta e iniciar trial"}
      </button>
    </form>
  );
}
