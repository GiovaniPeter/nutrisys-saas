"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { extractGramsFromPortion } from "@/components/foods/foods-client";

type PatientOption = {
  id: string;
  name: string;
  weightKg?: string | number | null;
};

type Food = {
  id: string;
  name: string;
  portion: string;
  householdMeasure?: string | null;
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
  category?: string | null;
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
  observations?: string | null;
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
  { type: "breakfast", label: "Café da manhã" },
  { type: "morning_snack", label: "Lanche da manhã" },
  { type: "lunch", label: "Almoço" },
  { type: "afternoon_snack", label: "Lanche da tarde" },
  { type: "dinner", label: "Jantar" },
  { type: "supper", label: "Ceia" }
];

type ReadyMealPlanTemplate = {
  key: string;
  title: string;
  badge: string;
  planName: string;
  targetCalories: string;
  targetProtein: string;
  targetCarbs: string;
  targetFat: string;
  observations: string;
  meals: Array<{
    type: string;
    label: string;
    time: string;
    items: Omit<MealItem, "id">[];
  }>;
};

const READY_MEAL_PLAN_TEMPLATES: ReadyMealPlanTemplate[] = [
  {
    key: "emagrecimento_1500",
    title: "🥗 Emagrecimento Brasileiro (~1.500 kcal)",
    badge: "Déficit Calórico + Saciedade",
    planName: "Plano Emagrecimento & Saciedade (1.500 kcal)",
    targetCalories: "1500",
    targetProtein: "118",
    targetCarbs: "145",
    targetFat: "48",
    observations:
      "1. Meta de hidratação diária: 35 ml de água por kg de peso corporal (mínimo 2,5 L/dia).\n2. Priorize temperos naturais (alho, cebola, cúrcuma, orégano, limão e ervas).\n3. Vegetais folhosos à vontade no almoço e jantar.",
    meals: [
      {
        type: "breakfast",
        label: "Café da manhã",
        time: "07:30",
        items: [
          {
            foodName: "Ovo de galinha inteiro cozido ou mexido",
            portion: "100 g (2 unidades médias)",
            quantity: 1,
            calories: 146,
            protein: 13.3,
            carbs: 0.6,
            fat: 9.5,
            notes: "Substituições: Queijo minas frescal light (70g / 2 fatias) OU Frango desfiado (80g)"
          },
          {
            foodName: "Pão de forma 100% integral",
            portion: "50 g (2 fatias)",
            quantity: 1,
            calories: 126,
            protein: 5.8,
            carbs: 21.6,
            fat: 1.8,
            notes: "Substituições: Goma de tapioca (40g / 2 col. sopa) OU Cuscuz de milho cozido (100g)"
          },
          {
            foodName: "Mamão papaia ou formosa",
            portion: "140 g (1 fatia média)",
            quantity: 1,
            calories: 63,
            protein: 0.7,
            carbs: 16.2,
            fat: 0.2,
            notes: "Substituições: Melão (200g) OU Morango (180g) OU Maçã média (110g)"
          }
        ]
      },
      {
        type: "lunch",
        label: "Almoço",
        time: "12:30",
        items: [
          {
            foodName: "Peito de frango grelhado sem pele",
            portion: "130 g (1 filé médio/grande)",
            quantity: 1,
            calories: 207,
            protein: 41.6,
            carbs: 0,
            fat: 3.2,
            notes: "Substituições: Patinho bovino magro grelhado (110g) OU Filé de tilápia grelhado (160g)"
          },
          {
            foodName: "Arroz integral ou branco cozido",
            portion: "100 g (4 colheres de sopa)",
            quantity: 1,
            calories: 124,
            protein: 2.6,
            carbs: 25.8,
            fat: 1.0,
            notes: "Substituições: Batata-doce cozida (130g) OU Mandioca/aipim cozido (100g)"
          },
          {
            foodName: "Feijão carioca ou preto cozido (50% grão / 50% caldo)",
            portion: "80 g (1 concha pequena)",
            quantity: 1,
            calories: 61,
            protein: 3.8,
            carbs: 10.9,
            fat: 0.4,
            notes: "Substituições: Lentilha cozida (80g) OU Grão-de-bico cozido (55g)"
          },
          {
            foodName: "Salada crua + Legumes no vapor + Azeite extravirgem",
            portion: "150 g vegetais + 1 colher de chá de azeite (5ml)",
            quantity: 1,
            calories: 75,
            protein: 1.8,
            carbs: 6.5,
            fat: 4.6,
            notes: "Alface, rúcula, tomate, brócolis, abobrinha ou cenoura."
          }
        ]
      },
      {
        type: "afternoon_snack",
        label: "Lanche da tarde",
        time: "16:30",
        items: [
          {
            foodName: "Iogurte natural desnatado ou proteico",
            portion: "170 g (1 pote)",
            quantity: 1,
            calories: 98,
            protein: 11.5,
            carbs: 9.2,
            fat: 1.5,
            notes: "Substituições: Whey Protein Concentrado (25g em água) OU 2 ovos mexidos"
          },
          {
            foodName: "Aveia em flocos + Banana prata",
            portion: "20 g aveia (1 col. sopa cheia) + 1 banana (70g)",
            quantity: 1,
            calories: 144,
            protein: 3.8,
            carbs: 28.4,
            fat: 1.7,
            notes: "Adicione canela em pó a gosto."
          }
        ]
      },
      {
        type: "dinner",
        label: "Jantar",
        time: "20:00",
        items: [
          {
            foodName: "Patinho bovino moído ou filé de frango grelhado",
            portion: "120 g (4 colheres de sopa cheias)",
            quantity: 1,
            calories: 215,
            protein: 38.4,
            carbs: 0,
            fat: 5.8,
            notes: "Substituições: Omelete com 2 ovos + 50g de frango desfiado"
          },
          {
            foodName: "Abóbora cabotiá / Batata inglesa assada ou purê",
            portion: "130 g (3 colheres de servir)",
            quantity: 1,
            calories: 112,
            protein: 2.2,
            carbs: 24.5,
            fat: 0.5,
            notes: "Substituições: Arroz cozido (90g) OU Inhame cozido (110g)"
          },
          {
            foodName: "Mix de folhas verdes + Castanha-do-Pará (2 unidades)",
            portion: "Prato fundo de folhas + 10 g oleaginosas",
            quantity: 1,
            calories: 85,
            protein: 2.1,
            carbs: 3.2,
            fat: 6.8,
            notes: "Mastigue devagar e evite líquidos açucarados na refeição."
          }
        ]
      }
    ]
  },
  {
    key: "hipertrofia_2650",
    title: "💪 Hipertrofia & Performance (~2.650 kcal)",
    badge: "Superávit Limpo + Alta Proteína",
    planName: "Plano Hipertrofia & Performance Esportiva (2.650 kcal)",
    targetCalories: "2650",
    targetProtein: "185",
    targetCarbs: "335",
    targetFat: "62",
    observations:
      "1. Creatina monohidratada: 5g todos os dias (inclusive nos dias sem treino).\n2. Hidratação mínima: 40 ml/kg de peso corporal.\n3. Fracionamento proteico estratégico a cada 3h30–4h para estímulo máximo de síntese proteica (MPS).",
    meals: [
      {
        type: "breakfast",
        label: "Café da manhã",
        time: "07:30",
        items: [
          {
            foodName: "Ovos mexidos inteiros (3 unidades)",
            portion: "150 g (3 ovos médios)",
            quantity: 1,
            calories: 219,
            protein: 19.9,
            carbs: 0.9,
            fat: 14.2,
            notes: "Substituições: 2 ovos + 50g de frango desfiado"
          },
          {
            foodName: "Pão francês ou Pão integral + Requeijão light",
            portion: "100 g (2 unidades) + 20 g requeijão light",
            quantity: 1,
            calories: 310,
            protein: 11.2,
            carbs: 58.6,
            fat: 3.8,
            notes: "Substituições: Cuscuz de milho hidratado (220g cozido) OU Tapioca (80g) + Aveia (30g)"
          },
          {
            foodName: "Banana nanica + Aveia em flocos",
            portion: "100 g banana + 30 g aveia (2 col. sopa)",
            quantity: 1,
            calories: 210,
            protein: 5.6,
            carbs: 42.8,
            fat: 2.5,
            notes: "Excelente aporte energético matinal."
          }
        ]
      },
      {
        type: "lunch",
        label: "Almoço",
        time: "12:30",
        items: [
          {
            foodName: "Peito de frango grelhado ou Alcatra limpa",
            portion: "160 g pesado pronto",
            quantity: 1,
            calories: 254,
            protein: 51.2,
            carbs: 0,
            fat: 4.0,
            notes: "Substituições: Patinho bovino (150g) OU Tilápia grelhada (200g)"
          },
          {
            foodName: "Arroz branco ou parboilizado cozido",
            portion: "220 g (8 colheres de sopa)",
            quantity: 1,
            calories: 281,
            protein: 5.5,
            carbs: 61.8,
            fat: 0.5,
            notes: "Substituições: Macarrão cozido (200g) OU Batata inglesa cozida (320g)"
          },
          {
            foodName: "Feijão cozido + Azeite de oliva extravirgem",
            portion: "140 g feijão (1 concha grande) + 10 ml azeite",
            quantity: 1,
            calories: 196,
            protein: 6.7,
            carbs: 19.0,
            fat: 10.2,
            notes: "Adicione legumes variados e salada crua."
          }
        ]
      },
      {
        type: "afternoon_snack",
        label: "Pré/Pós-Treino (Lanche da tarde)",
        time: "16:30",
        items: [
          {
            foodName: "Whey Protein Concentrado 80% + Creatina (5g)",
            portion: "35 g Whey (1,2 scoop) + 5 g Creatina",
            quantity: 1,
            calories: 140,
            protein: 28.0,
            carbs: 3.2,
            fat: 1.8,
            notes: "Substituições: Peito de frango desfiado (100g) OU 170g Iogurte Proteico + 2 claras"
          },
          {
            foodName: "Banana prata amassada + Aveia + Mel",
            portion: "120 g banana + 40 g aveia + 15 g mel (1 col. sopa)",
            quantity: 1,
            calories: 315,
            protein: 7.2,
            carbs: 66.5,
            fat: 3.1,
            notes: "Substituições: Pão de forma (3 fatias) com doce de leite (35g)"
          }
        ]
      },
      {
        type: "dinner",
        label: "Jantar",
        time: "20:30",
        items: [
          {
            foodName: "Patinho bovino grelhado ou Frango em cubos",
            portion: "160 g pesado pronto",
            quantity: 1,
            calories: 270,
            protein: 48.0,
            carbs: 0,
            fat: 7.2,
            notes: "Fonte proteica de alto valor biológico noturna."
          },
          {
            foodName: "Batata-doce cozida ou Arroz branco",
            portion: "240 g batata-doce (ou 180 g arroz cozido)",
            quantity: 1,
            calories: 230,
            protein: 4.2,
            carbs: 52.0,
            fat: 0.4,
            notes: "Reposição completa de glicogênio muscular."
          },
          {
            foodName: "Abacate ou Pasta de Amendoim integral (Ceia)",
            portion: "100 g abacate (ou 25 g pasta de amendoim)",
            quantity: 1,
            calories: 160,
            protein: 5.0,
            carbs: 8.5,
            fat: 13.5,
            notes: "Pode ser consumido na ceia com 170g de iogurte natural."
          }
        ]
      }
    ]
  },
  {
    key: "reeducacao_1900",
    title: "⚖️ Reeducação Alimentar (~1.900 kcal)",
    badge: "Equilíbrio & Saúde",
    planName: "Plano Reeducação Alimentar Brasileira (1.900 kcal)",
    targetCalories: "1900",
    targetProtein: "130",
    targetCarbs: "215",
    targetFat: "58",
    observations:
      "1. Cardápio equilibrado com alimentos tradicionais brasileiros e medidas caseiras práticas.\n2. Mastigue bem e mantenha regularidade nos horários das refeições.",
    meals: [
      {
        type: "breakfast",
        label: "Café da manhã",
        time: "07:30",
        items: [
          {
            foodName: "Pão integral (2 fatias) + Ovos mexidos (2 unid)",
            portion: "50 g pão + 100 g ovos",
            quantity: 1,
            calories: 272,
            protein: 19.1,
            carbs: 22.2,
            fat: 11.3,
            notes: "Substituições: Tapioca (50g) com queijo minas padrão (50g)"
          },
          {
            foodName: "Fruta da estação + Semente de chia (1 col. sopa)",
            portion: "130 g fruta + 10 g chia",
            quantity: 1,
            calories: 118,
            protein: 2.8,
            carbs: 19.5,
            fat: 3.4,
            notes: "Rico em fibras solúveis e ômega-3 vegetal."
          }
        ]
      },
      {
        type: "lunch",
        label: "Almoço",
        time: "12:30",
        items: [
          {
            foodName: "Arroz cozido + Feijão cozido (dupla brasileira)",
            portion: "140 g arroz (5 col. sopa) + 100 g feijão (1 concha média)",
            quantity: 1,
            calories: 255,
            protein: 8.4,
            carbs: 51.0,
            fat: 1.1,
            notes: "Combinação completa de aminoácidos essenciais."
          },
          {
            foodName: "Filé de frango, peixe assado ou carne bovina magra",
            portion: "140 g (1 filé grande)",
            quantity: 1,
            calories: 225,
            protein: 44.0,
            carbs: 0,
            fat: 4.5,
            notes: "Varie entre aves, peixes e cortes magros ao longo da semana."
          }
        ]
      },
      {
        type: "afternoon_snack",
        label: "Lanche da tarde",
        time: "16:30",
        items: [
          {
            foodName: "Iogurte natural + Granola sem açúcar + Morangos",
            portion: "170 g iogurte + 30 g granola/aveia + 100 g frutas",
            quantity: 1,
            calories: 245,
            protein: 13.5,
            carbs: 34.0,
            fat: 5.5,
            notes: "Prático para levar ao trabalho."
          }
        ]
      },
      {
        type: "dinner",
        label: "Jantar",
        time: "20:00",
        items: [
          {
            foodName: "Frango desfiado ou Atum + Raízes assadas + Azeite",
            portion: "130 g proteína + 150 g batata-doce/mandioca + 10 ml azeite",
            quantity: 1,
            calories: 440,
            protein: 41.0,
            carbs: 36.0,
            fat: 14.0,
            notes: "Acompanhe com salada verde variada."
          }
        ]
      }
    ]
  },
  {
    key: "lowcarb_1600",
    title: "🥑 Low Carb & Controle Glicêmico (~1.600 kcal)",
    badge: "Resistência à Insulina / SOP",
    planName: "Plano Low Carb & Controle Glicêmico (1.600 kcal)",
    targetCalories: "1600",
    targetProtein: "135",
    targetCarbs: "85",
    targetFat: "80",
    observations:
      "1. Estratégia com carga glicêmica reduzida, ideal para resistência insulínica, pré-diabetes, SOP e esteatose hepática.\n2. Gorduras boas (abacate, azeite extravirgem, castanhas, ovos e peixes) garantem saciedade prolongada.",
    meals: [
      {
        type: "breakfast",
        label: "Café da manhã Low Carb",
        time: "08:00",
        items: [
          {
            foodName: "Omelete com 3 ovos + Queijo muçarela/minas + Espinafre",
            portion: "3 ovos + 30 g queijo + espinafre/tomate",
            quantity: 1,
            calories: 310,
            protein: 27.0,
            carbs: 2.5,
            fat: 21.5,
            notes: "Sem pico glicêmico matinal."
          },
          {
            foodName: "Abacate com limão ou chia",
            portion: "80 g (3 colheres de sopa)",
            quantity: 1,
            calories: 128,
            protein: 1.6,
            carbs: 6.8,
            fat: 11.5,
            notes: "Substituições: 150g de morangos + 15g de castanhas"
          }
        ]
      },
      {
        type: "lunch",
        label: "Almoço",
        time: "12:30",
        items: [
          {
            foodName: "Salmão, Tilápia ou Peito de Frango grelhado",
            portion: "150 g (1 posta/filé grande)",
            quantity: 1,
            calories: 265,
            protein: 45.0,
            carbs: 0,
            fat: 8.5,
            notes: "Substituições: Alcatra ou Mignon grelhado (140g)"
          },
          {
            foodName: "Legumes de baixo índice glicêmico (Brócolis, Couve-flor, Abobrinha)",
            portion: "220 g no vapor ou salteados no azeite (10ml)",
            quantity: 1,
            calories: 165,
            protein: 5.2,
            carbs: 14.0,
            fat: 10.5,
            notes: "Rico em sulforafano, fibras e magnésio."
          }
        ]
      },
      {
        type: "afternoon_snack",
        label: "Lanche da tarde",
        time: "16:30",
        items: [
          {
            foodName: "Iogurte Grego Natural sem açúcar + Mix de Castanhas e Nozes",
            portion: "150 g iogurte + 25 g oleaginosas",
            quantity: 1,
            calories: 285,
            protein: 18.0,
            carbs: 11.0,
            fat: 19.0,
            notes: "Substituições: Whey Protein (30g) + 15g Pasta de Amendoim"
          }
        ]
      },
      {
        type: "dinner",
        label: "Jantar",
        time: "20:00",
        items: [
          {
            foodName: "Frango ou Carne Magra + Abóbora Cabotiá assada + Salada",
            portion: "140 g proteína + 120 g abóbora cabotiá + azeite (5ml)",
            quantity: 1,
            calories: 385,
            protein: 40.0,
            carbs: 22.0,
            fat: 13.5,
            notes: "Jantar leve de fácil digestão noturna."
          }
        ]
      }
    ]
  }
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
  const [foodCategoryFilter, setFoodCategoryFilter] = useState("");
  const [foodsTotal, setFoodsTotal] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [quantityMode, setQuantityMode] = useState<"portion" | "grams">("portion");
  const [quantity, setQuantity] = useState(1);
  const [customGrams, setCustomGrams] = useState(100);

  // Controlled Plan Header Fields so 1-Click Templates fill them automatically
  const [planNameInput, setPlanNameInput] = useState("");
  const [targetKcalInput, setTargetKcalInput] = useState("");
  const [targetProtInput, setTargetProtInput] = useState("");
  const [targetCarbInput, setTargetCarbInput] = useState("");
  const [targetFatInput, setTargetFatInput] = useState("");
  const [observationsInput, setObservationsInput] = useState("");

  const skippedInitialFoodsLoad = useRef(false);
  const skippedInitialMealPlansLoad = useRef(false);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  );
  const selectedFood = foods.find((food) => food.id === selectedFoodId) || null;
  const selectedMeal = meals.find((meal) => meal.id === selectedMealId) || meals[0];
  const totals = useMemo(() => sumItems(meals.flatMap((meal) => meal.items)), [meals]);

  // % VET and g/kg calculation (Dietbox style)
  const macroAnalytics = useMemo(() => {
    const totalKcal = Math.max(1, totals.calories);
    const pKcal = totals.protein * 4;
    const cKcal = totals.carbs * 4;
    const fKcal = totals.fat * 9;
    const pPct = totals.calories > 0 ? Math.round((pKcal / totalKcal) * 100) : 0;
    const cPct = totals.calories > 0 ? Math.round((cKcal / totalKcal) * 100) : 0;
    const fPct = totals.calories > 0 ? Math.max(0, 100 - pPct - cPct) : 0;

    const patientWeight = toNumber(selectedPatient?.weightKg) || 68;
    const pGPerKg = (totals.protein / patientWeight).toFixed(2);
    const cGPerKg = (totals.carbs / patientWeight).toFixed(2);
    const fGPerKg = (totals.fat / patientWeight).toFixed(2);
    const waterTargetMl = Math.round(patientWeight * 35);

    return { pPct, cPct, fPct, pGPerKg, cGPerKg, fGPerKg, patientWeight, waterTargetMl };
  }, [totals, selectedPatient]);

  useEffect(() => {
    void loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedFood) {
      setCustomGrams(extractGramsFromPortion(selectedFood.portion));
    }
  }, [selectedFoodId]);

  useEffect(() => {
    if (!skippedInitialFoodsLoad.current) {
      skippedInitialFoodsLoad.current = true;
      return;
    }

    const timeout = setTimeout(() => {
      void loadFoods(foodSearch, foodCategoryFilter);
    }, 180);

    return () => clearTimeout(timeout);
  }, [foodSearch, foodCategoryFilter]);

  useEffect(() => {
    if (!skippedInitialMealPlansLoad.current) {
      skippedInitialMealPlansLoad.current = true;
      return;
    }

    void loadMealPlans(selectedPatientId);
  }, [selectedPatientId]);

  async function loadInitialData() {
    setLoading(true);
    await Promise.all([
      loadPatients(),
      loadFoods("", ""),
      loadMealPlans(searchParams.get("patientId") || "")
    ]);
    setLoading(false);
  }

  async function loadPatients() {
    const response = await fetch("/api/patients");
    const data = (await response.json()) as PatientsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Não foi possível carregar pacientes.");
      return;
    }

    setPatients(data.patients);
    if (!selectedPatientId && !searchParams.get("patientId") && data.patients[0]) {
      setSelectedPatientId(data.patients[0].id);
    }
  }

  async function loadFoods(query = "", category = "") {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);

    const response = await fetch(`/api/foods${params.size ? `?${params}` : ""}`);
    const data = (await response.json()) as FoodsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Não foi possível carregar alimentos.");
      return;
    }

    setFoods(data.foods);
    setFoodsTotal(data.total);
    if (data.foods[0] && !data.foods.some((food) => food.id === selectedFoodId)) {
      setSelectedFoodId(data.foods[0].id);
    }
  }

  async function loadMealPlans(patientId = "") {
    const params = new URLSearchParams();
    if (patientId) params.set("patientId", patientId);

    const response = await fetch(`/api/meal-plans${params.size ? `?${params}` : ""}`);
    const data = (await response.json()) as MealPlansResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Não foi possível carregar planos alimentares.");
      return;
    }

    setMealPlans(data.mealPlans);
  }

  function applyReadyTemplate(template: ReadyMealPlanTemplate) {
    setPlanNameInput(template.planName);
    setTargetKcalInput(template.targetCalories);
    setTargetProtInput(template.targetProtein);
    setTargetCarbInput(template.targetCarbs);
    setTargetFatInput(template.targetFat);
    setObservationsInput(template.observations);

    const clonedMeals: DraftMeal[] = template.meals.map((m, idx) => ({
      id: crypto.randomUUID(),
      type: m.type,
      label: m.label,
      time: m.time,
      position: idx,
      items: m.items.map((item) => ({
        ...item,
        id: crypto.randomUUID()
      }))
    }));

    setMeals(clonedMeals);
    setSelectedMealId(clonedMeals[0].id);
    setMessage(`Template "${template.title}" aplicado! Ajuste o que desejar ou clique em Criar Plano Alimentar.`);
  }

  function printMealPlanPdf(plan: {
    name: string;
    patientName: string;
    targetCalories?: number | string | null;
    observations?: string | null;
    meals: Array<{ label: string; time: string | null; items: MealItem[] }>;
  }) {
    const win = window.open("", "_blank", "width=960,height=800");
    if (!win) return;

    const allItems = plan.meals.flatMap((m) => m.items);
    const planSum = sumItems(allItems);
    const totalK = Math.max(1, planSum.calories);
    const pPct = Math.round(((planSum.protein * 4) / totalK) * 100);
    const cPct = Math.round(((planSum.carbs * 4) / totalK) * 100);
    const fPct = Math.max(0, 100 - pPct - cPct);

    const mealsHtml = plan.meals
      .map((meal) => {
        const mealSum = sumItems(meal.items);
        const itemsRows = meal.items
          .map(
            (it) => `
          <tr>
            <td style="width:42%;">
              <strong>${it.foodName}</strong>
              ${it.notes ? `<div style="margin-top:4px;font-size:11.5px;color:#059669;font-weight:600;">↳ ${it.notes}</div>` : ""}
            </td>
            <td style="width:32%;font-weight:600;color:#1e293b;">
              ${it.quantity > 1 ? `${it.quantity} x ` : ""}${it.portion}
            </td>
            <td style="width:26%;font-size:12px;color:#475569;">
              <strong>${Math.round(toNumber(it.calories))} kcal</strong><br/>
              P: ${toNumber(it.protein).toFixed(1)}g | C: ${toNumber(it.carbs).toFixed(1)}g | G: ${toNumber(it.fat).toFixed(1)}g
            </td>
          </tr>
        `
          )
          .join("");

        return `
        <div class="meal-box">
          <div class="meal-header">
            <div>
              <span class="meal-time">${meal.time || "Horário livre"}</span>
              <strong>${meal.label}</strong>
            </div>
            <div class="meal-totals">
              ${Math.round(mealSum.calories)} kcal · P ${mealSum.protein.toFixed(1)}g · C ${mealSum.carbs.toFixed(1)}g · G ${mealSum.fat.toFixed(1)}g
            </div>
          </div>
          <table>
            <tbody>${itemsRows}</tbody>
          </table>
        </div>
      `;
      })
      .join("");

    win.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Plano Alimentar Individualizado — ${plan.patientName}</title>
        <style>
          body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #0f172a; margin: 28px 36px; line-height: 1.45; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #059669; padding-bottom: 14px; margin-bottom: 20px; }
          .brand { font-size: 23px; font-weight: 800; color: #059669; letter-spacing: -0.02em; }
          .patient-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
          .patient-banner div strong { display: block; font-size: 17px; color: #065f46; }
          .patient-banner div span { font-size: 11.5px; color: #475569; font-weight: 600; }
          .meal-box { border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; margin-bottom: 16px; page-break-inside: avoid; }
          .meal-header { background: #065f46; color: #fff; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; }
          .meal-time { background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-right: 8px; }
          .meal-totals { font-size: 12px; opacity: 0.92; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; vertical-align: top; font-size: 13px; }
          tr:last-child td { border-bottom: none; }
          .obs { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-top: 18px; font-size: 12.5px; white-space: pre-line; }
          .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11.5px; color: #64748b; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">NutriPlan — Prescrição Dietética Individualizada</div>
            <div style="font-size:14px;font-weight:700;margin-top:4px;">${plan.name}</div>
            <div style="font-size:12.5px;color:#475569;">Paciente: <strong>${plan.patientName}</strong> | Data: ${new Intl.DateTimeFormat("pt-BR").format(new Date())}</div>
          </div>
          <div style="text-align:right;font-size:12px;color:#334155;">
            <strong>Uso Exclusivo do Nutricionista (Lei 8.234/91)</strong><br/>
            Tabela TACO / IBGE & Medidas Caseiras
          </div>
        </div>

        <div class="patient-banner">
          <div>
            <strong>${Math.round(planSum.calories)} kcal/dia</strong>
            <span>Valor Energético Total (VET)</span>
          </div>
          <div>
            <strong>${planSum.protein.toFixed(1)}g (${pPct}%)</strong>
            <span>Proteínas Totais</span>
          </div>
          <div>
            <strong>${planSum.carbs.toFixed(1)}g (${cPct}%)</strong>
            <span>Carboidratos Totais</span>
          </div>
          <div>
            <strong>${planSum.fat.toFixed(1)}g (${fPct}%)</strong>
            <span>Lipídios Totais</span>
          </div>
        </div>

        ${mealsHtml}

        ${
          plan.observations
            ? `<div class="obs"><strong>Orientações Nutricionais & Hidratação:</strong>\n${plan.observations}</div>`
            : ""
        }

        <div class="footer">
          <span>Gerado via NutriPlan — Software Especializado para Nutricionistas</span>
          <span>Assinatura / Carimbo CRN do Nutricionista Responsável</span>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
    win.document.close();
  }

  function addItem() {
    if (!selectedFood || !selectedMeal) return;

    const baseGrams = extractGramsFromPortion(selectedFood.portion);
    let multiplier = 1;
    let displayQuantity = 1;
    let displayPortion = selectedFood.householdMeasure
      ? `${selectedFood.householdMeasure} (${selectedFood.portion})`
      : selectedFood.portion;

    if (quantityMode === "grams") {
      const safeGrams = Number.isFinite(customGrams) && customGrams > 0 ? customGrams : baseGrams;
      multiplier = baseGrams > 0 ? safeGrams / baseGrams : 1;
      displayQuantity = 1;
      const unit = selectedFood.portion.toLowerCase().includes("ml") ? "ml" : "g";
      displayPortion = selectedFood.householdMeasure
        ? `${safeGrams} ${unit} [Ref: ${selectedFood.householdMeasure}]`
        : `${safeGrams} ${unit}`;
    } else {
      const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
      multiplier = safeQuantity;
      displayQuantity = safeQuantity;
    }

    const nextItem: MealItem = {
      id: crypto.randomUUID(),
      foodName: selectedFood.name,
      portion: displayPortion,
      quantity: displayQuantity,
      calories: roundMacro(toNumber(selectedFood.calories) * multiplier),
      protein: roundMacro(toNumber(selectedFood.protein) * multiplier),
      carbs: roundMacro(toNumber(selectedFood.carbs) * multiplier),
      fat: roundMacro(toNumber(selectedFood.fat) * multiplier),
      notes: "",
      category: selectedFood.category
    };

    setMeals((current) =>
      current.map((meal) => (meal.id === selectedMeal.id ? { ...meal, items: [...meal.items, nextItem] } : meal))
    );
    setMessage(null);
  }

  function updateItemNotes(mealId: string, itemId: string, notes: string) {
    setMeals((current) =>
      current.map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              items: meal.items.map((item) => (item.id === itemId ? { ...item, notes } : item))
            }
          : meal
      )
    );
  }

  function suggestSubstitutions(mealId: string, item: MealItem) {
    const targetKcal = Math.max(item.calories, 15);
    const candidates = foods.filter(
      (f) =>
        f.name !== item.foodName &&
        toNumber(f.calories) > 10 &&
        (item.category ? f.category === item.category : true)
    );

    if (candidates.length === 0) {
      setMessage("Busque ou carregue mais alimentos da mesma categoria para sugerir substituições.");
      return;
    }

    const picked = candidates.slice(0, 3).map((candidate) => {
      const candBaseGrams = extractGramsFromPortion(candidate.portion);
      const candKcal = toNumber(candidate.calories);
      const eqGrams = Math.max(5, Math.round((targetKcal / candKcal) * candBaseGrams));
      return `${candidate.name} (${eqGrams}g)`;
    });

    const suggestionText = `Substituições equivalentes: ${picked.join(" OU ")}`;
    updateItemNotes(mealId, item.id, suggestionText);
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
      setMessage("O plano precisa ter pelo menos uma refeição.");
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
      setMessage(data.error || "Não foi possível criar o plano alimentar.");
      return;
    }

    setPlanNameInput("");
    setTargetKcalInput("");
    setTargetProtInput("");
    setTargetCarbInput("");
    setTargetFatInput("");
    setObservationsInput("");
    const nextMeal = createDraftMeal(0);
    setMeals([nextMeal]);
    setSelectedMealId(nextMeal.id);
    setMessage("Plano alimentar criado com sucesso.");
    await loadMealPlans(selectedPatientId);
  }

  async function handleDelete(plan: MealPlan) {
    const confirmed = window.confirm(`Excluir o plano "${plan.name}" de ${plan.patient.name}?`);
    if (!confirmed) return;

    setDeletingId(plan.id);
    setMessage(null);

    const response = await fetch(`/api/meal-plans/${plan.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível excluir o plano.");
      return;
    }

    setMessage("Plano alimentar excluído com sucesso.");
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
      setMessage(data.error || "Não foi possível atualizar a publicação do plano.");
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
            <span className="eyebrow">Histórico & Impressão CRN</span>
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
                    {plan.publishedAt ? "Publicado no Portal" : "Rascunho"}
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
                <div className="row-actions" style={{ flexWrap: "wrap", gap: "8px" }}>
                  <a className="text-button" href={`/meal-plans/${plan.id}`}>
                    Abrir plano
                  </a>
                  <button
                    className="text-button"
                    type="button"
                    style={{ color: "#059669", fontWeight: 700 }}
                    onClick={() =>
                      printMealPlanPdf({
                        name: plan.name,
                        patientName: plan.patient.name,
                        targetCalories: plan.targetCalories,
                        observations: plan.observations,
                        meals: plan.meals
                      })
                    }
                  >
                    🖨️ PDF c/ CRN
                  </button>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <span className="eyebrow">Prescrição Dietética TACO + Medidas Caseiras</span>
            <h2>Montar Cardápio</h2>
          </div>
          <button
            type="button"
            className="button secondary"
            onClick={() =>
              printMealPlanPdf({
                name: planNameInput || "Plano Alimentar Individualizado",
                patientName: selectedPatient?.name || "Paciente",
                targetCalories: targetKcalInput,
                observations: observationsInput,
                meals
              })
            }
          >
            🖨️ Pré-visualizar PDF c/ CRN
          </button>
        </div>

        {/* Biblioteca de Templates Prontos em 1 Clique (Estilo Dietbox) */}
        <div
          style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)",
            border: "1px solid #bbf7d0",
            borderRadius: "14px",
            padding: "12px 14px",
            marginBottom: "14px"
          }}
        >
          <strong style={{ display: "block", fontSize: "0.82rem", color: "#065f46", marginBottom: "8px" }}>
            ⚡ Biblioteca de Cardápios Base (Carregar em 1 Clique com Substituições Prontas):
          </strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "8px" }}>
            {READY_MEAL_PLAN_TEMPLATES.map((tpl) => (
              <button
                key={tpl.key}
                type="button"
                onClick={() => applyReadyTemplate(tpl)}
                style={{
                  background: "#fff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  padding: "8px 10px",
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                <strong style={{ display: "block", fontSize: "0.78rem", color: "#0f172a" }}>{tpl.title}</strong>
                <span style={{ fontSize: "0.68rem", color: "#059669", fontWeight: 700 }}>{tpl.badge}</span>
              </button>
            ))}
          </div>
        </div>

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
            <input
              name="name"
              required
              minLength={2}
              value={planNameInput}
              onChange={(e) => setPlanNameInput(e.target.value)}
              placeholder="Plano inicial / Hipertrofia / Reeducação"
            />
          </label>
          <div className="form-row">
            <label>
              Meta kcal
              <input
                name="targetCalories"
                type="number"
                min="1"
                value={targetKcalInput}
                onChange={(e) => setTargetKcalInput(e.target.value)}
                placeholder="1800"
              />
            </label>
            <label>
              Meta proteína (g)
              <input
                name="targetProtein"
                type="number"
                min="0"
                step="0.01"
                value={targetProtInput}
                onChange={(e) => setTargetProtInput(e.target.value)}
                placeholder="120"
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Meta carbo (g)
              <input
                name="targetCarbs"
                type="number"
                min="0"
                step="0.01"
                value={targetCarbInput}
                onChange={(e) => setTargetCarbInput(e.target.value)}
                placeholder="180"
              />
            </label>
            <label>
              Meta gordura (g)
              <input
                name="targetFat"
                type="number"
                min="0"
                step="0.01"
                value={targetFatInput}
                onChange={(e) => setTargetFatInput(e.target.value)}
                placeholder="60"
              />
            </label>
          </div>
          <div className="form-row">
            <button className="button secondary" type="button" onClick={addMeal}>
              + Nova refeição
            </button>
            <span className="form-hint">{meals.length} refeição(ões) no plano</span>
          </div>

          <div className="meal-builder">
            <div className="meal-tabs" role="tablist" aria-label="Refeições do plano">
              {meals.map((meal) => (
                <button
                  key={meal.id}
                  className={meal.id === selectedMeal.id ? "meal-tab active" : "meal-tab"}
                  type="button"
                  onClick={() => setSelectedMealId(meal.id)}
                >
                  {meal.label || "Refeição"}
                  <span>{meal.items.length} itens</span>
                </button>
              ))}
            </div>

            <div className="meal-editor">
              <label>
                Refeição
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
                Rótulo
                <input
                  value={selectedMeal.label}
                  onChange={(event) => updateMeal(selectedMeal.id, { label: event.target.value })}
                  placeholder="Ex.: Café da manhã"
                />
              </label>
              <label>
                Horário
                <input
                  type="time"
                  value={selectedMeal.time}
                  onChange={(event) => updateMeal(selectedMeal.id, { time: event.target.value })}
                />
              </label>
              <button className="text-button danger" type="button" onClick={() => removeMeal(selectedMeal.id)}>
                Remover refeição
              </button>
            </div>
          </div>

          <div className="item-builder">
            <div className="form-row">
              <label style={{ flex: 1.5 }}>
                Buscar alimento ou suplemento
                <input
                  value={foodSearch}
                  onChange={(event) => setFoodSearch(event.target.value)}
                  placeholder="Ex: pão francês, arroz, frango, whey..."
                  autoComplete="off"
                />
              </label>
              <label style={{ flex: 1 }}>
                Filtrar grupo
                <select
                  value={foodCategoryFilter}
                  onChange={(e) => setFoodCategoryFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Cereais, Pães e Tubérculos">Cereais e Pães</option>
                  <option value="Carnes, Aves, Peixes e Ovos">Carnes e Ovos</option>
                  <option value="Feijões, Leguminosas e Oleaginosas">Leguminosas/Castanhas</option>
                  <option value="Frutas e Sucos Naturais">Frutas</option>
                  <option value="Verduras, Hortaliças e Legumes">Verduras e Legumes</option>
                  <option value="Laticínios, Queijos e Bebidas Vegetais">Laticínios</option>
                  <option value="Suplementos e Nutrição Esportiva">Suplementos</option>
                  <option value="Nutrição Clínica e Enteral (Multiprofissional)">Nutrição Clínica</option>
                </select>
              </label>
            </div>

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
                      <span className="food-result-portion">
                        {food.portion} {food.householdMeasure ? `· ${food.householdMeasure}` : ""}
                      </span>
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

            <div className="form-row" style={{ marginTop: "8px", alignItems: "flex-end" }}>
              <label style={{ flex: 1 }}>
                Modo de prescrição
                <select
                  value={quantityMode}
                  onChange={(e) => setQuantityMode(e.target.value as "portion" | "grams")}
                >
                  <option value="portion">Por Porção / Medida Caseira</option>
                  <option value="grams">Por Gramas / ml exatos (g/ml)</option>
                </select>
              </label>

              {quantityMode === "portion" ? (
                <label className="food-qty-label" style={{ flex: 0.7 }}>
                  Nº Porções
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={quantity}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                  />
                </label>
              ) : (
                <label className="food-qty-label" style={{ flex: 0.7 }}>
                  Peso (g/ml)
                  <input
                    type="number"
                    min="1"
                    step="5"
                    value={customGrams}
                    onChange={(event) => setCustomGrams(Number(event.target.value))}
                  />
                </label>
              )}

              <button className="button secondary" type="button" onClick={addItem} style={{ flex: 1.3 }}>
                + Adicionar{selectedFood ? `: ${selectedFood.name.substring(0, 20)}` : ""}
              </button>
            </div>
          </div>

          <div className="selected-items">
            {selectedMeal.items.map((item) => (
              <div className="selected-item" key={item.id} style={{ flexDirection: "column", alignItems: "stretch", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{item.foodName}</strong>
                    <span>
                      {item.quantity > 1 ? `${item.quantity} x ` : ""}{item.portion} · {Math.round(item.calories)} kcal (P {item.protein}g | C {item.carbs}g | G {item.fat}g)
                    </span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => suggestSubstitutions(selectedMeal.id, item)}
                      title="Gera automaticamente opções equivalentes em gramas da mesma categoria"
                    >
                      🔄 Substituições
                    </button>
                    <button
                      className="text-button danger"
                      type="button"
                      onClick={() => removeItem(selectedMeal.id, item.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <input
                  value={item.notes}
                  onChange={(e) => updateItemNotes(selectedMeal.id, item.id, e.target.value)}
                  placeholder="Observações ou lista de substituições equivalentes para este item..."
                  style={{ fontSize: "0.82rem", padding: "6px 10px" }}
                />
              </div>
            ))}
            {selectedMeal.items.length === 0 ? <p>Nenhum alimento adicionado nesta refeição.</p> : null}
          </div>

          {/* Painel de Distribuição % VET + g/kg de Peso (Estilo Dietbox) */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "12px 14px",
              marginTop: "6px"
            }}
          >
            <div className="macro-grid totals-grid" style={{ marginBottom: "8px" }}>
              <span><strong>{Math.round(totals.calories)} kcal</strong> VET</span>
              <span><strong>{totals.protein.toFixed(1)}g</strong> P ({macroAnalytics.pPct}%)</span>
              <span><strong>{totals.carbs.toFixed(1)}g</strong> C ({macroAnalytics.cPct}%)</span>
              <span><strong>{totals.fat.toFixed(1)}g</strong> G ({macroAnalytics.fPct}%)</span>
            </div>
            <div style={{ height: "10px", borderRadius: "999px", overflow: "hidden", display: "flex", background: "#e2e8f0", marginBottom: "8px" }}>
              <div style={{ width: `${macroAnalytics.pPct}%`, background: "#059669" }} />
              <div style={{ width: `${macroAnalytics.cPct}%`, background: "#0284c7" }} />
              <div style={{ width: `${macroAnalytics.fPct}%`, background: "#d97706" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "6px", fontSize: "0.75rem", color: "#475569", fontWeight: 600 }}>
              <span>PTN: <strong>{macroAnalytics.pGPerKg} g/kg</strong></span>
              <span>CHO: <strong>{macroAnalytics.cGPerKg} g/kg</strong></span>
              <span>LIP: <strong>{macroAnalytics.fGPerKg} g/kg</strong></span>
              <span>💧 Água (35ml/kg): <strong>{macroAnalytics.waterTargetMl} ml/dia</strong></span>
            </div>
          </div>

          <label>
            Orientações Nutricionais, Hidratação e Preparo
            <textarea
              name="observations"
              rows={4}
              value={observationsInput}
              onChange={(e) => setObservationsInput(e.target.value)}
              placeholder="Orientações gerais do plano, meta de água e recomendações comportamentais..."
            />
          </label>
          <label className="checkbox-label">
            <input name="publish" type="checkbox" defaultChecked />
            <span>Publicar imediatamente no Portal do Paciente</span>
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
        label: meal.label || `Refeição ${index + 1}`,
        time: meal.time,
        position: index,
        items: meal.items.map(({ id: _id, category: _category, ...item }) => item)
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
