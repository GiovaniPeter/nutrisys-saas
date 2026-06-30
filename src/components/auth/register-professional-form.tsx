"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Specialty = {
  value: string;
  label: string;
  council: string;
  councilPlaceholder: string;
};

const specialties: Specialty[] = [
  { value: "medico", label: "Médico(a)", council: "CRM", councilPlaceholder: "CRM/UF 000000" },
  { value: "psicologo", label: "Psicólogo(a)", council: "CRP", councilPlaceholder: "CRP 00/00000" },
  { value: "fisioterapeuta", label: "Fisioterapeuta", council: "CREFITO", councilPlaceholder: "CREFITO-0/000000-F" },
  { value: "fonoaudiologo", label: "Fonoaudiólogo(a)", council: "CRFa", councilPlaceholder: "CRFa 0-0000" },
  { value: "dentista", label: "Dentista", council: "CRO", councilPlaceholder: "CRO/UF 00000" },
  { value: "educador-fisico", label: "Educador(a) Físico(a)", council: "CREF", councilPlaceholder: "CREF 000000-G/UF" },
  { value: "enfermeiro", label: "Enfermeiro(a)", council: "COREN", councilPlaceholder: "COREN/UF 000000" },
  { value: "terapeuta-ocupacional", label: "Terapeuta Ocupacional", council: "CREFITO", councilPlaceholder: "CREFITO-0/000000-TO" },
  { value: "farmaceutico", label: "Farmacêutico(a)", council: "CRF", councilPlaceholder: "CRF/UF 00000" },
  { value: "biomedico", label: "Biomédico(a)", council: "CRBM", councilPlaceholder: "CRBM 00000" }
];

type RegisterProfessionalFormProps = {
  initialPlanCode?: string;
};

export function RegisterProfessionalForm({ initialPlanCode = "professional" }: RegisterProfessionalFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty>(specialties[0]);

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
        planCode: form.get("planCode"),
        specialty: form.get("specialty"),
        councilRegistration: form.get("councilRegistration")
      })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível criar a conta.");
    router.push("/dashboard");
    router.refresh();
  }

  function handleSpecialtyChange(value: string) {
    const found = specialties.find((s) => s.value === value);
    if (found) setSelectedSpecialty(found);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Especialidade
        <select
          name="specialty"
          required
          defaultValue={specialties[0].value}
          onChange={(e) => handleSpecialtyChange(e.target.value)}
        >
          {specialties.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Registro no {selectedSpecialty.council}
        <input
          name="councilRegistration"
          placeholder={selectedSpecialty.councilPlaceholder}
        />
      </label>
      <label>
        Nome completo
        <input name="name" required minLength={3} placeholder="Dr. João Silva" />
      </label>
      <label>
        E-mail
        <input name="email" type="email" required placeholder="joao@clinica.com" />
      </label>
      <label>
        Senha
        <input name="password" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" />
      </label>
      <label>
        Nome da clínica
        <input name="organizationName" required placeholder="Clínica Saúde Integral" />
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
