"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type TransactionType = "INCOME" | "EXPENSE";
type TransactionStatus = "PENDING" | "PAID" | "CANCELED";

type PatientOption = {
  id: string;
  name: string;
  phone?: string | null;
};

type FinancialTransaction = {
  id: string;
  patientId: string | null;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  amountCents: number;
  dueDate: string;
  paidAt: string | null;
  paymentMethod: string | null;
  notes: string | null;
  patient: PatientOption | null;
};

type TransactionsResponse = {
  transactions: FinancialTransaction[];
};

type PatientsResponse = {
  patients: PatientOption[];
};

const typeLabels: Record<TransactionType, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa"
};

const statusLabels: Record<TransactionStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  CANCELED: "Cancelado"
};

export function FinancialClient() {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(() => searchParams.get("patientId") || "");
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState(() => firstDayOfMonth());
  const [toDate, setToDate] = useState(() => lastDayOfMonth());
  const [status, setStatus] = useState("");

  const editing = Boolean(editingTransaction);
  const totals = useMemo(() => calculateTotals(transactions), [transactions]);

  useEffect(() => {
    void loadPatients();
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [fromDate, toDate, status, selectedPatientId]);

  async function loadPatients() {
    const response = await fetch("/api/patients");
    const data = (await response.json()) as PatientsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar pacientes.");
      return;
    }

    setPatients(data.patients);
  }

  async function loadTransactions() {
    setLoading(true);
    const params = new URLSearchParams();

    if (fromDate) {
      params.set("from", new Date(`${fromDate}T00:00:00.000`).toISOString());
    }

    if (toDate) {
      params.set("to", new Date(`${toDate}T23:59:59.999`).toISOString());
    }

    if (status) {
      params.set("status", status);
    }

    if (selectedPatientId) {
      params.set("patientId", selectedPatientId);
    }

    const response = await fetch(`/api/financial/transactions?${params}`);
    const data = (await response.json()) as TransactionsResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar financeiro.");
      return;
    }

    setTransactions(data.transactions);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = getTransactionPayload(form);

    setSaving(true);
    setMessage(null);

    const response = await fetch(
      editingTransaction ? `/api/financial/transactions/${editingTransaction.id}` : "/api/financial/transactions",
      {
        method: editingTransaction ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel salvar lancamento.");
      return;
    }

    if (editingTransaction) {
      setEditingTransaction(null);
      setMessage("Lancamento atualizado com sucesso.");
    } else {
      formElement.reset();
      setMessage("Lancamento criado com sucesso.");
    }

    await loadTransactions();
  }

  async function updateStatus(transaction: FinancialTransaction, nextStatus: TransactionStatus) {
    setMessage(null);
    const response = await fetch(`/api/financial/transactions/${transaction.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel atualizar status.");
      return;
    }

    await loadTransactions();
  }

  async function handleDelete(transaction: FinancialTransaction) {
    const confirmed = window.confirm(`Excluir lancamento "${transaction.description}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(transaction.id);
    setMessage(null);

    const response = await fetch(`/api/financial/transactions/${transaction.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel excluir lancamento.");
      return;
    }

    if (editingTransaction?.id === transaction.id) {
      setEditingTransaction(null);
    }

    setMessage("Lancamento excluido com sucesso.");
    await loadTransactions();
  }

  async function copyBillingMessage(transaction: FinancialTransaction) {
    if (!transaction.patient) {
      setMessage("Vincule um paciente para gerar mensagem de cobranca.");
      return;
    }

    const billingMessage = buildBillingMessage(transaction);

    try {
      await navigator.clipboard.writeText(billingMessage);
      setMessage(`Mensagem de cobranca de ${transaction.patient.name} copiada.`);
    } catch {
      setMessage(billingMessage);
    }
  }

  return (
    <section className="workspace-grid">
      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Periodo</span>
            <h2>Lancamentos</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo financeiro">
            <span>{transactions.length} lancamentos</span>
            <span>{formatMoney(totals.balance)}</span>
          </div>
        </div>

        <div className="filters-row financial-filters">
          <label>
            De
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </label>
          <label>
            Ate
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </label>
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Todos</option>
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="CANCELED">Cancelado</option>
            </select>
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

        <div className="metric-strip">
          <div>
            <strong>{formatMoney(totals.income)}</strong>
            <span>Receitas</span>
          </div>
          <div>
            <strong>{formatMoney(totals.expense)}</strong>
            <span>Despesas</span>
          </div>
          <div>
            <strong>{formatMoney(totals.balance)}</strong>
            <span>Saldo</span>
          </div>
          <div>
            <strong>{formatMoney(totals.pending)}</strong>
            <span>Pendente</span>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Descricao</th>
                <th>Paciente</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className={editingTransaction?.id === transaction.id ? "selected-row" : undefined}>
                  <td>
                    <strong>{transaction.description}</strong>
                    <span>
                      {typeLabels[transaction.type]} · venc. {formatDate(transaction.dueDate)}
                    </span>
                  </td>
                  <td>{transaction.patient?.name || "Nao vinculado"}</td>
                  <td>
                    <strong>{formatMoney(transaction.amountCents)}</strong>
                    <span>{transaction.paymentMethod || "Sem metodo"}</span>
                  </td>
                  <td>
                    <select
                      className="inline-select"
                      value={transaction.status}
                      onChange={(event) => void updateStatus(transaction, event.target.value as TransactionStatus)}
                    >
                      <option value="PENDING">Pendente</option>
                      <option value="PAID">Pago</option>
                      <option value="CANCELED">Cancelado</option>
                    </select>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => {
                          setEditingTransaction(transaction);
                          setMessage(null);
                        }}
                      >
                        Editar
                      </button>
                      {transaction.patient ? (
                        <button className="text-button" type="button" onClick={() => void copyBillingMessage(transaction)}>
                          Copiar cobranca
                        </button>
                      ) : null}
                      {transaction.patient?.phone ? (
                        <a className="text-button" href={buildWhatsappUrl(transaction)} target="_blank" rel="noreferrer">
                          WhatsApp
                        </a>
                      ) : null}
                      <button
                        className="text-button danger"
                        type="button"
                        disabled={deletingId === transaction.id}
                        onClick={() => void handleDelete(transaction)}
                      >
                        {deletingId === transaction.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Nenhum lancamento no periodo.
                  </td>
                </tr>
              ) : null}

              {loading ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Carregando financeiro...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">{editing ? "Edicao" : "Novo lancamento"}</span>
        <h2>{editing ? "Editar lancamento" : "Criar lancamento"}</h2>
        <form key={editingTransaction?.id || "new"} className="form compact-form" onSubmit={handleSubmit}>
          <label>
            Descricao
            <input name="description" required minLength={2} defaultValue={editingTransaction?.description || ""} />
          </label>
          <label>
            Paciente
            <select name="patientId" defaultValue={editingTransaction?.patientId || selectedPatientId}>
              <option value="">Nao vinculado</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-row">
            <label>
              Tipo
              <select name="type" defaultValue={editingTransaction?.type || "INCOME"}>
                <option value="INCOME">Receita</option>
                <option value="EXPENSE">Despesa</option>
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue={editingTransaction?.status || "PENDING"}>
                <option value="PENDING">Pendente</option>
                <option value="PAID">Pago</option>
                <option value="CANCELED">Cancelado</option>
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Valor R$
              <input name="amount" type="number" min="0.01" step="0.01" required defaultValue={formatAmountInput(editingTransaction?.amountCents)} />
            </label>
            <label>
              Vencimento
              <input name="dueDate" type="date" required defaultValue={formatDateInput(editingTransaction?.dueDate) || today()} />
            </label>
          </div>
          <label>
            Metodo
            <input name="paymentMethod" placeholder="Pix, cartão, dinheiro..." defaultValue={editingTransaction?.paymentMethod || ""} />
          </label>
          <label>
            Observacoes
            <textarea name="notes" rows={4} defaultValue={editingTransaction?.notes || ""} />
          </label>
          <button className="button" type="submit" disabled={saving}>
            {saving ? "Salvando..." : editing ? "Salvar alteracoes" : "Criar lancamento"}
          </button>
          {editing ? (
            <button className="button secondary" type="button" onClick={() => setEditingTransaction(null)}>
              Cancelar edicao
            </button>
          ) : null}
        </form>
      </aside>
    </section>
  );
}

function getTransactionPayload(form: FormData) {
  const dueDate = String(form.get("dueDate") || "");
  const amount = Number(form.get("amount") || 0);

  return {
    patientId: form.get("patientId"),
    type: form.get("type"),
    status: form.get("status"),
    description: form.get("description"),
    amountCents: Math.round(amount * 100),
    dueDate: dueDate ? new Date(`${dueDate}T00:00:00.000`).toISOString() : "",
    paymentMethod: form.get("paymentMethod"),
    notes: form.get("notes")
  };
}

function calculateTotals(transactions: FinancialTransaction[]) {
  return transactions.reduce(
    (total, transaction) => {
      if (transaction.status === "CANCELED") {
        return total;
      }

      const signal = transaction.type === "INCOME" ? 1 : -1;
      const amount = transaction.amountCents * signal;

      return {
        income: total.income + (transaction.type === "INCOME" ? transaction.amountCents : 0),
        expense: total.expense + (transaction.type === "EXPENSE" ? transaction.amountCents : 0),
        balance: total.balance + amount,
        pending: total.pending + (transaction.status === "PENDING" ? Math.abs(amount) : 0)
      };
    },
    { income: 0, expense: 0, balance: 0, pending: 0 }
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function formatDateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function formatAmountInput(value: number | null | undefined) {
  return value ? (value / 100).toFixed(2) : "";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
}

function lastDayOfMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10);
}

function buildBillingMessage(transaction: FinancialTransaction) {
  return [
    `Ola, ${transaction.patient?.name}!`,
    `Passando para lembrar do lancamento: ${transaction.description}.`,
    `Valor: ${formatMoney(transaction.amountCents)}.`,
    `Vencimento: ${formatDate(transaction.dueDate)}.`,
    "Qualquer duvida, responda esta mensagem."
  ].join("\n");
}

function buildWhatsappUrl(transaction: FinancialTransaction) {
  const phone = transaction.patient?.phone?.replace(/\D/g, "") || "";
  const phoneWithCountry = phone.startsWith("55") ? phone : `55${phone}`;
  const text = encodeURIComponent(buildBillingMessage(transaction));

  return `https://wa.me/${phoneWithCountry}?text=${text}`;
}
