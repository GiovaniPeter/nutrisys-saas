"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Patient = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  sex: "MALE" | "FEMALE" | "OTHER" | "UNINFORMED";
  heightCm: string | number | null;
  weightKg: string | number | null;
  goal: string | null;
  notes: string | null;
  lgpdConsentAt: string | null;
  portalAccessCode: string | null;
  portalEnabled: boolean;
};

type PatientsResponse = {
  patients: Patient[];
};

const sexLabels: Record<Patient["sex"], string> = {
  FEMALE: "Feminino",
  MALE: "Masculino",
  OTHER: "Outro",
  UNINFORMED: "Nao informado"
};

export function PatientsClient() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [portalPatientId, setPortalPatientId] = useState<string | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const totalPatients = patients.length;
  const consentedPatients = useMemo(
    () => patients.filter((patient) => Boolean(patient.lgpdConsentAt)).length,
    [patients]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadPatients(query);
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const editing = Boolean(editingPatient);

  async function loadPatients(search = "") {
    setLoading(true);
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("q", search.trim());
    }

    const response = await fetch(`/api/patients${params.size ? `?${params}` : ""}`);
    const data = (await response.json()) as PatientsResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar pacientes.");
      return;
    }

    setPatients(data.patients);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSaving(true);
    setMessage(null);

    const form = new FormData(formElement);
    const payload = getPatientPayload(form);
    const response = await fetch(editingPatient ? `/api/patients/${editingPatient.id}` : "/api/patients", {
      method: editingPatient ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel cadastrar o paciente.");
      return;
    }

    if (editingPatient) {
      setEditingPatient(null);
      setMessage("Paciente atualizado com sucesso.");
    } else {
      formElement.reset();
      setMessage("Paciente cadastrado com sucesso.");
    }

    await loadPatients(query);
  }

  async function handleDelete(patient: Patient) {
    const confirmed = window.confirm(`Excluir ${patient.name}? Esta acao nao pode ser desfeita.`);

    if (!confirmed) {
      return;
    }

    setDeletingId(patient.id);
    setMessage(null);

    const response = await fetch(`/api/patients/${patient.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel excluir o paciente.");
      return;
    }

    if (editingPatient?.id === patient.id) {
      setEditingPatient(null);
    }

    setMessage("Paciente excluido com sucesso.");
    await loadPatients(query);
  }

  async function updatePortalAccess(patient: Patient, action: "generate" | "rotate" | "disable") {
    if (action === "rotate") {
      const confirmed = window.confirm(`Gerar um novo codigo para ${patient.name}? O codigo antigo para de funcionar.`);

      if (!confirmed) {
        return;
      }
    }

    setPortalPatientId(patient.id);
    setMessage(null);

    const response = await fetch(`/api/patients/${patient.id}/portal-access`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const data = (await response.json()) as { error?: string; patient?: Patient; portalUrl?: string };
    setPortalPatientId(null);

    if (!response.ok || !data.patient) {
      setMessage(data.error || "Nao foi possivel atualizar o acesso ao portal.");
      return;
    }

    const nextPatients = patients.map((item) => (item.id === patient.id ? { ...item, ...data.patient } : item));
    setPatients(nextPatients);

    if (editingPatient?.id === patient.id) {
      setEditingPatient({ ...editingPatient, ...data.patient });
    }

    if (action === "disable") {
      setMessage(`Portal de ${patient.name} desativado.`);
      return;
    }

    setMessage(`Portal ativo para ${patient.name}. Codigo: ${data.patient.portalAccessCode}. Link: ${data.portalUrl || "/portal/login"}`);
  }

  async function copyPortalInvite(patient: Patient) {
    if (!patient.portalAccessCode) {
      setMessage("Gere o acesso do portal antes de copiar o convite.");
      return;
    }

    const invite = buildPortalInvite(patient);

    try {
      await navigator.clipboard.writeText(invite);
      setMessage(`Convite do portal de ${patient.name} copiado.`);
    } catch {
      setMessage(invite);
    }
  }

  return (
    <section className="workspace-grid">
      <div className="surface patient-list">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Base da clinica</span>
            <h2>Lista de pacientes</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo de pacientes">
            <span>{totalPatients} total</span>
            <span>{consentedPatients} LGPD</span>
          </div>
        </div>

        <label className="search-field">
          <span>Buscar</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome do paciente"
          />
        </label>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>Objetivo</th>
                <th>LGPD</th>
                <th>Portal</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className={editingPatient?.id === patient.id ? "selected-row" : undefined}>
                  <td>
                    <strong>{patient.name}</strong>
                    <span>{sexLabels[patient.sex]}</span>
                  </td>
                  <td>
                    <strong>{patient.phone || "Sem telefone"}</strong>
                    <span>{patient.email || "Sem e-mail"}</span>
                  </td>
                  <td>{patient.goal || "Nao informado"}</td>
                  <td>
                    <span className={patient.lgpdConsentAt ? "status-pill ok" : "status-pill"}>
                      {patient.lgpdConsentAt ? "Consentido" : "Pendente"}
                    </span>
                  </td>
                  <td>
                    <span className={patient.portalEnabled ? "status-pill ok" : "status-pill"}>
                      {patient.portalEnabled ? "Ativo" : "Inativo"}
                    </span>
                      {patient.portalAccessCode ? <span className="code-pill">{patient.portalAccessCode}</span> : null}
                  </td>
                  <td>
                    <div className="row-actions">
                      <a className="text-button" href={`/patients/${patient.id}`}>
                        Prontuario
                      </a>
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => {
                          setEditingPatient(patient);
                          setMessage(null);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="text-button"
                        type="button"
                        disabled={portalPatientId === patient.id}
                        onClick={() => void updatePortalAccess(patient, patient.portalAccessCode ? "rotate" : "generate")}
                      >
                        {portalPatientId === patient.id ? "Aguarde..." : patient.portalAccessCode ? "Novo codigo" : "Gerar portal"}
                      </button>
                      {patient.portalAccessCode ? (
                        <>
                          <button className="text-button" type="button" onClick={() => void copyPortalInvite(patient)}>
                            Copiar convite
                          </button>
                          {patient.phone ? (
                            <a className="text-button" href={buildWhatsappUrl(patient)} target="_blank" rel="noreferrer">
                              WhatsApp
                            </a>
                          ) : null}
                        </>
                      ) : null}
                      {patient.portalEnabled ? (
                        <button
                          className="text-button danger"
                          type="button"
                          disabled={portalPatientId === patient.id}
                          onClick={() => void updatePortalAccess(patient, "disable")}
                        >
                          Desativar
                        </button>
                      ) : null}
                      <button
                        className="text-button danger"
                        type="button"
                        disabled={deletingId === patient.id}
                        onClick={() => void handleDelete(patient)}
                      >
                        {deletingId === patient.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              ) : null}

              {loading ? (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    Carregando pacientes...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">{editing ? "Edicao" : "Novo cadastro"}</span>
        <h2>{editing ? "Editar paciente" : "Adicionar paciente"}</h2>
        <form key={editingPatient?.id || "new"} className="form compact-form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input
              name="name"
              required
              minLength={2}
              placeholder="Nome completo"
              defaultValue={editingPatient?.name || ""}
            />
          </label>
          <label>
            E-mail
            <input name="email" type="email" placeholder="paciente@email.com" defaultValue={editingPatient?.email || ""} />
          </label>
          <label>
            Telefone
            <input name="phone" placeholder="(00) 00000-0000" defaultValue={editingPatient?.phone || ""} />
          </label>
          <div className="form-row">
            <label>
              Nascimento
              <input name="birthDate" type="date" defaultValue={formatDateInput(editingPatient?.birthDate)} />
            </label>
            <label>
              Sexo
              <select name="sex" defaultValue={editingPatient?.sex || "UNINFORMED"}>
                <option value="UNINFORMED">Nao informado</option>
                <option value="FEMALE">Feminino</option>
                <option value="MALE">Masculino</option>
                <option value="OTHER">Outro</option>
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Altura cm
              <input
                name="heightCm"
                type="number"
                min="1"
                step="0.01"
                placeholder="165"
                defaultValue={editingPatient?.heightCm?.toString() || ""}
              />
            </label>
            <label>
              Peso kg
              <input
                name="weightKg"
                type="number"
                min="1"
                step="0.01"
                placeholder="68.5"
                defaultValue={editingPatient?.weightKg?.toString() || ""}
              />
            </label>
          </div>
          <label>
            Objetivo
            <input name="goal" placeholder="Emagrecimento, hipertrofia..." defaultValue={editingPatient?.goal || ""} />
          </label>
          <label>
            Observacoes
            <textarea name="notes" rows={4} placeholder="Notas iniciais do atendimento" defaultValue={editingPatient?.notes || ""} />
          </label>
          <label className="checkbox-label">
            <input name="lgpdConsent" type="checkbox" defaultChecked={Boolean(editingPatient?.lgpdConsentAt)} />
            <span>Paciente autorizou o tratamento de dados de saude.</span>
          </label>
          <button className="button" type="submit" disabled={saving}>
            {saving ? "Salvando..." : editing ? "Salvar alteracoes" : "Cadastrar paciente"}
          </button>
          {editing ? (
            <button className="button secondary" type="button" onClick={() => setEditingPatient(null)}>
              Cancelar edicao
            </button>
          ) : null}
        </form>
      </aside>
    </section>
  );
}

function getPatientPayload(form: FormData) {
  const birthDate = String(form.get("birthDate") || "");
  const heightCm = String(form.get("heightCm") || "");
  const weightKg = String(form.get("weightKg") || "");

  return {
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone"),
    birthDate: birthDate ? new Date(`${birthDate}T00:00:00.000Z`).toISOString() : "",
    sex: form.get("sex"),
    heightCm: heightCm || undefined,
    weightKg: weightKg || undefined,
    goal: form.get("goal"),
    notes: form.get("notes"),
    lgpdConsent: form.get("lgpdConsent") === "on"
  };
}

function formatDateInput(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function buildPortalInvite(patient: Patient) {
  const portalUrl = `${window.location.origin}/portal/login`;
  const identifier = patient.email || patient.phone || "seu e-mail ou telefone cadastrado";

  return [
    `Ola, ${patient.name}!`,
    "Seu portal do paciente ja esta disponivel.",
    `Acesse: ${portalUrl}`,
    `Login: ${identifier}`,
    `Codigo: ${patient.portalAccessCode}`,
    "Por la voce consegue ver seu plano alimentar, agenda e evolucao."
  ].join("\n");
}

function buildWhatsappUrl(patient: Patient) {
  const phone = patient.phone?.replace(/\D/g, "") || "";
  const phoneWithCountry = phone.startsWith("55") ? phone : `55${phone}`;
  const text = encodeURIComponent(buildPortalInvite(patient));

  return `https://wa.me/${phoneWithCountry}?text=${text}`;
}
