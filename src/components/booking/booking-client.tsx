"use client";

import type { CSSProperties } from "react";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Organization = {
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
};

type SlotDay = {
  date: string;
  label: string;
  times: Array<{
    time: string;
    startsAt: string;
  }>;
};

type BookingResponse = {
  slots: SlotDay[];
};

export function BookingClient({ organization }: { organization: Organization }) {
  const [slots, setSlots] = useState<SlotDay[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState(false);

  useEffect(() => {
    void loadSlots();
  }, []);

  async function loadSlots() {
    setLoading(true);
    const response = await fetch(`/api/public-booking/${organization.slug}`);
    const data = (await response.json()) as BookingResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar horarios.");
      return;
    }

    setSlots(data.slots);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSlot) {
      setMessage("Escolha um horário.");
      return;
    }

    if (!lgpdConsent) {
      setMessage("É necessário autorizar o tratamento de dados (LGPD) para solicitar o agendamento.");
      return;
    }

    const form = new FormData(event.currentTarget);
    setSaving(true);
    setMessage(null);

    const response = await fetch(`/api/public-booking/${organization.slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        email: form.get("email"),
        type: form.get("type"),
        startsAt: selectedSlot,
        lgpdConsent
      })
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel solicitar o agendamento.");
      await loadSlots();
      return;
    }

    setDone(true);
  }

  return (
    <main
      className="booking-page"
      style={
        {
          "--booking-primary": organization.primaryColor,
          "--booking-secondary": organization.secondaryColor
        } as CSSProperties
      }
    >
      <section className="booking-hero">
        <span className="brand-mark">N</span>
        <h1>{organization.name}</h1>
        <p>Escolha um horario disponivel e solicite sua consulta.</p>
      </section>

      <section className="booking-panel">
        {done ? (
          <div className="booking-success">
            <strong>Agendamento solicitado</strong>
            <p>Recebemos seu pedido. A equipe entrara em contato para confirmar.</p>
          </div>
        ) : (
          <form className="form compact-form" onSubmit={(event) => void handleSubmit(event)}>
            <label>
              Nome completo
              <input name="name" required minLength={2} />
            </label>
            <label>
              Telefone
              <input name="phone" required placeholder="(99) 99999-9999" />
            </label>
            <label>
              E-mail
              <input name="email" type="email" />
            </label>
            <label>
              Tipo de consulta
              <select name="type" defaultValue="Primeira consulta">
                <option>Primeira consulta</option>
                <option>Retorno</option>
                <option>Avaliacao corporal</option>
                <option>Teleconsulta</option>
              </select>
            </label>

            <div className="booking-slots">
              <strong>Horarios disponiveis</strong>
              {slots.map((day) => (
                <article key={day.date}>
                  <span>{day.label}</span>
                  <div>
                    {day.times.map((slot) => (
                      <button
                        className={selectedSlot === slot.startsAt ? "selected" : ""}
                        key={slot.startsAt}
                        type="button"
                        onClick={() => setSelectedSlot(slot.startsAt)}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
              {!loading && slots.length === 0 ? <p className="empty-card">Nenhum horario disponivel nos proximos dias.</p> : null}
              {loading ? <p className="empty-card">Carregando horarios...</p> : null}
            </div>

            <label
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "10px",
                fontSize: "0.85rem",
                lineHeight: 1.45,
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                name="lgpdConsent"
                checked={lgpdConsent}
                onChange={(event) => setLgpdConsent(event.target.checked)}
                required
                style={{ width: "auto", marginTop: "3px" }}
              />
              <span>
                Autorizo o tratamento dos meus dados pessoais e de saúde pela clínica{" "}
                <strong>{organization.name}</strong> para agendamento e atendimento nutricional, conforme a{" "}
                <Link href="/politica-de-privacidade" target="_blank" style={{ textDecoration: "underline" }}>
                  Política de Privacidade (LGPD)
                </Link>
                .
              </span>
            </label>

            {message ? <p className="form-message neutral">{message}</p> : null}

            <button className="button" type="submit" disabled={saving || !selectedSlot || !lgpdConsent}>
              {saving ? "Enviando..." : "Solicitar agendamento"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
