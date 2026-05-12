"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type PatientOption = {
  id: string;
  name: string;
};

type Food = {
  id: string;
  name: string;
  portion: string;
  calories: string | number;
  protein: string | number;
  carbs: string | number;
  fat: string | number;
  fiber: string | number | null;
};

type RecallItem = {
  id: string;
  foodId?: string | null;
  foodName: string;
  portion: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  notes?: string;
};

type DraftMeal = {
  id: string;
  type: string;
  label: string;
  time: string;
  position: number;
  notes: string;
  items: RecallItem[];
};

type Recall = {
  id: string;
  patientId: string;
  referenceDate: string | null;
  generalNotes: string | null;
  createdAt: string;
  patient: PatientOption;
  meals: Array<{
    id: string;
    type: string;
    label: string;
    time: string | null;
    position: number;
    notes: string | null;
    items: RecallItem[];
  }>;
};

type PatientsResponse = {
  patients: PatientOption[];
};

type FoodsResponse = {
  foods: Food[];
  total: number;
};

type RecallsResponse = {
  recalls: Recall[];
};

const mealTemplates = [
  { type: "waking", label: "Ao despertar", time: "06:00" },
  { type: "breakfast", label: "Cafe da manha", time: "07:30" },
  { type: "morning_snack", label: "Lanche da manha", time: "10:00" },
  { type: "lunch", label: "Almoco", time: "12:30" },
  { type: "afternoon_snack", label: "Lanche da tarde", time: "15:30" },
  { type: "dinner", label: "Jantar", time: "19:00" },
  { type: "supper", label: "Ceia", time: "21:00" },
  { type: "extra", label: "Outros", time: "" }
];

