"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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
  category: string | null;
};

type MealItem = {
  id: string;
  foodName: string;
  portion: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string;
};

type DraftMeal = {
  id: string;
  type: string;
  label: string;
  time: string;
  position: number;
  items: MealItem[];
};

type MealPlan = {
  id: string;
  name: string;
  targetCalories: number | null;
  targetProtein: string | number | null;
  targetCarbs: string | number | null;
  targetFat: string | number | null;
  publishedAt: string | null;
  patient: PatientOption;
  meals: Array<{
    id: string;
    label: string;
    time: string | null;
    items: MealItem[];
  }>;
};

type PatientsResponse = {
  patients: PatientOption[];
};

type FoodsResponse = {
  foods: Food[];
  total: number;
};

type MealPlansResponse = {
  mealPlans: MealPlan[];
};

const mealTemplates = [
  { type: "breakfast", label: "Cafe da manha" },
  { type: "morning_snack", label: "Lanche da manha" },
  { type: "lunch", label: "Almoco" },
  { type: "afternoon_snack", label: "Lanche da tarde" },
  { type: "dinner", label: "Jantar" },
  { type: "supper", label: "Ceia" }
];

export function MealPlansClient() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(() => searchParams.get("patientId") || "");
  const [meals, setMeals] = useState<DraftMeal[]>([createDraftMeal(0)]);
  const [selectedMealId, setSelectedMealId] = useState<string>(() => meals[0].id);
  const [foodSearch, setFoodSearch] = useState("");
  const [foodsTotal, setFoodsTotal] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const skippedInitialFoodsLoad = useRef(false);
  const skippedInitialMealPlansLoad = useRef(false);

  const selectedFood = foods.find((food) => food.id === selectedFoodId) || null;
  const selectedMeal = meals.find((meal) => meal.id === selectedMealId) || meals[0];
  const totals = useMemo(() => sumItems(meals.flatMap((meal) => meal.items)), [meals]);

  useEffect(() => {
    void loadInitialData();
  }, []);

  useEffect(() => {
    if (!skippedInitialFoodsLoad.current) {
      skippedInitialFoodsLoad.current = true;
      return;
    }

    const timeout = window.setTimeout(() => {
      void loadFoods(foodSearch);
    }, foodSearch.trim() ? 240 : 0);

    return () => window.clearTimeout(timeout);
  }, [foodSearch]);

  useEffect(() => {
    if (!skippedInitialMealPlansLoad.current) {
      skippedInitialMealPlansLoad.current = true;
      return;
    }

    void loadMealPlans(selectedPatientId);
  }, [selectedPatientId]);

  async function loadInitialData() {
    setLoading(true);
    await Promise.all([loadPatients(), loadFoods(), loadMealPlans(selectedPatientId)]);
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
  }

  async function loadFoods(search = "") {
    const params = new URLSearchParams({ limit: "60" });

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

  async function loadMealPlans(patientId = "") {
    const params = new URLSearchParams();

    if (patientId) {
      params.set("patientId", patientId);
    }

    const response = await fetch(`/api/meal-plans${params.size ? `?${params}` : ""}`);
    const data = (await response.json()) as MealPlansResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar planos alimentares.");
      return;
    }

    setMealPlans(data.mealPlans);
  }

  function addItem() {
    if (!selectedFood) {
      setMessage("Cadastre ou selecione um alimento antes de adicionar ao plano.");
      return;
    }

    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    const nextItem = {
      id: crypto.randomUUID(),
      foodName: selectedFood.name,
      portion: selectedFood.portion,
      quantity: safeQuantity,
      calories: roundMacro(toNumber(selectedFood.calories) * safeQuantity),
      protein: roundMacro(toNumber(selectedFood.protein) * safeQuantity),
      carbs: roundMacro(toNumber(selectedFood.carbs) * safeQuantity),
      fat: roundMacro(toNumber(selectedFood.fat) * safeQuantity),
      notes: ""
    };

    setMeals((current) =>
      current.map((meal) => (meal.id === selectedMeal.id ? { ...meal, items: [...meal.items, nextItem] } : meal))
    );
    setMessage(null);
  }

  function addMeal() {
    const nextMeal = createDraftMeal(meals.length);
    setMeals((current) => [...current, nextMeal]);
    setSelectedMealId(nextMeal.id);
    setMessage(null);
  }

  function updateMeal(mealId: string, patch: Partial<Pick<DraftMeal, "type" | "label" | "time">>) {
    setMeals((current) => current.map((meal) => (meal.id === mealId ? { ...meal, ...patch } : meal)));
  }

  function removeMeal(mealId: string) {
    if (meals.length === 1) {
      setMessage("O plano precisa ter pelo menos uma refeicao.");
      return;
    }

    const nextMeals = meals.filter((meal) => meal.id !== mealId).map((meal, index) => ({ ...meal, position: index }));
    setMeals(nextMeals);
    setSelectedMealId(nextMeals[0].id);
  }

  function removeItem(mealId: string, itemId: string) {
    setMeals((current) =>
      current.map((meal) =>
        meal.id === mealId ? { ...meal, items: meal.items.filter((item) => item.id !== itemId) } : meal
      )
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (meals.every((meal) => meal.items.length === 0)) {
      setMessage("Adicione pelo menos um alimento ao plano.");
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = getMealPlanPayload(form, meals);

    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel criar o plano alimentar.");
      return;
    }

    formElement.reset();
    const nextMeal = createDraftMeal(0);
    setMeals([nextMeal]);
    setSelectedMealId(nextMeal.id);
    setMessage("Plano alimentar criado com sucesso.");
    await loadMealPlans(selectedPatientId);
  }

  async function handleDelete(plan: MealPlan) {
    const confirmed = window.confirm(`Excluir o plano "${plan.name}" de ${plan.patient.name}?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(plan.id);
    setMessage(null);

    const response = await fetch(`/api/meal-plans/${plan.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel excluir o plano.");
      return;
    }

    setMessage("Plano alimentar excluido com sucesso.");
    await loadMealPlans();
  }

  async function togglePublish(plan: MealPlan) {
    const nextPublish = !plan.publishedAt;
    setPublishingId(plan.id);
    setMessage(null);

    const response = await fetch(`/api/meal-plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: nextPublish })
    });
    const data = (await response.json()) as { error?: string; mealPlan?: MealPlan };
    setPublishingId(null);

    if (!response.ok || !data.mealPlan) {
      setMessage(data.error || "Nao foi possivel atualizar a publicacao do plano.");
      return;
    }

    setMealPlans((current) => current.map((item) => (item.id === plan.id ? data.mealPlan! : item)));
    setMessage(nextPublish ? "Plano publicado no portal do paciente." : "Plano removido do portal do paciente.");
  }

  return (
    <section className="workspace-grid meal-plans-layout">
      <div className="surface meal-plan-list">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Historico</span>
            <h2>Planos criados</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo dos planos">
            <span>{mealPlans.length} total</span>
            <span>{mealPlans.filter((plan) => plan.publishedAt).length} publicados</span>
          </div>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <label className="search-field">
          <span>Paciente</span>
          <select
            className="inline-select"
            value={selectedPatientId}
            onChange={(event) => setSelectedPatientId(event.target.value)}
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
          {mealPlans.map((plan) => {
            const planTotals = sumItems(plan.meals.flatMap((meal) => meal.items));

            return (
              <article className="plan-card" key={plan.id}>
                <div>
                  <span className={plan.publishedAt ? "status-pill ok" : "status-pill"}>
                    {plan.publishedAt ? "Publicado" : "Rascunho"}
                  </span>
                  <h3>{plan.name}</h3>
                  <p>{plan.patient.name}</p>
                </div>
                <div className="macro-grid">
                  <span>{Math.round(planTotals.calories)} kcal</span>
                  <span>{planTotals.protein.toFixed(1)}g prot</span>
                  <span>{planTotals.carbs.toFixed(1)}g carb</span>
                  <span>{planTotals.fat.toFixed(1)}g gord</span>
                </div>
                <div className="row-actions">
                  <a className="text-button" href={`/meal-plans/${plan.id}`}>
                    Abrir plano
                  </a>
                  <button
                    className="text-button"
                    type="button"
                    disabled={publishingId === plan.id}
                    onClick={() => void togglePublish(plan)}
                  >
                    {publishingId === plan.id ? "Atualizando..." : plan.publishedAt ? "Tirar do portal" : "Publicar"}
                  </button>
                  <button
                    className="text-button danger"
                    type="button"
                    disabled={deletingId === plan.id}
                    onClick={() => void handleDelete(plan)}
                  >
                    {deletingId === plan.id ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </article>
            );
          })}

          {!loading && mealPlans.length === 0 ? (
            <p className="empty-card">Nenhum plano alimentar criado ainda.</p>
          ) : null}

          {loading ? <p className="empty-card">Carregando planos...</p> : null}
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">Novo plano</span>
        <h2>Montar refeicao</h2>
        <form className="form compact-form" onSubmit={handleSubmit}>
          <label>
            Paciente
            <select
              name="patientId"
              required
              value={selectedPatientId}
              onChange={(event) => setSelectedPatientId(event.target.value)}
            >
              <option value="">Selecione</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nome do plano
            <input name="name" required minLength={2} placeholder="Plano inicial" />
          </label>
          <div className="form-row">
            <label>
              Meta kcal
              <input name="targetCalories" type="number" min="1" placeholder="1800" />
            </label>
            <label>
              Meta proteina g
              <input name="targetProtein" type="number" min="0" step="0.01" placeholder="120" />
            </label>
          </div>
          <div className="form-row">
            <label>
              Meta carbo g
              <input name="targetCarbs" type="number" min="0" step="0.01" placeholder="180" />
            </label>
            <label>
              Meta gordura g
              <input name="targetFat" type="number" min="0" step="0.01" placeholder="60" />
            </label>
          </div>
          <div className="form-row">
            <button className="button secondary" type="button" onClick={addMeal}>
              Nova refeicao
            </button>
            <span className="form-hint">{meals.length} refeicao(oes) no plano</span>
          </div>

          <div className="meal-builder">
            <div className="meal-tabs" role="tablist" aria-label="Refeicoes do plano">
              {meals.map((meal) => (
                <button
                  key={meal.id}
                  className={meal.id === selectedMeal.id ? "meal-tab active" : "meal-tab"}
                  type="button"
                  onClick={() => setSelectedMealId(meal.id)}
                >
                  {meal.label || "Refeicao"}
                  <span>{meal.items.length} itens</span>
                </button>
              ))}
            </div>

            <div className="meal-editor">
              <label>
                Refeicao
                <select
                  value={selectedMeal.type}
                  onChange={(event) => {
                    const template = mealTemplates.find((meal) => meal.type === event.target.value);
                    updateMeal(selectedMeal.id, {
                      type: event.target.value,
                      label: template?.label || selectedMeal.label
                    });
                  }}
                >
                  {mealTemplates.map((meal) => (
                    <option key={meal.type} value={meal.type}>
                      {meal.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Rotulo
                <input
                  value={selectedMeal.label}
                  onChange={(event) => updateMeal(selectedMeal.id, { label: event.target.value })}
                  placeholder="Ex.: Cafe da manha"
                />
              </label>
              <label>
                Horario
                <input
                  type="time"
                  value={selectedMeal.time}
                  onChange={(event) => updateMeal(selectedMeal.id, { time: event.target.value })}
                />
              </label>
              <button className="text-button danger" type="button" onClick={() => removeMeal(selectedMeal.id)}>
                Remover refeicao
              </button>
            </div>
          </div>

          <div className="item-builder">
            <label>
              Buscar alimento
              <input
                value={foodSearch}
                onChange={(event) => setFoodSearch(event.target.value)}
                placeholder="Digite arroz, banana, frango..."
                autoComplete="off"
              />
            </label>
            <span className="form-hint">
              {foods.length === 0 ? "Nenhum alimento encontrado" : `${foods.length} resultados de ${foodsTotal}`}
            </span>

            <div className="food-results-list">
              {foods.map((food) => {
                const isActive = food.id === selectedFoodId;
                return (
                  <button
                    key={food.id}
                    type="button"
                    className={isActive ? "food-result-card active" : "food-result-card"}
                    onClick={() => setSelectedFoodId(food.id)}
                  >
                    <div className="food-result-info">
                      <strong>{food.name}</strong>
                      <span className="food-result-portion">{food.portion}</span>
                    </div>
                    <div className="food-result-macros">
                      <span className="macro-pill kcal">{Math.round(toNumber(food.calories))} kcal</span>
                      <span className="macro-pill prot">{toNumber(food.protein).toFixed(1)}g P</span>
                      <span className="macro-pill carb">{toNumber(food.carbs).toFixed(1)}g C</span>
                      <span className="macro-pill fat">{toNumber(food.fat).toFixed(1)}g G</span>
                    </div>
                  </button>
                );
              })}
              {foods.length === 0 ? (
                <p className="food-results-empty">Nenhum alimento encontrado. Tente outro termo de busca.</p>
              ) : null}
            </div>

            <div className="food-add-row">
              <label className="food-qty-label">
                Qtd
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                />
              </label>
              <button className="button secondary" type="button" onClick={addItem}>
                + Adicionar{selectedFood ? `: ${selectedFood.name.substring(0, 25)}` : ""}
              </button>
            </div>
          </div>

          <div className="selected-items">
            {selectedMeal.items.map((item) => (
              <div className="selected-item" key={item.id}>
                <div>
                  <strong>{item.foodName}</strong>
                  <span>
                    {item.quantity} x {item.portion}
                  </span>
                </div>
                <button
                  className="text-button danger"
                  type="button"
                  onClick={() => removeItem(selectedMeal.id, item.id)}
                >
                  Remover
                </button>
              </div>
            ))}
            {selectedMeal.items.length === 0 ? <p>Nenhum alimento adicionado nesta refeicao.</p> : null}
          </div>

          <div className="macro-grid totals-grid">
            <span>{Math.round(totals.calories)} kcal</span>
            <span>{totals.protein.toFixed(1)}g prot</span>
            <span>{totals.carbs.toFixed(1)}g carb</span>
            <span>{totals.fat.toFixed(1)}g gord</span>
          </div>

          <label>
            Observacoes
            <textarea name="observations" rows={4} placeholder="Orientacoes gerais do plano" />
          </label>
          <label className="checkbox-label">
            <input name="publish" type="checkbox" />
            <span>Publicar para o paciente.</span>
          </label>
          <button className="button" type="submit" disabled={saving || patients.length === 0}>
            {saving ? "Salvando..." : "Criar plano alimentar"}
          </button>
          {patients.length === 0 ? <p className="form-message error">Cadastre um paciente antes de montar planos.</p> : null}
          {foods.length === 0 ? <p className="form-message error">Cadastre alimentos antes de montar planos.</p> : null}
        </form>
      </aside>
    </section>
  );
}

function getMealPlanPayload(form: FormData, meals: DraftMeal[]) {
  const targetCalories = String(form.get("targetCalories") || "");
  const targetProtein = String(form.get("targetProtein") || "");
  const targetCarbs = String(form.get("targetCarbs") || "");
  const targetFat = String(form.get("targetFat") || "");

  return {
    patientId: form.get("patientId"),
    name: form.get("name"),
    targetCalories: targetCalories || undefined,
    targetProtein: targetProtein || undefined,
    targetCarbs: targetCarbs || undefined,
    targetFat: targetFat || undefined,
    observations: form.get("observations"),
    publish: form.get("publish") === "on",
    meals: meals
      .filter((meal) => meal.items.length > 0)
      .map((meal, index) => ({
        type: meal.type,
        label: meal.label || `Refeicao ${index + 1}`,
        time: meal.time,
        position: index,
        items: meal.items.map(({ id: _id, ...item }) => item)
      }))
  };
}

function sumItems(items: Array<Pick<MealItem, "calories" | "protein" | "carbs" | "fat">>) {
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

function toNumber(value: string | number | null | undefined) {
  return Number(value || 0);
}

function roundMacro(value: number) {
  return Math.round(value * 100) / 100;
}

function createDraftMeal(position: number): DraftMeal {
  const template = mealTemplates[position] || mealTemplates[mealTemplates.length - 1];

  return {
    id: crypto.randomUUID(),
    type: template.type,
    label: template.label,
    time: "",
    position,
    items: []
  };
}
