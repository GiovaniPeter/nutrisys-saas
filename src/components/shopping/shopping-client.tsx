"use client";

import { useEffect, useMemo, useState } from "react";

type PatientOption = {
  id: string;
  name: string;
};

type MealItem = {
  id: string;
  foodName: string;
  portion: string;
  quantity: string | number;
};

type MealPlan = {
  id: string;
  name: string;
  publishedAt: string | null;
  patient: PatientOption;
  meals: Array<{
    id: string;
    label: string;
    items: MealItem[];
  }>;
};

type MealPlansResponse = {
  mealPlans: MealPlan[];
};

type ShoppingItem = {
  key: string;
  name: string;
  portion: string;
  quantityPerDay: number;
  totalQuantity: number;
  totalBaseAmount: number | null;
  baseUnit: string | null;
  meals: string[];
};

export function ShoppingClient() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [days, setDays] = useState(7);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedPlan = mealPlans.find((plan) => plan.id === selectedPlanId) || null;
  const items = useMemo(() => (selectedPlan ? buildShoppingItems(selectedPlan, days) : []), [selectedPlan, days]);
  const checkedCount = items.filter((item) => checkedKeys.includes(item.key)).length;

  useEffect(() => {
    void loadMealPlans();
  }, []);

  async function loadMealPlans() {
    setLoading(true);
    const response = await fetch("/api/meal-plans");
    const data = (await response.json()) as MealPlansResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar planos alimentares.");
      return;
    }

    setMealPlans(data.mealPlans);
    if (data.mealPlans[0]) {
      setSelectedPlanId(data.mealPlans[0].id);
    }
  }

  function toggleItem(key: string) {
    setCheckedKeys((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  }

  async function copyList() {
    const text = toText(selectedPlan, items, checkedKeys, days);

    try {
      await navigator.clipboard.writeText(text);
      setMessage("Lista copiada.");
    } catch {
      setMessage(text);
    }
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(toText(selectedPlan, items, checkedKeys, days));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noreferrer");
  }

  function printList() {
    const text = escapeHtml(toText(selectedPlan, items, checkedKeys, days));
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setMessage("Nao foi possivel abrir a janela de impressao.");
      return;
    }

    printWindow.document.write(`<!doctype html><html><head><title>Lista de compras</title>
      <style>body{font-family:Arial,sans-serif;padding:32px;line-height:1.7;white-space:pre-wrap;color:#222}</style>
      </head><body>${text}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <section className="shopping-layout">
      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Configuracao</span>
            <h2>Gerar lista</h2>
          </div>
          <div className="mini-stats">
            <span>{mealPlans.length} planos</span>
            <span>{items.length} itens</span>
          </div>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="filters-row shopping-controls">
          <label>
            Plano alimentar
            <select
              className="inline-select"
              value={selectedPlanId}
              onChange={(event) => {
                setSelectedPlanId(event.target.value);
                setCheckedKeys([]);
              }}
            >
              {mealPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.patient.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Periodo
            <select className="inline-select" value={days} onChange={(event) => setDays(Number(event.target.value))}>
              <option value={1}>1 dia</option>
              <option value={7}>7 dias</option>
              <option value={14}>14 dias</option>
              <option value={30}>30 dias</option>
            </select>
          </label>
        </div>

        {selectedPlan ? (
          <div className="shopping-summary">
            <strong>{selectedPlan.name}</strong>
            <span>
              {selectedPlan.patient.name} - {days} dia(s) - {checkedCount}/{items.length} marcados
            </span>
            <div className="usage-bar" aria-label="Progresso da lista">
              <span style={{ width: items.length ? `${(checkedCount / items.length) * 100}%` : "0%" }} />
            </div>
          </div>
        ) : null}

        <div className="row-actions shopping-actions">
          <button className="text-button" type="button" disabled={!items.length} onClick={() => void copyList()}>
            Copiar
          </button>
          <button className="text-button" type="button" disabled={!items.length} onClick={shareWhatsApp}>
            WhatsApp
          </button>
          <button className="text-button" type="button" disabled={!items.length} onClick={printList}>
            Imprimir
          </button>
        </div>
      </div>

      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Compras</span>
            <h2>Itens agregados</h2>
          </div>
        </div>

        <div className="shopping-list">
          {items.map((item) => {
            const checked = checkedKeys.includes(item.key);

            return (
              <label className={checked ? "shopping-item checked" : "shopping-item"} key={item.key}>
                <input type="checkbox" checked={checked} onChange={() => toggleItem(item.key)} />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.meals.join(", ")}</small>
                </span>
                <b>{formatQuantity(item)}</b>
              </label>
            );
          })}

          {!loading && selectedPlan && items.length === 0 ? <p className="empty-card">Este plano nao possui alimentos.</p> : null}
          {!loading && !selectedPlan ? <p className="empty-card">Nenhum plano alimentar encontrado.</p> : null}
          {loading ? <p className="empty-card">Carregando planos...</p> : null}
        </div>
      </div>
    </section>
  );
}

function buildShoppingItems(plan: MealPlan, days: number) {
  const grouped = new Map<string, ShoppingItem>();

  plan.meals.forEach((meal) => {
    meal.items.forEach((item) => {
      const key = `${item.foodName.trim().toLowerCase()}|${item.portion.trim().toLowerCase()}`;
      const quantity = Number(item.quantity || 1);
      const parsed = parsePortion(item.portion);
      const existing =
        grouped.get(key) ||
        ({
          key,
          name: item.foodName,
          portion: item.portion,
          quantityPerDay: 0,
          totalQuantity: 0,
          totalBaseAmount: parsed ? 0 : null,
          baseUnit: parsed?.unit || null,
          meals: []
        } satisfies ShoppingItem);

      existing.quantityPerDay += quantity;
      existing.totalQuantity = existing.quantityPerDay * days;

      if (parsed && existing.totalBaseAmount !== null) {
        existing.totalBaseAmount += parsed.amount * quantity * days;
      }

      if (!existing.meals.includes(meal.label)) {
        existing.meals.push(meal.label);
      }

      grouped.set(key, existing);
    });
  });

  return Array.from(grouped.values()).sort((left, right) => left.name.localeCompare(right.name));
}

function parsePortion(portion: string) {
  const match = portion.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|mg|l|ml)\b/i);

  if (!match) {
    return null;
  }

  let amount = Number(match[1].replace(",", "."));
  let unit = match[2].toLowerCase();

  if (unit === "kg") {
    amount *= 1000;
    unit = "g";
  }

  if (unit === "l") {
    amount *= 1000;
    unit = "ml";
  }

  if (unit === "mg") {
    amount /= 1000;
    unit = "g";
  }

  return { amount, unit };
}

function formatQuantity(item: ShoppingItem) {
  if (item.totalBaseAmount !== null && item.baseUnit) {
    if (item.baseUnit === "g" && item.totalBaseAmount >= 1000) {
      return `${round(item.totalBaseAmount / 1000)} kg`;
    }

    if (item.baseUnit === "ml" && item.totalBaseAmount >= 1000) {
      return `${round(item.totalBaseAmount / 1000)} L`;
    }

    return `${round(item.totalBaseAmount)} ${item.baseUnit}`;
  }

  return `${round(item.totalQuantity)}x ${item.portion}`;
}

function toText(plan: MealPlan | null, items: ShoppingItem[], checkedKeys: string[], days: number) {
  if (!plan) {
    return "";
  }

  return [
    `LISTA DE COMPRAS - ${plan.name}`,
    `Paciente: ${plan.patient.name}`,
    `Periodo: ${days} dia(s)`,
    "",
    ...items.map((item) => `${checkedKeys.includes(item.key) ? "[x]" : "[ ]"} ${item.name} - ${formatQuantity(item)}`),
    "",
    "Gerado por NutriPlan Pro"
  ].join("\n");
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return map[char];
  });
}