export function RecallsClient() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(() => searchParams.get("patientId") || "");
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [selectedMealId, setSelectedMealId] = useState("");
  const [foodSearch, setFoodSearch] = useState("");
  const [foodsTotal, setFoodsTotal] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [manualItem, setManualItem] = useState(createManualItem());
  const [meals, setMeals] = useState<DraftMeal[]>(() => createDraftMeals());
  const [referenceDate, setReferenceDate] = useState(() => formatDateInput(new Date().toISOString()));
  const [generalNotes, setGeneralNotes] = useState("");
  const [editingRecall, setEditingRecall] = useState<Recall | null>(null);
  const [expandedRecallId, setExpandedRecallId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedFood = foods.find((food) => food.id === selectedFoodId) || null;
  const selectedMeal = meals.find((meal) => meal.id === selectedMealId) || meals[0];
  const totals = useMemo(() => sumItems(meals.flatMap((meal) => meal.items)), [meals]);
  const editing = Boolean(editingRecall);

  useEffect(() => {
    const initialMeals = createDraftMeals();
    setMeals(initialMeals);
    setSelectedMealId(initialMeals[0]?.id || "");
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadFoods(foodSearch);
    }, 240);

    return () => window.clearTimeout(timeout);
  }, [foodSearch]);

  useEffect(() => {
    void loadRecalls(selectedPatientId);
  }, [selectedPatientId]);

  async function loadInitialData() {
    setLoading(true);
    await Promise.all([loadPatients(), loadFoods(), loadRecalls(selectedPatientId)]);
    setLoading(false);
  }

  async function loadPatients() {
    const response = await fetch("/api/patients");
    const data = (await response.json()) as PatientsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar pacientes.");
      return;
    }

    setPatients(data.patients);
    if (!selectedPatientId && !searchParams.get("patientId") && data.patients[0]) {
      setSelectedPatientId(data.patients[0].id);
    }
  }

  async function loadFoods(search = "") {
    const params = new URLSearchParams({ limit: "80" });

    if (search.trim()) {
      params.set("q", search.trim());
    }

    const response = await fetch(`/api/foods?${params}`);
    const data = (await response.json()) as FoodsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar alimentos.");
      return;
    }

    setFoods(data.foods);
    setFoodsTotal(data.total || data.foods.length);
    if (data.foods[0] && !data.foods.some((food) => food.id === selectedFoodId)) {
      setSelectedFoodId(data.foods[0].id);
    } else if (data.foods.length === 0) {
      setSelectedFoodId("");
    }
  }

  async function loadRecalls(patientId = "") {
    const params = new URLSearchParams();

    if (patientId) {
      params.set("patientId", patientId);
    }

    const response = await fetch(`/api/recalls${params.size ? `?${params}` : ""}`);
    const data = (await response.json()) as RecallsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar recordatorios.");
      return;
    }

    setRecalls(data.recalls);
  }

  function addItemFromFood() {
    if (!selectedMeal || !selectedFood) {
      setMessage("Selecione uma refeicao e um alimento antes de adicionar.");
      return;
    }

    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    const nextItem = {
      id: crypto.randomUUID(),
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      portion: selectedFood.portion,
      quantity: safeQuantity,
      calories: roundMacro(toNumber(selectedFood.calories) * safeQuantity),
      protein: roundMacro(toNumber(selectedFood.protein) * safeQuantity),
      carbs: roundMacro(toNumber(selectedFood.carbs) * safeQuantity),
      fat: roundMacro(toNumber(selectedFood.fat) * safeQuantity),
      fiber: roundMacro(toNumber(selectedFood.fiber) * safeQuantity),
      notes: ""
    };

    setMeals((current) =>
      current.map((meal) => (meal.id === selectedMeal.id ? { ...meal, items: [...meal.items, nextItem] } : meal))
    );
    setMessage(null);
  }

  function addManualItem() {
    if (!selectedMeal) {
      setMessage("Selecione uma refeicao antes de adicionar.");
      return;
    }

    if (!manualItem.foodName.trim()) {
      setMessage("Informe o nome do alimento manual.");
      return;
    }

    const nextItem = {
      ...manualItem,
      id: crypto.randomUUID(),
      foodName: manualItem.foodName.trim(),
      portion: manualItem.portion.trim(),
      quantity: Number(manualItem.quantity) || 1,
      calories: roundMacro(Number(manualItem.calories) || 0),
      protein: roundMacro(Number(manualItem.protein) || 0),
      carbs: roundMacro(Number(manualItem.carbs) || 0),
      fat: roundMacro(Number(manualItem.fat) || 0),
      fiber: roundMacro(Number(manualItem.fiber) || 0)
    };

    setMeals((current) =>
      current.map((meal) => (meal.id === selectedMeal.id ? { ...meal, items: [...meal.items, nextItem] } : meal))
    );
    setManualItem(createManualItem());
    setMessage(null);
  }

  function updateMeal(mealId: string, patch: Partial<Pick<DraftMeal, "label" | "time" | "notes">>) {
    setMeals((current) => current.map((meal) => (meal.id === mealId ? { ...meal, ...patch } : meal)));
  }

  function updateItem(mealId: string, itemId: string, patch: Partial<RecallItem>) {
    setMeals((current) =>
      current.map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              items: meal.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
            }
          : meal
      )
    );
  }

  function updateItemQuantity(mealId: string, itemId: string, value: number) {
    const nextQuantity = Number.isFinite(value) && value > 0 ? value : 1;

    setMeals((current) =>
      current.map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              items: meal.items.map((item) => {
                if (item.id !== itemId) {
                  return item;
                }

                const currentQuantity = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
                const factor = nextQuantity / currentQuantity;

                return {
                  ...item,
                  quantity: nextQuantity,
                  calories: roundMacro(toNumber(item.calories) * factor),
                  protein: roundMacro(toNumber(item.protein) * factor),
                  carbs: roundMacro(toNumber(item.carbs) * factor),
                  fat: roundMacro(toNumber(item.fat) * factor),
                  fiber: roundMacro(toNumber(item.fiber) * factor)
                };
              })
            }
          : meal
      )
    );
  }

  function removeItem(mealId: string, itemId: string) {
    setMeals((current) =>
      current.map((meal) =>
        meal.id === mealId ? { ...meal, items: meal.items.filter((item) => item.id !== itemId) } : meal
      )
    );
  }

  function moveItem(sourceMealId: string, itemId: string, targetMealId: string) {
    if (sourceMealId === targetMealId) {
      return;
    }

    setMeals((current) => {
      const sourceMeal = current.find((meal) => meal.id === sourceMealId);
      const movingItem = sourceMeal?.items.find((item) => item.id === itemId);

      if (!movingItem) {
        return current;
      }

      return current.map((meal) => {
        if (meal.id === sourceMealId) {
          return { ...meal, items: meal.items.filter((item) => item.id !== itemId) };
        }

        if (meal.id === targetMealId) {
          return { ...meal, items: [...meal.items, movingItem] };
        }

        return meal;
      });
    });
    setSelectedMealId(targetMealId);
  }

  function startEditing(recall: Recall) {
    const draftMeals = createDraftMeals(recall);
    setEditingRecall(recall);
    setSelectedPatientId(recall.patientId);
    setReferenceDate(formatDateInput(recall.referenceDate) || formatDateInput(new Date().toISOString()));
    setGeneralNotes(recall.generalNotes || "");
    setMeals(draftMeals);
    setSelectedMealId(draftMeals.find((meal) => meal.items.length > 0)?.id || draftMeals[0]?.id || "");
    setMessage(null);
  }

  function duplicateRecall(recall: Recall) {
    const draftMeals = cloneRecallMeals(recall);
    setEditingRecall(null);
    setSelectedPatientId(recall.patientId);
    setReferenceDate(formatDateInput(new Date().toISOString()));
    setGeneralNotes(recall.generalNotes || "");
    setMeals(draftMeals);
    setSelectedMealId(draftMeals.find((meal) => meal.items.length > 0)?.id || draftMeals[0]?.id || "");
    setMessage(`Recordatorio de ${recall.patient.name} duplicado. Revise a data e salve para criar um novo registro.`);
  }

  function cancelEditing() {
    const draftMeals = createDraftMeals();
    setEditingRecall(null);
    setReferenceDate(formatDateInput(new Date().toISOString()));
    setGeneralNotes("");
    setMeals(draftMeals);
    setSelectedMealId(draftMeals[0]?.id || "");
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (meals.every((meal) => meal.items.length === 0)) {
      setMessage("Adicione pelo menos um alimento ao recordatorio.");
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = getRecallPayload(form, selectedPatientId, referenceDate, generalNotes, meals);

    setSaving(true);
    setMessage(null);

    const response = await fetch(editingRecall ? `/api/recalls/${editingRecall.id}` : "/api/recalls", {
      method: editingRecall ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel salvar o recordatorio.");
      return;
    }

    formElement.reset();
    const draftMeals = createDraftMeals();
    setEditingRecall(null);
    setReferenceDate(formatDateInput(new Date().toISOString()));
    setGeneralNotes("");
    setMeals(draftMeals);
    setSelectedMealId(draftMeals[0]?.id || "");
    setMessage(editingRecall ? "Recordatorio atualizado com sucesso." : "Recordatorio criado com sucesso.");
    await loadRecalls(selectedPatientId);
  }

  function toggleDetails(recallId: string) {
    setExpandedRecallId((current) => (current === recallId ? null : recallId));
  }

  function printRecall(recall: Recall) {
    const totals = sumItems(recall.meals.flatMap((meal) => meal.items));
    const mealRows = recall.meals
      .map((meal) => {
        const mealTotals = sumItems(meal.items);
        const itemRows = meal.items
          .map(
            (item) => `<tr>
              <td>${escapeHtml(item.foodName)}</td>
              <td>${escapeHtml(item.portion || "")}</td>
              <td>${formatNumber(item.quantity)}</td>
              <td>${Math.round(toNumber(item.calories))}</td>
              <td>${toNumber(item.protein).toFixed(1)}</td>
              <td>${toNumber(item.carbs).toFixed(1)}</td>
              <td>${toNumber(item.fat).toFixed(1)}</td>
            </tr>`
          )
          .join("");

        return `<section>
          <h2>${escapeHtml(meal.label)}${meal.time ? ` (${escapeHtml(meal.time)})` : ""}</h2>
          <table>
            <thead>
              <tr><th>Alimento</th><th>Porcao</th><th>Qtd</th><th>Kcal</th><th>Prot</th><th>Carb</th><th>Gord</th></tr>
            </thead>
            <tbody>
              ${itemRows}
              <tr class="total"><td colspan="3">Subtotal</td><td>${Math.round(mealTotals.calories)}</td><td>${mealTotals.protein.toFixed(1)}</td><td>${mealTotals.carbs.toFixed(1)}</td><td>${mealTotals.fat.toFixed(1)}</td></tr>
            </tbody>
          </table>
          ${meal.notes ? `<p><strong>Obs. refeicao:</strong> ${escapeHtml(meal.notes)}</p>` : ""}
        </section>`;
      })
      .join("");

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setMessage("Nao foi possivel abrir a janela de impressao.");
      return;
    }

    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Recordatorio - ${escapeHtml(recall.patient.name)}</title>
          <style>
            body { color: #1d2b25; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.45; padding: 28px; }
            h1 { color: #0f8f72; font-size: 22px; margin: 0 0 4px; }
            h2 { border-bottom: 2px solid #0f8f72; color: #0f8f72; font-size: 14px; margin: 18px 0 8px; padding-bottom: 4px; }
            p { margin: 4px 0 10px; }
            table { border-collapse: collapse; margin-bottom: 10px; width: 100%; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
            th { background: #f5f7f6; font-weight: 700; }
            .summary { background: #eef8f4; border: 1px solid #c9eadf; margin: 16px 0; padding: 10px 12px; }
            .total { background: #f5f7f6; font-weight: 700; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <h1>Recordatorio alimentar 24h</h1>
          <p>Paciente: <strong>${escapeHtml(recall.patient.name)}</strong></p>
          <p>Data referente: <strong>${recall.referenceDate ? formatDate(recall.referenceDate) : "data nao informada"}</strong> | Criado em: ${formatDate(recall.createdAt)}</p>
          <div class="summary">
            <strong>Total do dia:</strong> ${Math.round(totals.calories)} kcal | ${totals.protein.toFixed(1)}g prot | ${totals.carbs.toFixed(1)}g carb | ${totals.fat.toFixed(1)}g gord
          </div>
          ${mealRows}
          ${recall.generalNotes ? `<p><strong>Observacoes gerais:</strong> ${escapeHtml(recall.generalNotes)}</p>` : ""}
          <p style="color:#6b7280;font-size:10px;margin-top:24px">Gerado pelo NutriSys</p>
        </body>
      </html>`);
    printWindow.document.close();
    window.setTimeout(() => printWindow.print(), 400);
  }

  async function handleDelete(recall: Recall) {
    const confirmed = window.confirm(`Excluir recordatorio de ${recall.patient.name}?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(recall.id);
    setMessage(null);

    const response = await fetch(`/api/recalls/${recall.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel excluir o recordatorio.");
      return;
    }

    if (editingRecall?.id === recall.id) {
      cancelEditing();
    }

    setMessage("Recordatorio excluido com sucesso.");
    await loadRecalls(selectedPatientId);
  }

  return (
    <section className="workspace-grid">
      <div className="surface recall-list">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Historico</span>
            <h2>Registros alimentares</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo dos recordatorios">
            <span>{recalls.length} registros</span>
            <span>{recalls[0] ? formatDate(recalls[0].createdAt) : "sem historico"}</span>
          </div>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <label className="search-field">
          <span>Paciente</span>
          <select
            className="inline-select"
            value={selectedPatientId}
            onChange={(event) => {
              setSelectedPatientId(event.target.value);
              setEditingRecall(null);
            }}
          >
            <option value="">Todos</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </label>

        <div className="plan-list">
          {recalls.map((recall) => {
            const recallTotals = sumItems(recall.meals.flatMap((meal) => meal.items));
            const mealCount = recall.meals.filter((meal) => meal.items.length > 0).length;

            return (
              <article className="plan-card" key={recall.id}>
                <div>
                  <span className="status-pill ok">{mealCount} refeicoes</span>
                  <h3>{recall.patient.name}</h3>
                  <p>
                    Referente a {recall.referenceDate ? formatDate(recall.referenceDate) : "data nao informada"} - criado em{" "}
                    {formatDate(recall.createdAt)}
                  </p>
                </div>
                <div className="macro-grid">
                  <span>{Math.round(recallTotals.calories)} kcal</span>
                  <span>{recallTotals.protein.toFixed(1)}g prot</span>
                  <span>{recallTotals.carbs.toFixed(1)}g carb</span>
                  <span>{recallTotals.fat.toFixed(1)}g gord</span>
                </div>
                <div className="answer-preview">
                  {recall.meals.slice(0, 4).map((meal) => (
                    <div key={meal.id}>
                      <strong>{meal.label}</strong>
                      <span>
                        {meal.items.length} itens - {Math.round(sumItems(meal.items).calories)} kcal
                      </span>
                    </div>
                  ))}
                </div>
                <div className="row-actions">
                  <button className="text-button" type="button" onClick={() => toggleDetails(recall.id)}>
                    {expandedRecallId === recall.id ? "Ocultar" : "Ver detalhes"}
                  </button>
                  <button className="text-button" type="button" onClick={() => printRecall(recall)}>
                    Imprimir
                  </button>
                  <button className="text-button" type="button" onClick={() => duplicateRecall(recall)}>
                    Duplicar
                  </button>
                  <button className="text-button" type="button" onClick={() => startEditing(recall)}>
                    Editar
                  </button>
                  <button
                    className="text-button danger"
                    type="button"
                    disabled={deletingId === recall.id}
                    onClick={() => void handleDelete(recall)}
                  >
                    {deletingId === recall.id ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
                {expandedRecallId === recall.id ? <RecallDetails recall={recall} /> : null}
              </article>
            );
          })}

          {!loading && recalls.length === 0 ? <p className="empty-card">Nenhum recordatorio registrado.</p> : null}
          {loading ? <p className="empty-card">Carregando recordatorios...</p> : null}
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">{editing ? "Edicao" : "Novo registro"}</span>
        <h2>{editing ? "Editar recordatorio" : "Registrar 24h"}</h2>
        <form key={editingRecall?.id || "new"} className="form compact-form" onSubmit={handleSubmit}>
          <label>
            Paciente
            <select name="patientId" required value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>
              <option value="">Selecione</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Data referente
            <input name="referenceDate" type="date" value={referenceDate} onChange={(event) => setReferenceDate(event.target.value)} />
          </label>

          <div className="meal-builder">
            <div className="meal-tabs" role="tablist" aria-label="Refeicoes do recordatorio">
              {meals.map((meal) => (
                <button
                  key={meal.id}
                  className={meal.id === selectedMeal?.id ? "meal-tab active" : "meal-tab"}
                  type="button"
                  onClick={() => setSelectedMealId(meal.id)}
                >
                  {meal.label}
                  <span>{meal.items.length} itens</span>
                </button>
              ))}
            </div>

            {selectedMeal ? (
              <div className="meal-editor recall-meal-editor">
                <label>
                  Rotulo
                  <input value={selectedMeal.label} onChange={(event) => updateMeal(selectedMeal.id, { label: event.target.value })} />
                </label>
                <label>
                  Horario
                  <input type="time" value={selectedMeal.time} onChange={(event) => updateMeal(selectedMeal.id, { time: event.target.value })} />
                </label>
              </div>
            ) : null}
          </div>

          <div className="item-builder">
            <label>
              Buscar alimento
              <input value={foodSearch} onChange={(event) => setFoodSearch(event.target.value)} placeholder="Digite arroz, cafe, banana..." />
            </label>
            <label>
              Alimento
              <select value={selectedFoodId} onChange={(event) => setSelectedFoodId(event.target.value)}>
                {foods.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name} - {food.portion} - {Math.round(toNumber(food.calories))} kcal
                  </option>
                ))}
              </select>
            </label>
            <span className="form-hint">
              {foods.length === 0 ? "Nenhum alimento encontrado" : `${foods.length} exibidos de ${foodsTotal}`}
            </span>
            <label>
              Quantidade
              <input type="number" min="0.1" step="0.1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
            </label>
            <button className="button secondary" type="button" onClick={addItemFromFood}>
              Adicionar do banco
            </button>
          </div>

          <div className="item-builder">
            <label>
              Item manual
              <input
                value={manualItem.foodName}
                onChange={(event) => setManualItem((current) => ({ ...current, foodName: event.target.value }))}
                placeholder="Ex.: bolo caseiro"
              />
            </label>
            <label>
              Porcao
              <input
                value={manualItem.portion}
                onChange={(event) => setManualItem((current) => ({ ...current, portion: event.target.value }))}
                placeholder="1 fatia, 200 ml..."
              />
            </label>
            <div className="form-row">
              <label>
                Kcal
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={manualItem.calories}
                  onChange={(event) => setManualItem((current) => ({ ...current, calories: Number(event.target.value) }))}
                />
              </label>
              <label>
                Proteina g
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={manualItem.protein}
                  onChange={(event) => setManualItem((current) => ({ ...current, protein: Number(event.target.value) }))}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Carbo g
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={manualItem.carbs}
                  onChange={(event) => setManualItem((current) => ({ ...current, carbs: Number(event.target.value) }))}
                />
              </label>
              <label>
                Gordura g
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={manualItem.fat}
                  onChange={(event) => setManualItem((current) => ({ ...current, fat: Number(event.target.value) }))}
                />
              </label>
            </div>
            <button className="button secondary" type="button" onClick={addManualItem}>
              Adicionar manual
            </button>
          </div>

          <div className="selected-items">
            {selectedMeal?.items.map((item) => (
              <div className="selected-item editable-selected-item" key={item.id}>
                <div className="selected-item-main">
                  <label>
                    Alimento
                    <input value={item.foodName} onChange={(event) => updateItem(selectedMeal.id, item.id, { foodName: event.target.value })} />
                  </label>
                  <label>
                    Porcao
                    <input value={item.portion} onChange={(event) => updateItem(selectedMeal.id, item.id, { portion: event.target.value })} />
                  </label>
                  <label>
                    Refeicao
                    <select value={selectedMeal.id} onChange={(event) => moveItem(selectedMeal.id, item.id, event.target.value)}>
                      {meals.map((meal) => (
                        <option key={meal.id} value={meal.id}>
                          {meal.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="selected-item-nutrients">
                  <label>
                    Qtd
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={item.quantity}
                      onChange={(event) => updateItemQuantity(selectedMeal.id, item.id, Number(event.target.value))}
                    />
                  </label>
                  <label>
                    Kcal
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.calories}
                      onChange={(event) => updateItem(selectedMeal.id, item.id, { calories: roundMacro(Number(event.target.value) || 0) })}
                    />
                  </label>
                  <label>
                    Prot
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.protein}
                      onChange={(event) => updateItem(selectedMeal.id, item.id, { protein: roundMacro(Number(event.target.value) || 0) })}
                    />
                  </label>
                  <label>
                    Carb
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.carbs}
                      onChange={(event) => updateItem(selectedMeal.id, item.id, { carbs: roundMacro(Number(event.target.value) || 0) })}
                    />
                  </label>
                  <label>
                    Gord
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.fat}
                      onChange={(event) => updateItem(selectedMeal.id, item.id, { fat: roundMacro(Number(event.target.value) || 0) })}
                    />
                  </label>
                </div>
                <button className="text-button danger" type="button" onClick={() => removeItem(selectedMeal.id, item.id)}>
                  Remover
                </button>
              </div>
            ))}
            {selectedMeal && selectedMeal.items.length === 0 ? <p>Nenhum alimento adicionado nesta refeicao.</p> : null}
          </div>

          {selectedMeal ? (
            <label>
              Observacao da refeicao
              <textarea rows={3} value={selectedMeal.notes} onChange={(event) => updateMeal(selectedMeal.id, { notes: event.target.value })} />
            </label>
          ) : null}

          <div className="macro-grid totals-grid">
            <span>{Math.round(totals.calories)} kcal</span>
            <span>{totals.protein.toFixed(1)}g prot</span>
            <span>{totals.carbs.toFixed(1)}g carb</span>
            <span>{totals.fat.toFixed(1)}g gord</span>
          </div>

          <label>
            Observacoes gerais
            <textarea
              name="generalNotes"
              rows={4}
              placeholder="Sono, estresse, hidratacao, atividade fisica..."
              value={generalNotes}
              onChange={(event) => setGeneralNotes(event.target.value)}
            />
          </label>
          <button className="button" type="submit" disabled={saving || !selectedPatientId}>
            {saving ? "Salvando..." : editing ? "Salvar alteracoes" : "Salvar recordatorio"}
          </button>
          {!selectedPatientId ? <p className="form-message error">Selecione um paciente.</p> : null}
          {editing ? (
            <button className="button secondary" type="button" onClick={cancelEditing}>
              Cancelar edicao
            </button>
          ) : null}
        </form>
      </aside>
    </section>
  );
}

function RecallDetails({ recall }: { recall: Recall }) {
  return (
    <div className="recall-detail-panel">
      {recall.meals.map((meal) => {
        const mealTotals = sumItems(meal.items);

        return (
          <section className="recall-detail-meal" key={meal.id}>
            <div className="recall-detail-heading">
              <div>
                <strong>{meal.label}</strong>
                <span>{meal.time || "sem horario"}</span>
              </div>
              <span>{Math.round(mealTotals.calories)} kcal</span>
            </div>
            <div className="recall-detail-items">
              {meal.items.map((item) => (
                <div className="recall-detail-item" key={item.id}>
                  <div>
                    <strong>{item.foodName}</strong>
                    <span>
                      {formatNumber(item.quantity)} x {item.portion || "porcao"}
                    </span>
                  </div>
                  <span>
                    {Math.round(toNumber(item.calories))} kcal | {toNumber(item.protein).toFixed(1)}g prot |{" "}
                    {toNumber(item.carbs).toFixed(1)}g carb | {toNumber(item.fat).toFixed(1)}g gord
                  </span>
                </div>
              ))}
            </div>
            {meal.notes ? <p>{meal.notes}</p> : null}
          </section>
        );
      })}
      {recall.generalNotes ? (
        <section className="recall-detail-notes">
          <strong>Observacoes gerais</strong>
          <p>{recall.generalNotes}</p>
        </section>
      ) : null}
    </div>
  );
}

function getRecallPayload(form: FormData, selectedPatientId: string, referenceDate: string, generalNotes: string, meals: DraftMeal[]) {
  return {
    patientId: form.get("patientId") || selectedPatientId,
    referenceDate,
    generalNotes,
    meals: meals
      .filter((meal) => meal.items.length > 0)
      .map((meal, index) => ({
        type: meal.type,
        label: meal.label || `Refeicao ${index + 1}`,
        time: meal.time,
        position: index,
        notes: meal.notes,
        items: meal.items.map(({ id: _id, ...item }) => item)
      }))
  };
}

function cloneRecallMeals(recall: Recall) {
  return createDraftMeals(recall).map((meal) => ({
    ...meal,
    id: crypto.randomUUID(),
    items: meal.items.map((item) => ({
      ...item,
      id: crypto.randomUUID()
    }))
  }));
}

function createDraftMeals(recall?: Recall): DraftMeal[] {
  if (recall) {
    const mealsByType = new Map(recall.meals.map((meal) => [meal.type, meal]));

    return mealTemplates.map((template, index) => {
      const savedMeal = mealsByType.get(template.type);

      return {
        id: savedMeal?.id || crypto.randomUUID(),
        type: template.type,
        label: savedMeal?.label || template.label,
        time: savedMeal?.time || template.time,
        position: index,
        notes: savedMeal?.notes || "",
        items: (savedMeal?.items || []).map((item) => ({
          ...item,
          quantity: toNumber(item.quantity),
          calories: toNumber(item.calories),
          protein: toNumber(item.protein),
          carbs: toNumber(item.carbs),
          fat: toNumber(item.fat),
          fiber: toNumber(item.fiber)
        }))
      };
    });
  }

  return mealTemplates.map((template, index) => ({
    id: crypto.randomUUID(),
    type: template.type,
    label: template.label,
    time: template.time,
    position: index,
    notes: "",
    items: []
  }));
}

function createManualItem() {
  return {
    id: "",
    foodName: "",
    portion: "",
    quantity: 1,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    notes: ""
  };
}

function sumItems(items: Array<Pick<RecallItem, "calories" | "protein" | "carbs" | "fat">>) {
  return items.reduce(
    (total, item) => ({
      calories: total.calories + toNumber(item.calories),
      protein: total.protein + toNumber(item.protein),
      carbs: total.carbs + toNumber(item.carbs),
      fat: total.fat + toNumber(item.fat)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function formatDateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function toNumber(value: string | number | null | undefined) {
  return Number(value || 0);
}

function roundMacro(value: number) {
  return Math.round(value * 100) / 100;
}

function formatNumber(value: string | number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(toNumber(value));
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return replacements[char];
  });
}
