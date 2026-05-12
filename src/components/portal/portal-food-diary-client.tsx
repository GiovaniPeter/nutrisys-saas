"use client";

import { FormEvent, useEffect, useState } from "react";

type DiaryStatus = "PENDING" | "APPROVED" | "NEEDS_ADJUSTMENT";

type DiaryEntry = {
  id: string;
  mealType: string;
  entryDate: string;
  entryTime: string | null;
  description: string;
  status: DiaryStatus;
  feedbackNote: string | null;
};

type EntriesResponse = {
  entries: DiaryEntry[];
};

const statusLabels: Record<DiaryStatus, string> = {
  PENDING: "Aguardando",
  APPROVED: "Aprovado",
  NEEDS_ADJUSTMENT: "Com orientacao"
};

export function PortalFoodDiaryClient() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadEntries();
  }, []);

  async function loadEntries() {
    setLoading(true);
    const response = await fetch("/api/portal/food-diary");
    const data = (await response.json()) as EntriesResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar o diario.");
      return;
    }

    setEntries(data.entries);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const date = String(form.get("entryDate") || "");

    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/portal/food-diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealType: form.get("mealType"),
        entryDate: date ? new Date(`${date}T00:00:00.000`).toISOString() : "",
        entryTime: form.get("entryTime"),
        description: form.get("description"),
        photoUrl: form.get("photoUrl")
      })
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel enviar o registro.");
      return;
    }

    formElement.reset();
    setMessage("Registro enviado para avaliacao.");
    await loadEntries();
  }

  return (
    <div className="portal-diary-block">
      <form className="form compact-form portal-diary-form" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-row">
          <label>
            Refeicao
            <select name="mealType" defaultValue="Almoco">
              <option>Cafe da manha</option>
              <option>Lanche da manha</option>
              <option>Almoco</option>
              <option>Lanche da tarde</option>
              <option>Jantar</option>
              <option>Ceia</option>
              <option>Outro</option>
            </select>
          </label>
          <label>
            Data
            <input name="entryDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
          </label>
        </div>
        <label>
          Horario
          <input name="entryTime" type="time" />
        </label>
        <label>
          O que voce consumiu?
          <textarea name="description" rows={4} required placeholder="Ex.: arroz, feijao, frango grelhado e salada" />
        </label>
        <label>
          Link da foto
          <input name="photoUrl" type="url" placeholder="Opcional" />
        </label>
        <button className="button" type="submit" disabled={saving}>
          {saving ? "Enviando..." : "Enviar registro"}
        </button>
        {message ? <p className="form-message neutral">{message}</p> : null}
      </form>

      <div className="compact-list">
        {entries.map((entry) => (
          <article key={entry.id}>
            <strong>
              {entry.mealType} - {formatDate(entry.entryDate)}
            </strong>
            <span>{entry.description}</span>
            <span>{statusLabels[entry.status]}</span>
            {entry.feedbackNote ? <span>{entry.feedbackNote}</span> : null}
          </article>
        ))}
        {!loading && entries.length === 0 ? <p className="empty-card">Nenhum registro enviado ainda.</p> : null}
        {loading ? <p className="empty-card">Carregando diario...</p> : null}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
