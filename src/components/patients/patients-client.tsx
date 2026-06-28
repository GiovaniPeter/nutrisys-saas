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
  const [birthDateQuery, setBirthDateQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [portalPatientId, setPortalPatientId] = useState<string | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [screen, setScreen] = useState<"list" | "form">("list");

  const totalPatients = patients.length;
  const consentedPatients = useMemo(
    () => patients.filter((patient) => Boolean(patient.lgpdConsentAt)).length,
    [patients]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadPatients(query, birthDateQuery);
    }, query.trim() || birthDateQuery ? 220 : 0);

    return () => window.clearTimeout(timeout);
  }, [query, birthDateQuery]);

  const editing = Boolean(editingPatient);

  function startEditing(patient: Patient) {
    setEditingPatient(patient);
    setMessage(null);
    setScreen("form");
  }

  function startNewPatient() {
    setEditingPatient(null);
    setMessage(null);
    setScreen("form");
  }

  function closePatientForm() {
    setEditingPatient(null);
    setMessage(null);
    setScreen("list");
  }

  async function loadPatients(search = "", birthDate = "") {
    setLoading(true);
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("q", search.trim());
    }

    if (birthDate) {
      params.set("birthDate", birthDate);
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

    await loadPatients(query, birthDateQuery);
    setScreen("list");
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
    await loadPatients(query, birthDateQuery);
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

  if (screen === "form") {
    return (
      <section className="patient-form-screen">
        <section className="surface patient-form-panel patient-form-panel-full">
        <div className="section-title-row patient-form-heading">
          <div>
            <span className="eyebrow">{editing ? "Edicao" : "Novo cadastro"}</span>
            <h2>{editing ? `Editar ${editingPatient?.name}` : "Adicionar paciente"}</h2>
            <p>Preencha os dados principais para iniciar o prontuario e o acompanhamento nutricional.</p>
          </div>
          <button className="text-button" type="button" onClick={closePatientForm}>
            Voltar para pacientes
          </button>
        </div>

        {message ? <p className="form-message neutral patients-feedback">{message}</p> : null}

        <form
          key={editingPatient?.id || "new"}
          className="patient-form-grid"
          onSubmit={handleSubmit}
        >
          <label className="patient-field-half">
            Nome
            <input
              name="name"
              required
              minLength={2}
              placeholder="Nome completo"
              defaultValue={editingPatient?.name || ""}
            />
          </label>
          <label className="patient-field-quarter">
            E-mail
            <input name="email" type="email" placeholder="paciente@email.com" defaultValue={editingPatient?.email || ""} />
          </label>
          <label className="patient-field-quarter">
            Telefone
            <input name="phone" placeholder="(00) 00000-0000" defaultValue={editingPatient?.phone || ""} />
          </label>
          <label className="patient-field-quarter">
            Nascimento
            <input name="birthDate" type="date" defaultValue={formatDateInput(editingPatient?.birthDate)} />
          </label>
          <label className="patient-field-quarter">
            Sexo
            <select name="sex" defaultValue={editingPatient?.sex || "UNINFORMED"}>
              <option value="UNINFORMED">Nao informado</option>
              <option value="FEMALE">Feminino</option>
              <option value="MALE">Masculino</option>
              <option value="OTHER">Outro</option>
            </select>
          </label>
          <label className="patient-field-quarter">
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
          <label className="patient-field-quarter">
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
          <label className="patient-field-half">
            Objetivo
            <input name="goal" placeholder="Emagrecimento, hipertrofia..." defaultValue={editingPatient?.goal || ""} />
          </label>
          <label className="patient-field-half">
            Observacoes
            <textarea name="notes" rows={3} placeholder="Notas iniciais do atendimento" defaultValue={editingPatient?.notes || ""} />
          </label>
          <label className="checkbox-label patient-field-full">
            <input name="lgpdConsent" type="checkbox" defaultChecked={Boolean(editingPatient?.lgpdConsentAt)} />
            <span>Paciente autorizou o tratamento de dados de saude.</span>
          </label>
          <div className="patient-form-actions patient-field-full">
            <button className="button" type="submit" disabled={saving}>
              {saving ? "Salvando..." : editing ? "Salvar alteracoes" : "Cadastrar paciente"}
            </button>
            <button className="button secondary" type="button" onClick={closePatientForm}>
              Cancelar
            </button>
          </div>
        </form>
      </section>
    </section>
    );
  }

  return (
    <section className="patients-page-layout">
      {message ? <p className="form-message neutral patients-feedback">{message}</p> : null}

      <section className="surface patient-list">
        <div className="section-title-row">
          <div className="patient-search-grid" style={{ marginBottom: 0, gap: '12px' }}>
            <label className="search-field" style={{ margin: 0 }}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome..."
                style={{ minWidth: '240px' }}
              />
            </label>
            <label className="search-field" style={{ margin: 0 }}>
              <input
                type="date"
                value={birthDateQuery}
                onChange={(event) => setBirthDateQuery(event.target.value)}
              />
            </label>
            {query || birthDateQuery ? (
              <button
                className="button secondary"
                type="button"
                onClick={() => {
                  setQuery("");
                  setBirthDateQuery("");
                }}
              >
                Limpar
              </button>
            ) : null}
          </div>
          <div className="patient-list-header-actions">
            <div className="mini-stats" aria-label="Resumo de pacientes">
              <span><strong>{totalPatients}</strong> total</span>
              <span><strong>{consentedPatients}</strong> LGPD</span>
            </div>
            <button className="button" type="button" onClick={startNewPatient}>
              Adicionar paciente
            </button>
          </div>
        </div>

        {patients.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Idade</th>
                  <th>Contato</th>
                  <th>Status LGPD</th>
                  <th>Portal</th>
                  <th style={{ width: "220px" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className={editingPatient?.id === patient.id ? "selected-row" : undefined}>
                    <td>
                      <strong>{patient.name}</strong>
                      <span>{sexLabels[patient.sex]}</span>
                    </td>
                    <td>{formatDisplayDate(patient.birthDate)}</td>
                    <td className="patient-contact-cell">
                      <strong>{formatPhone(patient.phone)}</strong>
                      <span className="truncate" title={patient.email || ""}>{patient.email || "Sem e-mail"}</span>
                    </td>
                    <td>
                      <span className={patient.lgpdConsentAt ? "status-dot ok" : "status-dot"} title={patient.lgpdConsentAt ? "Consentido" : "Pendente"}>
                        {patient.lgpdConsentAt ? "Consentido" : "Pendente"}
                      </span>
                    </td>
                    <td>
                      <span className={patient.portalEnabled ? "status-dot ok" : "status-dot"} title={patient.portalEnabled ? "Ativo" : "Inativo"}>
                        {patient.portalEnabled ? "Ativo" : "Inativo"}
                      </span>
                        {patient.portalAccessCode ? <span className="code-pill code-pill-small" title="Código de Acesso">{patient.portalAccessCode}</span> : null}
                    </td>
                    <td className="patient-actions-cell">
                      <div className="row-actions">
                        <a className="button" href={`/patients/${patient.id}`}>
                          Prontuário
                        </a>
                        <button
                          className="icon-button"
                          type="button"
                          title="Editar"
                          onClick={() => startEditing(patient)}
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          className="icon-button"
                          type="button"
                          title={portalPatientId === patient.id ? "Aguarde..." : patient.portalAccessCode ? "Novo código" : "Gerar portal"}
                          disabled={portalPatientId === patient.id}
                          onClick={() => void updatePortalAccess(patient, patient.portalAccessCode ? "rotate" : "generate")}
                        >
                          <Icon name="key" />
                        </button>
                        {patient.portalAccessCode ? (
                          <>
                            <button className="icon-button" type="button" title="Copiar convite" onClick={() => void copyPortalInvite(patient)}>
                              <Icon name="copy" />
                            </button>
                            {patient.phone ? (
                              <a className="icon-button whatsapp-color" title="WhatsApp" href={buildWhatsappUrl(patient)} target="_blank" rel="noreferrer">
                                <Icon name="message" />
                              </a>
                            ) : null}
                          </>
                        ) : null}
                        {patient.portalEnabled ? (
                          <button
                            className="icon-button text-danger"
                            type="button"
                            title="Desativar portal"
                            disabled={portalPatientId === patient.id}
                            onClick={() => void updatePortalAccess(patient, "disable")}
                          >
                            <Icon name="off" />
                          </button>
                        ) : null}
                        <button
                          className="icon-button text-danger"
                          type="button"
                          title="Excluir paciente"
                          disabled={deletingId === patient.id}
                          onClick={() => void handleDelete(patient)}
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {loading ? (
          <div className="table-responsive">
            <table className="data-table">
              <tbody>
                <tr>
                  <td colSpan={7} className="empty-cell">
                    Carregando pacientes...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : !loading && patients.length === 0 ? (
          <p className="empty-state">Nenhum paciente encontrado.</p>
        ) : null}
      </section>
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

function formatDisplayDate(value: string | null | undefined) {
  if (!value) {
    return "Nao informada";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(value));
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

function formatPhone(phone: string | null) {
  if (!phone) return "Sem telefone";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return phone;
}

function Icon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const icons: Record<string, React.ReactNode> = {
    edit: <><path d="M12 20h9" {...common} /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" {...common} /></>,
    key: <><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" {...common} /></>,
    trash: <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" {...common} /></>,
    message: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" {...common} /></>,
    copy: <><rect width="14" height="14" x="8" y="8" rx="2" ry="2" {...common} /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" {...common} /></>,
    off: <><path d="M18.36 6.64A9 9 0 0 1 20.77 15M12 2v10M3 3l18 18" {...common} /><path d="M15.536 21A8.99 8.99 0 0 1 3 13c0-2.3.8-4.4 2.1-6" {...common} /></>
  };
  return <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">{icons[name]}</svg>;
}
