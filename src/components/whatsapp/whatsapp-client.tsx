"use client";

import { useEffect, useMemo, useState } from "react";

type PatientOption = {
  id: string;
  name: string;
  phone: string | null;
  email?: string | null;
  weightKg?: string | number | null;
};

type Appointment = {
  id: string;
  startsAt: string;
  type: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
  patient: PatientOption;
};

type PatientsResponse = {
  patients: PatientOption[];
};

type AppointmentsResponse = {
  appointments: Appointment[];
};

type Template = {
  key: string;
  title: string;
  text: string;
};

export function WhatsAppClient() {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const templates = useMemo(() => buildTemplates(selectedPatient), [selectedPatient]);
  const phoneReadyPatients = patients.filter((patient) => patient.phone).length;
  const pendingReminders = appointments.filter((appointment) => appointment.patient.phone && appointment.status !== "CANCELED");

  useEffect(() => {
    void boot();
  }, []);

  async function boot() {
    setLoading(true);
    const [loadedPatients] = await Promise.all([loadPatients(), loadAppointments()]);
    setLoading(false);

    if (loadedPatients.length) {
      const firstWithPhone = loadedPatients.find((patient) => patient.phone) || loadedPatients[0];
      setSelectedPatientId(firstWithPhone.id);
    }
  }

  async function loadPatients() {
    const response = await fetch("/api/patients");
    const data = (await response.json()) as PatientsResponse & { error?: string };

    if (!response.ok) {
      setNotice(data.error || "Nao foi possivel carregar pacientes.");
      return [];
    }

    setPatients(data.patients);
    return data.patients;
  }

  async function loadAppointments() {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 7);

    const params = new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString()
    });

    const response = await fetch(`/api/appointments?${params}`);
    const data = (await response.json()) as AppointmentsResponse & { error?: string };

    if (!response.ok) {
      setNotice(data.error || "Nao foi possivel carregar lembretes.");
      return [];
    }

    setAppointments(data.appointments);
    return data.appointments;
  }

  function applyTemplate(template: Template) {
    setCustomMessage(template.text);
    setNotice(`Template "${template.title}" aplicado.`);
  }

  function sendCustom() {
    if (!selectedPatient) return;
    openPatientWhatsApp(selectedPatient, customMessage, setNotice);
  }

  function sendTemplate(template: Template) {
    if (!selectedPatient) return;
    openPatientWhatsApp(selectedPatient, template.text, setNotice);
  }

  function sendAppointmentReminder(appointment: Appointment) {
    openPatientWhatsApp(appointment.patient, buildAppointmentReminder(appointment), setNotice);
  }

  return (
    <section className="workspace-grid whatsapp-layout">
      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Envio rapido</span>
            <h2>Mensagem para paciente</h2>
          </div>
          <div className="mini-stats">
            <span>{phoneReadyPatients} com telefone</span>
            <span>{patients.length} pacientes</span>
          </div>
        </div>

        {notice ? <p className="form-message neutral">{notice}</p> : null}

        <div className="filters-row whatsapp-filters">
          <label>
            Paciente
            <select className="inline-select" value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} {patient.phone ? `- ${patient.phone}` : "- sem telefone"}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedPatient?.phone ? (
          <>
            <div className="wa-template-grid">
              {templates.map((template) => (
                <article className="wa-template-card" key={template.key}>
                  <div>
                    <strong>{template.title}</strong>
                    <p>{template.text}</p>
                  </div>
                  <div className="row-actions">
                    <button className="text-button" type="button" onClick={() => applyTemplate(template)}>
                      Usar
                    </button>
                    <button className="text-button" type="button" onClick={() => sendTemplate(template)}>
                      Enviar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="wa-compose">
              <label>
                Mensagem personalizada
                <textarea value={customMessage} rows={5} maxLength={1000} onChange={(event) => setCustomMessage(event.target.value)} />
              </label>
              <button className="button" type="button" disabled={!customMessage.trim()} onClick={sendCustom}>
                Enviar pelo WhatsApp
              </button>
            </div>
          </>
        ) : (
          <p className="empty-card">{loading ? "Carregando pacientes..." : "Selecione um paciente com telefone cadastrado."}</p>
        )}
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">Agenda</span>
        <h2>Lembretes proximos</h2>
        <div className="compact-list whatsapp-reminders">
          {pendingReminders.map((appointment) => (
            <article key={appointment.id}>
              <strong>{appointment.patient.name}</strong>
              <span>
                {appointment.type} - {formatDateTime(appointment.startsAt)}
              </span>
              <button className="text-button" type="button" onClick={() => sendAppointmentReminder(appointment)}>
                Enviar lembrete
              </button>
            </article>
          ))}
          {!loading && pendingReminders.length === 0 ? <p className="empty-card">Nenhum lembrete com telefone nos proximos 7 dias.</p> : null}
          {loading ? <p className="empty-card">Carregando agenda...</p> : null}
        </div>
      </aside>
    </section>
  );
}

function buildTemplates(patient?: PatientOption): Template[] {
  const name = firstName(patient?.name || "[Nome]");
  const waterTarget = patient?.weightKg ? `${Math.round(Number(patient.weightKg) * 35)} ml` : "2 litros";

  return [
    {
      key: "greeting",
      title: "Boas-vindas",
      text: `Ola ${name}! Seja bem-vindo(a). Estou feliz em acompanhar sua jornada de saude.`
    },
    {
      key: "appointment",
      title: "Confirmar consulta",
      text: `Ola ${name}! Passando para confirmar sua proxima consulta. Pode me confirmar presenca?`
    },
    {
      key: "plan",
      title: "Plano alimentar",
      text: `Ola ${name}! Seu plano alimentar ja esta disponivel no portal. Me avise se tiver alguma duvida.`
    },
    {
      key: "water",
      title: "Hidratacao",
      text: `${name}, lembrete rapido: tente bater sua meta de agua hoje. Alvo sugerido: ${waterTarget}.`
    },
    {
      key: "motivation",
      title: "Motivacional",
      text: `${name}, cada escolha consistente conta. Siga no plano e me chame se precisar ajustar algo.`
    },
    {
      key: "return",
      title: "Retorno",
      text: `Ola ${name}! Vamos agendar seu retorno para acompanhar seu progresso?`
    }
  ];
}

function openPatientWhatsApp(patient: PatientOption, text: string, setNotice: (value: string) => void) {
  if (!patient.phone) {
    setNotice("Paciente sem telefone cadastrado.");
    return;
  }

  if (!text.trim()) {
    setNotice("Digite ou escolha uma mensagem antes de enviar.");
    return;
  }

  const phone = normalizePhone(patient.phone);
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  setNotice(`Mensagem aberta para ${patient.name}.`);
}

function buildAppointmentReminder(appointment: Appointment) {
  return [
    `Ola ${firstName(appointment.patient.name)}!`,
    `Lembrete da sua consulta: ${appointment.type}.`,
    `Data e horario: ${formatDateTime(appointment.startsAt)}.`,
    "Pode confirmar sua presenca?"
  ].join("\n");
}

function normalizePhone(phone: string) {
  const clean = phone.replace(/\D/g, "");
  return clean.startsWith("55") ? clean : `55${clean}`;
}

function firstName(name: string) {
  return name.split(" ")[0] || name;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}
