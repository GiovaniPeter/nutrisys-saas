"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";

type PatientOption = {
  id: string;
  name: string;
  phone: string | null;
};

type Appointment = {
  id: string;
  patientId: string;
  startsAt: string;
  endsAt: string | null;
  type: string;
  status: AppointmentStatus;
  notes: string | null;
  patient: PatientOption;
  professional: {
    id: string;
    name: string;
  } | null;
};

type PatientsResponse = {
  patients: PatientOption[];
};

type AppointmentsResponse = {
  appointments: Appointment[];
};

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Concluida",
  CANCELED: "Cancelada",
  NO_SHOW: "Faltou"
};

export function AppointmentsClient() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(() => searchParams.get("patientId") || "");
  const [screen, setScreen] = useState<"list" | "form" | "payment">("list");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [payingAppointment, setPayingAppointment] = useState<Appointment | null>(null);
  const [fromDate, setFromDate] = useState(() => formatDateInput(startOfToday()));
  const [toDate, setToDate] = useState(() => formatDateInput(addDays(startOfToday(), 7)));

  const editing = Boolean(editingAppointment);
  const totalAppointments = appointments.length;
  const confirmedAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === "CONFIRMED").length,
    [appointments]
  );

  useEffect(() => {
    void loadPatients();
  }, []);

  useEffect(() => {
    void loadAppointments();
  }, [fromDate, toDate, selectedPatientId]);

  async function loadPatients() {
    const response = await fetch("/api/patients");
    const data = (await response.json()) as PatientsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar pacientes.");
      return;
    }

    setPatients(data.patients);
  }

  async function loadAppointments() {
    setLoading(true);
    const params = new URLSearchParams();

    if (fromDate) {
      params.set("from", new Date(`${fromDate}T00:00:00.000`).toISOString());
    }

    if (toDate) {
      params.set("to", new Date(`${toDate}T23:59:59.999`).toISOString());
    }

    if (selectedPatientId) {
      params.set("patientId", selectedPatientId);
    }

    const response = await fetch(`/api/appointments?${params}`);
    const data = (await response.json()) as AppointmentsResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar a agenda.");
      return;
    }

    setAppointments(data.appointments);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = getAppointmentPayload(form);

    setSaving(true);
    setMessage(null);

    const response = await fetch(
      editingAppointment ? `/api/appointments/${editingAppointment.id}` : "/api/appointments",
      {
        method: editingAppointment ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel salvar a consulta.");
      return;
    }

    if (editingAppointment) {
      setEditingAppointment(null);
      setMessage("Consulta atualizada com sucesso.");
    } else {
      formElement.reset();
      setMessage("Consulta criada com sucesso.");
    }

    await loadAppointments();
    setScreen("list");
  }

  async function updateStatus(appointment: Appointment, status: AppointmentStatus) {
    setMessage(null);
    const response = await fetch(`/api/appointments/${appointment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel atualizar a consulta.");
      return;
    }

    await loadAppointments();
  }

  async function handleDelete(appointment: Appointment) {
    const confirmed = window.confirm(`Excluir consulta de ${appointment.patient.name}?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(appointment.id);
    setMessage(null);

    const response = await fetch(`/api/appointments/${appointment.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel excluir a consulta.");
      return;
    }

    if (editingAppointment?.id === appointment.id) {
      setEditingAppointment(null);
    }

    setMessage("Consulta excluida com sucesso.");
    await loadAppointments();
  }

  async function copyAppointmentReminder(appointment: Appointment) {
    const reminder = buildAppointmentReminder(appointment);

    try {
      await navigator.clipboard.writeText(reminder);
      setMessage(`Lembrete de ${appointment.patient.name} copiado.`);
    } catch {
      setMessage(reminder);
    }
  }

  function openCreateForm() {
    setEditingAppointment(null);
    setMessage(null);
    setScreen("form");
  }

  function openEditForm(appointment: Appointment) {
    setEditingAppointment(appointment);
    setMessage(null);
    setScreen("form");
  }

  function closeForm() {
    setEditingAppointment(null);
    setPayingAppointment(null);
    setMessage(null);
    setScreen("list");
  }

  async function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const amountStr = formData.get("amount") as string;
    const amountCents = Math.round(parseFloat(amountStr.replace(",", ".")) * 100);
    const paidAtStr = formData.get("paidAt") as string;
    
    const dueDate = new Date(payingAppointment!.startsAt).toISOString();
    const paidAt = new Date(`${paidAtStr}T12:00:00Z`).toISOString();

    const data = {
      patientId: payingAppointment!.patientId,
      type: "INCOME",
      status: "PAID",
      description: formData.get("description"),
      amountCents,
      dueDate,
      paidAt,
      paymentMethod: formData.get("paymentMethod")
    };

    const response = await fetch("/api/financial/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const result = await response.json();
      setMessage(result.error || "Nao foi possivel registrar o pagamento.");
      setSaving(false);
      return;
    }
    
    setScreen("list");
    setPayingAppointment(null);
    setSaving(false);
    alert("Pagamento registrado com sucesso no Financeiro!");
  }

  if (screen === "payment" && payingAppointment) {
    return (
      <section className="appointment-form-screen">
        <div className="surface appointment-form-panel">
          <div className="appointment-form-hero">
            <div>
              <span className="eyebrow">Recebimento</span>
              <h2>Registrar Pagamento</h2>
              <p>Registre o pagamento da consulta de {payingAppointment.patient.name}. O valor ira automaticamente para o seu painel financeiro.</p>
            </div>
            <button className="text-button" type="button" onClick={closeForm}>
              Voltar
            </button>
          </div>

          {message ? <p className="form-message neutral">{message}</p> : null}

          <form className="form appointment-form-grid" onSubmit={handlePaymentSubmit}>
            <label className="appointment-field-half">
              Valor Recebido (R$)
              <input name="amount" type="number" step="0.01" min="0" required placeholder="0.00" />
            </label>
            <label className="appointment-field-half">
              Forma de Pagamento
              <select name="paymentMethod">
                <option value="Pix">Pix</option>
                <option value="Cartao de Credito">Cartão de Crédito</option>
                <option value="Cartao de Debito">Cartão de Débito</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Transferencia">Transferência</option>
              </select>
            </label>
            <label className="appointment-field-full">
              Descricao
              <input name="description" required defaultValue={`Consulta: ${payingAppointment.type}`} />
            </label>
            <label className="appointment-field-full">
              Data de Pagamento
              <input name="paidAt" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </label>

            <button className="primary-button appointment-field-full" type="submit" disabled={saving}>
              {saving ? "Registrando..." : "Registrar Pagamento"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  if (screen === "form") {
    return (
      <section className="appointment-form-screen">
        <div className="surface appointment-form-panel">
          <div className="appointment-form-hero">
            <div>
              <span className="eyebrow">{editing ? "Edicao" : "Nova consulta"}</span>
              <h2>{editing ? "Editar consulta" : "Agendar consulta"}</h2>
              <p>
                Preencha os dados da consulta com mais espaco e menos distracao. Depois de salvar, voce volta
                automaticamente para a lista da agenda.
              </p>
            </div>
            <button className="text-button" type="button" onClick={closeForm}>
              Voltar para consultas
            </button>
          </div>

          {message ? <p className="form-message neutral">{message}</p> : null}

          <form key={editingAppointment?.id || "new"} className="form appointment-form-grid" onSubmit={handleSubmit}>
            <label className="appointment-field-wide">
              Paciente
              <select name="patientId" required defaultValue={editingAppointment?.patientId || selectedPatientId}>
                <option value="">Selecione</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="appointment-field-half">
              Inicio
              <input
                name="startsAt"
                type="datetime-local"
                required
                defaultValue={formatDateTimeInput(editingAppointment?.startsAt)}
              />
            </label>
            <label className="appointment-field-half">
              Fim
              <input name="endsAt" type="datetime-local" defaultValue={formatDateTimeInput(editingAppointment?.endsAt)} />
            </label>
            <label>
              Tipo
              <select name="type" defaultValue={editingAppointment?.type || "Consulta inicial"}>
                <option>Consulta inicial</option>
                <option>Retorno</option>
                <option>Avaliacao corporal</option>
                <option>Teleconsulta</option>
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue={editingAppointment?.status || "PENDING"}>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="appointment-field-full">
              Observacoes
              <textarea
                name="notes"
                rows={5}
                placeholder="Notas internas da consulta"
                defaultValue={editingAppointment?.notes || ""}
              />
            </label>

            {patients.length === 0 ? (
              <p className="form-message error appointment-field-full">Cadastre um paciente antes de agendar.</p>
            ) : null}

            <div className="appointment-form-actions">
              <button className="button secondary" type="button" onClick={closeForm}>
                Cancelar
              </button>
              <button className="button" type="submit" disabled={saving || patients.length === 0}>
                {saving ? "Salvando..." : editing ? "Salvar alteracoes" : "Agendar consulta"}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="appointments-page-layout">
      <div className="surface appointment-list appointment-list-full">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Periodo</span>
            <h2>Consultas</h2>
          </div>
          <div className="appointment-list-header-actions">
            <div className="mini-stats" aria-label="Resumo da agenda">
              <span>{totalAppointments} total</span>
              <span>{confirmedAppointments} confirmadas</span>
            </div>
            <button className="button" type="button" onClick={openCreateForm}>
              Nova consulta
            </button>
          </div>
        </div>

        <div className="filters-row">
          <label>
            De
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </label>
          <label>
            Ate
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </label>
          <label>
            Paciente
            <select value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>
              <option value="">Todos</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="table-wrap">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Paciente</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className={editingAppointment?.id === appointment.id ? "selected-row" : undefined}
                >
                  <td>
                    <strong>{formatDateTime(appointment.startsAt)}</strong>
                    <span>{appointment.professional?.name || "Sem profissional"}</span>
                  </td>
                  <td>
                    <strong>{appointment.patient.name}</strong>
                    <span>{appointment.patient.phone || "Sem telefone"}</span>
                  </td>
                  <td>{appointment.type}</td>
                  <td>
                    <select
                      className="inline-select"
                      value={appointment.status}
                      onChange={(event) => void updateStatus(appointment, event.target.value as AppointmentStatus)}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => openEditForm(appointment)}
                      >
                        Editar
                      </button>
                      <button 
                        className="text-button success" 
                        type="button" 
                        onClick={() => { setPayingAppointment(appointment); setScreen("payment"); }}
                      >
                        Receber
                      </button>
                      <button className="text-button" type="button" onClick={() => void copyAppointmentReminder(appointment)}>
                        Lembrete
                      </button>
                      {appointment.patient.phone ? (
                        <a className="text-button" href={buildWhatsappUrl(appointment)} target="_blank" rel="noreferrer">
                          WhatsApp
                        </a>
                      ) : null}
                      <button
                        className="text-button danger"
                        type="button"
                        disabled={deletingId === appointment.id}
                        onClick={() => void handleDelete(appointment)}
                      >
                        {deletingId === appointment.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Nenhuma consulta neste periodo.
                  </td>
                </tr>
              ) : null}

              {loading ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Carregando agenda...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </section>
  );
}

function getAppointmentPayload(form: FormData) {
  const startsAt = String(form.get("startsAt") || "");
  const endsAt = String(form.get("endsAt") || "");

  return {
    patientId: form.get("patientId"),
    startsAt: startsAt ? new Date(startsAt).toISOString() : "",
    endsAt: endsAt ? new Date(endsAt).toISOString() : "",
    type: form.get("type"),
    status: form.get("status"),
    notes: form.get("notes")
  };
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatDateTimeInput(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function buildAppointmentReminder(appointment: Appointment) {
  return [
    `Ola, ${appointment.patient.name}!`,
    `Passando para lembrar da sua consulta: ${appointment.type}.`,
    `Data e horario: ${formatDateTime(appointment.startsAt)}.`,
    "Se precisar remarcar, responda esta mensagem."
  ].join("\n");
}

function buildWhatsappUrl(appointment: Appointment) {
  const phone = appointment.patient.phone?.replace(/\D/g, "") || "";
  const phoneWithCountry = phone.startsWith("55") ? phone : `55${phone}`;
  const text = encodeURIComponent(buildAppointmentReminder(appointment));

  return `https://wa.me/${phoneWithCountry}?text=${text}`;
}
