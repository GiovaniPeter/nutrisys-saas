"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type PatientOption = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type ChatSender = "PROFESSIONAL" | "PATIENT";

type ChatMessage = {
  id: string;
  patientId: string;
  sender: ChatSender;
  text: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  readByProfessionalAt: string | null;
  readByPatientAt: string | null;
  createdAt: string;
  patient?: PatientOption;
};

type PatientsResponse = {
  patients: PatientOption[];
};

type MessagesResponse = {
  messages: ChatMessage[];
};

type PatientSummary = PatientOption & {
  lastMessage?: ChatMessage;
  unread: number;
};

export function ChatClient() {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [summaryMessages, setSummaryMessages] = useState<ChatMessage[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const threadRef = useRef<HTMLDivElement | null>(null);

  const summaries = useMemo<PatientSummary[]>(() => {
    return patients.map((patient) => {
      const patientMessages = summaryMessages.filter((item) => item.patientId === patient.id);
      const lastMessage = patientMessages[patientMessages.length - 1];
      const unread = patientMessages.filter((item) => item.sender === "PATIENT" && !item.readByProfessionalAt).length;
      return { ...patient, lastMessage, unread };
    });
  }, [patients, summaryMessages]);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const jitsiUrl = selectedPatient ? `https://meet.jit.si/nutriplan-pro-${selectedPatient.id.slice(0, 10)}` : "";

  useEffect(() => {
    void boot();
  }, []);

  useEffect(() => {
    if (!selectedPatientId) return;
    void loadThread(selectedPatientId);
  }, [selectedPatientId]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function boot() {
    setLoading(true);
    const [patientsResult] = await Promise.all([loadPatients(), loadSummary()]);
    setLoading(false);

    if (patientsResult.length && !selectedPatientId) {
      setSelectedPatientId(patientsResult[0].id);
    }
  }

  async function loadPatients() {
    const response = await fetch("/api/patients");
    const data = (await response.json()) as PatientsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar pacientes.");
      return [];
    }

    setPatients(data.patients);
    return data.patients;
  }

  async function loadSummary() {
    const response = await fetch("/api/chat/messages");
    const data = (await response.json()) as MessagesResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar conversas.");
      return [];
    }

    setSummaryMessages(data.messages);
    return data.messages;
  }

  async function loadThread(patientId: string) {
    const response = await fetch(`/api/chat/messages?patientId=${patientId}`);
    const data = (await response.json()) as MessagesResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar mensagens.");
      return;
    }

    setMessages(data.messages);
    await loadSummary();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatientId || !draft.trim()) return;

    setSending(true);
    setMessage(null);

    const response = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId: selectedPatientId, text: draft })
    });
    const data = (await response.json()) as { error?: string };
    setSending(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel enviar a mensagem.");
      return;
    }

    setDraft("");
    await loadThread(selectedPatientId);
  }

  async function startVideoCall() {
    if (!selectedPatientId || !selectedPatient) return;

    const text = `Videochamada pronta para ${selectedPatient.name}: ${jitsiUrl}`;
    setDraft("");

    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId: selectedPatientId, text })
    });

    window.open(jitsiUrl, "_blank", "noopener,noreferrer");
    await loadThread(selectedPatientId);
  }

  function openWhatsApp() {
    if (!selectedPatient?.phone) {
      setMessage("Paciente sem telefone cadastrado.");
      return;
    }

    const firstName = selectedPatient.name.split(" ")[0] || selectedPatient.name;
    const text = encodeURIComponent(`Ola ${firstName}! Tudo bem?`);
    const phone = normalizePhone(selectedPatient.phone);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function copyVideoLink() {
    if (!jitsiUrl) return;
    void navigator.clipboard.writeText(jitsiUrl);
    setMessage("Link da videochamada copiado.");
  }

  return (
    <section className="chat-layout">
      <aside className="surface chat-sidebar">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Conversas</span>
            <h2>Pacientes</h2>
          </div>
          <span className="status-pill">{summaries.filter((item) => item.unread > 0).length} novas</span>
        </div>

        <div className="chat-patient-list">
          {summaries.map((patient) => (
            <button
              className={patient.id === selectedPatientId ? "chat-patient active" : "chat-patient"}
              key={patient.id}
              type="button"
              onClick={() => setSelectedPatientId(patient.id)}
            >
              <span className="avatar-sm">{initials(patient.name)}</span>
              <span>
                <strong>{patient.name}</strong>
                <small>{patient.lastMessage?.text || patient.phone || patient.email || "Sem mensagens"}</small>
              </span>
              {patient.unread ? <em>{patient.unread}</em> : null}
            </button>
          ))}

          {!loading && patients.length === 0 ? <p className="empty-card">Cadastre um paciente para iniciar uma conversa.</p> : null}
          {loading ? <p className="empty-card">Carregando conversas...</p> : null}
        </div>
      </aside>

      <div className="surface chat-main">
        {selectedPatient ? (
          <>
            <div className="chat-header">
              <div>
                <span className="eyebrow">Atendimento</span>
                <h2>{selectedPatient.name}</h2>
                <p>{selectedPatient.phone || selectedPatient.email || "Contato nao informado"}</p>
              </div>
              <div className="row-actions">
                <button className="text-button" type="button" onClick={startVideoCall}>
                  Video
                </button>
                <button className="text-button" type="button" onClick={copyVideoLink}>
                  Copiar link
                </button>
                <button className="text-button" type="button" onClick={openWhatsApp}>
                  WhatsApp
                </button>
              </div>
            </div>

            {message ? <p className="form-message neutral">{message}</p> : null}

            <div className="chat-thread" ref={threadRef}>
              {messages.map((item, index) => {
                const previous = messages[index - 1];
                const showDate = !previous || dayKey(previous.createdAt) !== dayKey(item.createdAt);
                return (
                  <div key={item.id}>
                    {showDate ? <div className="chat-date">{formatDate(item.createdAt)}</div> : null}
                    <article className={item.sender === "PROFESSIONAL" ? "chat-bubble sent" : "chat-bubble received"}>
                      <p>{item.text}</p>
                      {item.attachmentUrl ? (
                        <a href={item.attachmentUrl} target="_blank" rel="noreferrer">
                          Abrir anexo
                        </a>
                      ) : null}
                      <span>{formatTime(item.createdAt)}</span>
                    </article>
                  </div>
                );
              })}

              {!messages.length ? <p className="empty-card">Inicie a conversa com uma mensagem ou envie o link de videochamada.</p> : null}
            </div>

            <form className="chat-compose" onSubmit={(event) => void handleSubmit(event)}>
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Digite uma mensagem..." />
              <button className="button" type="submit" disabled={sending || !draft.trim()}>
                {sending ? "Enviando..." : "Enviar"}
              </button>
            </form>
          </>
        ) : (
          <p className="empty-card">Selecione um paciente para abrir o chat.</p>
        )}
      </div>
    </section>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalizePhone(phone: string) {
  const clean = phone.replace(/\D/g, "");
  return clean.startsWith("55") ? clean : `55${clean}`;
}

function dayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
