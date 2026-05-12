"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NotificationPriority = "high" | "medium" | "low";

type NotificationItem = {
  id: string;
  type: string;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionHref: string;
  actionLabel: string;
  createdAt: string;
};

type NotificationsResponse = {
  notifications: NotificationItem[];
};

const storageKey = "nutrisys_notifications_dismissed";

const priorityLabels: Record<NotificationPriority, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baixa"
};

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [filter, setFilter] = useState<"ALL" | NotificationPriority>("ALL");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const visibleNotifications = useMemo(() => {
    return notifications.filter((item) => !dismissed.includes(item.id) && (filter === "ALL" || item.priority === filter));
  }, [dismissed, filter, notifications]);

  const counts = useMemo(() => {
    return {
      high: notifications.filter((item) => !dismissed.includes(item.id) && item.priority === "high").length,
      medium: notifications.filter((item) => !dismissed.includes(item.id) && item.priority === "medium").length,
      low: notifications.filter((item) => !dismissed.includes(item.id) && item.priority === "low").length
    };
  }, [dismissed, notifications]);

  useEffect(() => {
    setDismissed(readDismissed());
    void loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    const response = await fetch("/api/notifications");
    const data = (await response.json()) as NotificationsResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar notificacoes.");
      return;
    }

    setNotifications(data.notifications);
  }

  function dismiss(id: string) {
    const next = Array.from(new Set([...dismissed, id]));
    setDismissed(next);
    saveDismissed(next);
  }

  function dismissAll() {
    const next = Array.from(new Set([...dismissed, ...visibleNotifications.map((item) => item.id)]));
    setDismissed(next);
    saveDismissed(next);
    setMessage("Notificacoes dispensadas.");
  }

  function resetDismissed() {
    setDismissed([]);
    saveDismissed([]);
    setMessage("Notificacoes restauradas.");
  }

  return (
    <section className="workspace-grid notifications-layout">
      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Painel</span>
            <h2>Pendencias ativas</h2>
          </div>
          <div className="mini-stats">
            <span>{visibleNotifications.length} ativas</span>
            <span>{notifications.length - visibleNotifications.length} ocultas</span>
          </div>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="filters-row notifications-filters">
          <label>
            Prioridade
            <select className="inline-select" value={filter} onChange={(event) => setFilter(event.target.value as "ALL" | NotificationPriority)}>
              <option value="ALL">Todas</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baixa</option>
            </select>
          </label>
        </div>

        <div className="notification-list">
          {visibleNotifications.map((item) => (
            <article className={`notification-card ${item.priority}`} key={item.id}>
              <div>
                <span className="eyebrow">{formatType(item.type)}</span>
                <h3>{item.title}</h3>
                <p>{item.message}</p>
                <small>{formatDateTime(item.createdAt)}</small>
              </div>
              <div className="row-actions">
                <Link className="text-button" href={item.actionHref}>
                  {item.actionLabel}
                </Link>
                <button className="text-button" type="button" onClick={() => dismiss(item.id)}>
                  Dispensar
                </button>
              </div>
            </article>
          ))}

          {!loading && visibleNotifications.length === 0 ? <p className="empty-card">Nenhuma notificacao para este filtro.</p> : null}
          {loading ? <p className="empty-card">Carregando notificacoes...</p> : null}
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">Resumo</span>
        <h2>Prioridades</h2>
        <div className="notification-summary">
          <button type="button" onClick={() => setFilter("high")}>
            <strong>{counts.high}</strong>
            <span>Alta</span>
          </button>
          <button type="button" onClick={() => setFilter("medium")}>
            <strong>{counts.medium}</strong>
            <span>Media</span>
          </button>
          <button type="button" onClick={() => setFilter("low")}>
            <strong>{counts.low}</strong>
            <span>Baixa</span>
          </button>
        </div>

        <div className="compact-list">
          <article>
            <strong>Regras ativas</strong>
            <span>Consultas hoje/24h, pacientes sem retorno, anamnese pendente, diario alimentar e chat.</span>
          </article>
        </div>

        <div className="row-actions notification-actions">
          <button className="text-button" type="button" onClick={dismissAll} disabled={visibleNotifications.length === 0}>
            Limpar visiveis
          </button>
          <button className="text-button" type="button" onClick={resetDismissed}>
            Restaurar
          </button>
        </div>
      </aside>
    </section>
  );
}

function readDismissed() {
  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}

function saveDismissed(ids: string[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(ids.slice(-300)));
}

function formatType(value: string) {
  const labels: Record<string, string> = {
    appointment: "Agenda",
    retention: "Retencao",
    pending: "Pendente",
    "food-diary": "Diario",
    chat: "Chat"
  };

  return labels[value] || value;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}
