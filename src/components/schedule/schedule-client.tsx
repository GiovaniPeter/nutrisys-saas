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
  COMPLETED: "Concluida",
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

  const selectedAppointments = useMemo(() => {
    return appointments.filter((appointment) => dateKey(new Date(appointment.startsAt)) === selectedDate);
  }, [appointments, selectedDate]);

  useEffect(() => {
    if (organizationSlug && typeof window !== "undefined") {
      setBookingLink(`${window.location.origin}/book/${organizationSlug}`);
    }
  }, [organizationSlug]);

  useEffect(() => {
    void loadAppointments();
  }, [range.from.getTime(), range.to.getTime()]);

  async function loadAppointments() {
    setLoading(true);
    const params = new URLSearchParams({
      from: range.from.toISOString(),
      to: range.to.toISOString()
    });
    const response = await fetch(`/api/appointments?${params}`);
    const data = (await response.json()) as AppointmentsResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar a agenda.");
      return;
    }

    setAppointments(data.appointments);
  }

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
      "PRODID:-//NutriPlan Pro//PT",
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

  return (
    <section className="schedule-layout">
      <div className="surface">
        <div className="schedule-toolbar">
          <div className="schedule-nav">
            <button className="text-button" type="button" onClick={() => movePeriod(-1)}>
              Anterior
            </button>
            <h2>{view === "month" ? formatMonth(cursor) : formatWeek(cursor)}</h2>
            <button className="text-button" type="button" onClick={() => movePeriod(1)}>
              Proximo
            </button>
            <button className="text-button" type="button" onClick={goToday}>
              Hoje
            </button>
          </div>

          <div className="row-actions">
            <button className={view === "month" ? "text-button active" : "text-button"} type="button" onClick={() => setView("month")}>
              Mes
            </button>
            <button className={view === "week" ? "text-button active" : "text-button"} type="button" onClick={() => setView("week")}>
              Semana
            </button>
          </div>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

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
                  key === dateKey(new Date()) ? "today" : "",
                  view === "month" && !isCurrentMonth ? "muted" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={key}
                type="button"
                onClick={() => setSelectedDate(key)}
              >
                <strong>{day.getDate()}</strong>
                <span>{dayAppointments.length ? `${dayAppointments.length} consulta(s)` : "Livre"}</span>
                <div>
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <em className={`status-${appointment.status.toLowerCase()}`} key={appointment.id}>
                      {formatTime(appointment.startsAt)}
                    </em>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {loading ? <p className="empty-card">Carregando calendario...</p> : null}
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">Agendamento online</span>
        <h2>{organizationName}</h2>
        <div className="booking-link-box">
          <span>{bookingLink || "Gerando link..."}</span>
          <div className="row-actions">
            <button className="text-button" type="button" onClick={copyBookingLink} disabled={!bookingLink}>
              Copiar link
            </button>
            {bookingLink ? (
              <a className="text-button" href={bookingLink} target="_blank" rel="noreferrer">
                Abrir
              </a>
            ) : null}
          </div>
        </div>

        <div className="compact-list schedule-day-list">
          <article>
            <strong>{formatDate(selectedDate)}</strong>
            <span>{selectedAppointments.length} consulta(s)</span>
          </article>

          {selectedAppointments.map((appointment) => (
            <article key={appointment.id}>
              <strong>
                {formatTime(appointment.startsAt)} - {appointment.patient.name}
              </strong>
              <span>
                {appointment.type} - {statusLabels[appointment.status]}
              </span>
              <div className="row-actions">
                <Link className="text-button" href={`/appointments?patientId=${appointment.patientId}`}>
                  Editar
                </Link>
                <button className="text-button" type="button" onClick={() => openGoogleCalendar(appointment)}>
                  Google
                </button>
                <button className="text-button" type="button" onClick={() => downloadIcs(appointment)}>
                  .ics
                </button>
              </div>
            </article>
          ))}

          {!selectedAppointments.length ? <p className="empty-card">Nenhuma consulta no dia selecionado.</p> : null}
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
