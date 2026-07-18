"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";

type Appointment = {
  id: string;
  patientId: string;
  startsAt: string;
  endsAt: string | null;
  type: string;
  status: AppointmentStatus;
  notes: string | null;
  patient: {
    id: string;
    name: string;
    phone: string | null;
  };
};

type AppointmentsResponse = {
  appointments: Appointment[];
};

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Concluída",
  CANCELED: "Cancelada",
  NO_SHOW: "Faltou"
};

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

export function ScheduleClient({ organizationName, organizationSlug }: { organizationName: string; organizationSlug: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [bookingLink, setBookingLink] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const range = useMemo(() => {
    if (view === "month") {
      return {
        from: startOfMonth(cursor),
        to: endOfMonth(cursor)
      };
    }

    const start = startOfWeek(cursor);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { from: start, to: end };
  }, [cursor, view]);
  const rangeFrom = range.from.toISOString();
  const rangeTo = range.to.toISOString();

  const selectedAppointments = useMemo(() => {
    return appointments.filter((appointment) => dateKey(new Date(appointment.startsAt)) === selectedDate);
  }, [appointments, selectedDate]);

  useEffect(() => {
    if (organizationSlug && typeof window !== "undefined") {
      setBookingLink(`${window.location.origin}/book/${organizationSlug}`);
    }
  }, [organizationSlug]);

  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          from: rangeFrom,
          to: rangeTo
        });
        const response = await fetch(`/api/appointments?${params}`);
        const data = (await response.json()) as AppointmentsResponse & { error?: string };

        if (!active) return;

        if (!response.ok) {
          setMessage(data.error || "Não foi possível carregar a agenda.");
          return;
        }

        setAppointments(data.appointments);
      } catch {
        if (active) setMessage("Não foi possível carregar a agenda.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAppointments();

    return () => {
      active = false;
    };
  }, [rangeFrom, rangeTo]);

  async function copyBookingLink() {
    if (!bookingLink) return;

    try {
      await navigator.clipboard.writeText(bookingLink);
      setMessage("Link de agendamento copiado.");
    } catch {
      setMessage(bookingLink);
    }
  }

  function movePeriod(direction: -1 | 1) {
    const next = new Date(cursor);

    if (view === "month") {
      next.setMonth(next.getMonth() + direction);
      setCursor(startOfMonth(next));
      return;
    }

    next.setDate(next.getDate() + direction * 7);
    setCursor(startOfWeek(next));
  }

  function goToday() {
    const today = new Date();
    setCursor(view === "month" ? startOfMonth(today) : startOfWeek(today));
    setSelectedDate(dateKey(today));
  }

  function downloadIcs(appointment: Appointment) {
    const startsAt = new Date(appointment.startsAt);
    const endsAt = appointment.endsAt ? new Date(appointment.endsAt) : new Date(startsAt.getTime() + 60 * 60 * 1000);
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ClinOS//PT-BR",
      "BEGIN:VEVENT",
      `UID:${appointment.id}@nutriplan-pro`,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(startsAt)}`,
      `DTEND:${toIcsDate(endsAt)}`,
      `SUMMARY:Consulta - ${escapeIcs(appointment.patient.name)}`,
      `DESCRIPTION:${escapeIcs(`${appointment.type} - ${statusLabels[appointment.status]}`)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `consulta-${appointment.patient.name.replace(/\s+/g, "-")}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function openGoogleCalendar(appointment: Appointment) {
    const startsAt = new Date(appointment.startsAt);
    const endsAt = appointment.endsAt ? new Date(appointment.endsAt) : new Date(startsAt.getTime() + 60 * 60 * 1000);
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `Consulta - ${appointment.patient.name}`,
      dates: `${toGoogleDate(startsAt)}/${toGoogleDate(endsAt)}`,
      details: `${appointment.type}\nStatus: ${statusLabels[appointment.status]}${appointment.notes ? `\n${appointment.notes}` : ""}`
    });

    window.open(`https://calendar.google.com/calendar/render?${params}`, "_blank", "noopener,noreferrer");
  }

  const days = view === "month" ? monthDays(cursor) : weekDaysFrom(cursor);
  const todayKey = dateKey(new Date());

  return (
    <section className="schedule-layout">
      <div className="surface schedule-calendar-panel">
        <div className="schedule-toolbar">
          <div className="schedule-period">
            <div className="schedule-nav-buttons">
              <button className="schedule-icon-button" type="button" onClick={() => movePeriod(-1)} aria-label="Período anterior">
                <ChevronLeftIcon />
              </button>
              <button className="schedule-icon-button" type="button" onClick={() => movePeriod(1)} aria-label="Próximo período">
                <ChevronRightIcon />
              </button>
            </div>
            <div>
              <span className="schedule-period-label">{view === "month" ? "Visão mensal" : "Visão semanal"}</span>
              <h2>{view === "month" ? formatMonth(cursor) : formatWeek(cursor)}</h2>
            </div>
          </div>

          <div className="schedule-toolbar-actions">
            <button className="schedule-today-button" type="button" onClick={goToday}>
              <CalendarIcon />
              Hoje
            </button>

            <div className="schedule-view-switch" aria-label="Visualização do calendário">
              <button
                className={view === "month" ? "active" : ""}
                type="button"
                aria-pressed={view === "month"}
                onClick={() => setView("month")}
              >
                Mês
              </button>
              <button
                className={view === "week" ? "active" : ""}
                type="button"
                aria-pressed={view === "week"}
                onClick={() => setView("week")}
              >
                Semana
              </button>
            </div>
          </div>
        </div>

        {message ? (
          <p className="form-message neutral schedule-message">
            <CheckIcon />
            {message}
          </p>
        ) : null}

        <div className="calendar-scroll">
          <div className={view === "month" ? "calendar-grid" : "calendar-grid week"}>
            {weekDays.map((day) => (
              <div className="calendar-heading" key={day}>
                {day}
              </div>
            ))}

            {days.map((day) => {
              const key = dateKey(day);
              const dayAppointments = appointments.filter((appointment) => dateKey(new Date(appointment.startsAt)) === key);
              const isCurrentMonth = day.getMonth() === cursor.getMonth();
              return (
                <button
                  className={[
                    "calendar-cell",
                    key === selectedDate ? "selected" : "",
                    key === todayKey ? "today" : "",
                    view === "month" && !isCurrentMonth ? "muted" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={key}
                  type="button"
                  aria-label={`${formatDate(key)}: ${dayAppointments.length ? `${dayAppointments.length} consultas` : "livre"}`}
                  aria-pressed={key === selectedDate}
                  onClick={() => setSelectedDate(key)}
                >
                  <span className="calendar-cell-top">
                    <strong>{day.getDate()}</strong>
                    {key === todayKey ? <small>Hoje</small> : null}
                  </span>
                  <span className={dayAppointments.length ? "calendar-availability busy" : "calendar-availability"}>
                    {dayAppointments.length ? `${dayAppointments.length} consulta${dayAppointments.length > 1 ? "s" : ""}` : "Livre"}
                  </span>
                  <span className="calendar-appointment-times">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <em className={`status-${appointment.status.toLowerCase()}`} key={appointment.id}>
                        {formatTime(appointment.startsAt)}
                      </em>
                    ))}
                  </span>
                  {dayAppointments.length > 3 ? <span className="calendar-more">+{dayAppointments.length - 3} horários</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="schedule-loading" role="status">
            <span />
            Atualizando agenda...
          </div>
        ) : null}
      </div>

      <aside className="schedule-sidebar">
        <div className="surface booking-panel">
          <div className="booking-panel-heading">
            <span className="booking-icon">
              <LinkIcon />
            </span>
            <span className="booking-status">
              <i />
              Link ativo
            </span>
          </div>

          <span className="eyebrow">Agendamento online</span>
          <h2>{organizationName}</h2>
          <p>Compartilhe este endereço para seus pacientes solicitarem um horário disponível.</p>

          <div className="booking-link-box">
            <span>{bookingLink || "Gerando link..."}</span>
            <button className="schedule-copy-button" type="button" onClick={copyBookingLink} disabled={!bookingLink}>
              <CopyIcon />
              Copiar
            </button>
          </div>

          {bookingLink ? (
            <a className="booking-open-link" href={bookingLink} target="_blank" rel="noreferrer">
              Abrir página de agendamento
              <ExternalLinkIcon />
            </a>
          ) : null}
        </div>

        <div className="surface schedule-day-panel">
          <div className="schedule-day-heading">
            <div>
              <span className="eyebrow">Dia selecionado</span>
              <h2>{formatLongDate(selectedDate)}</h2>
            </div>
            <span className="schedule-count">{selectedAppointments.length}</span>
          </div>

          <div className="schedule-day-list">
            {selectedAppointments.map((appointment) => (
              <article className="schedule-appointment-card" key={appointment.id}>
                <div className="schedule-appointment-time">
                  <ClockIcon />
                  <strong>{formatTime(appointment.startsAt)}</strong>
                </div>
                <div className="schedule-appointment-copy">
                  <strong>{appointment.patient.name}</strong>
                  <span>{appointment.type}</span>
                  <em className={`appointment-status status-${appointment.status.toLowerCase()}`}>
                    {statusLabels[appointment.status]}
                  </em>
                </div>
                <div className="schedule-appointment-actions">
                  <Link href={`/appointments?patientId=${appointment.patientId}`}>Editar</Link>
                  <button type="button" onClick={() => openGoogleCalendar(appointment)}>
                    Google
                  </button>
                  <button type="button" onClick={() => downloadIcs(appointment)}>
                    .ics
                  </button>
                </div>
              </article>
            ))}

            {!selectedAppointments.length ? (
              <div className="schedule-empty-state">
                <span>
                  <CalendarCheckIcon />
                </span>
                <strong>Nenhuma consulta</strong>
                <p>Este dia está livre para novos agendamentos.</p>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </section>
  );
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function endOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfWeek(value: Date) {
  const date = new Date(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function monthDays(value: Date) {
  const first = startOfWeek(startOfMonth(value));
  const days: Date[] = [];

  for (let index = 0; index < 42; index++) {
    const date = new Date(first);
    date.setDate(first.getDate() + index);
    days.push(date);
  }

  return days;
}

function weekDaysFrom(value: Date) {
  const first = startOfWeek(value);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(first);
    date.setDate(first.getDate() + index);
    return date;
  });
}

function dateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonth(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(value);
}

function formatWeek(value: Date) {
  const first = startOfWeek(value);
  const last = new Date(first);
  last.setDate(last.getDate() + 6);
  return `${formatDate(dateKey(first))} - ${formatDate(dateKey(last))}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`));
}

function formatLongDate(value: string) {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function toIcsDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function toGoogleDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function ChevronLeftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect height="13" rx="2" width="13" x="8" y="8" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M14 4h6v6M20 4l-9 9M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CalendarCheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
      <path d="m8 15 2.5 2.5L16 12" />
    </svg>
  );
}
