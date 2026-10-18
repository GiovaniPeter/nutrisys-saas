'use client';

import React, { useState, useMemo } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  Badge,
  Modal,
  MacroBar,
  MacroValues,
} from '@/components/design-system';
import { TACO_DATABASE, TacoFood, HouseholdMeasure } from './taco-data';
import { calculateEquivalentSubstitutions, CalculatedSubstitution } from './substitution-engine';

export interface MealItem {
  id: string;
  foodId: string;
  foodName: string;
  category: string;
  measureName: string;
  measureGrams: number;
  quantity: number; // multiplicador da medida (ex: 1, 2, 1.5)
  totalGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  substitutionsNotes?: string[];
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  notes?: string;
  items: MealItem[];
}

// 6 Refeições Brasileiras realistas para demonstração completa
const INITIAL_MEALS: Meal[] = [
  {
    id: 'meal-1',
    name: 'Desjejum (Café da Manhã)',
    time: '07:30',
    notes: 'Tomar 300ml de água em jejum ao acordar',
    items: [
      {
        id: 'item-101',
        foodId: 'taco-ovo-cozido',
        foodName: 'Ovo de galinha inteiro cozido',
        category: 'carnes_ovos',
        measureName: '1 unidade (50g)',
        measureGrams: 50,
        quantity: 2,
        totalGrams: 100,
        calories: 146,
        protein: 13.3,
        carbs: 0.6,
        fat: 9.5,
        fiber: 0.0,
      },
      {
        id: 'item-102',
        foodId: 'taco-pao-integral',
        foodName: 'Pão de forma 100% integral',
        category: 'cereais',
        measureName: '2 fatias (50g)',
        measureGrams: 50,
        quantity: 1,
        totalGrams: 50,
        calories: 126,
        protein: 5.2,
        carbs: 22.5,
        fat: 1.6,
        fiber: 3.4,
      },
      {
        id: 'item-103',
        foodId: 'taco-banana-prata',
        foodName: 'Banana prata crua',
        category: 'frutas',
        measureName: '1 unidade média (70g)',
        measureGrams: 70,
        quantity: 1,
        totalGrams: 70,
        calories: 69,
        protein: 0.9,
        carbs: 18.2,
        fat: 0.1,
        fiber: 1.4,
      },
    ],
  },
  {
    id: 'meal-2',
    name: 'Colação (Lanche da Manhã)',
    time: '10:00',
    notes: 'Hidratação: 500ml de água durante a manhã',
    items: [
      {
        id: 'item-201',
        foodId: 'taco-iogurte-desnatado',
        foodName: 'Iogurte natural desnatado',
        category: 'laticinios',
        measureName: '1 pote (170g)',
        measureGrams: 170,
        quantity: 1,
        totalGrams: 170,
        calories: 70,
        protein: 6.5,
        carbs: 9.9,
        fat: 0.5,
        fiber: 0.0,
      },
      {
        id: 'item-202',
        foodId: 'taco-aveia',
        foodName: 'Aveia em flocos',
        category: 'cereais',
        measureName: 'colher de sopa cheia (15g)',
        measureGrams: 15,
        quantity: 2,
        totalGrams: 30,
        calories: 118,
        protein: 4.2,
        carbs: 20.0,
        fat: 2.6,
        fiber: 2.7,
      },
      {
        id: 'item-203',
        foodId: 'taco-castanha-para',
        foodName: 'Castanha-do-pará / do Brasil crua',
        category: 'gorduras',
        measureName: '1 unidade média (4g)',
        measureGrams: 4,
        quantity: 2,
        totalGrams: 8,
        calories: 51,
        protein: 1.2,
        carbs: 1.2,
        fat: 5.1,
        fiber: 0.6,
      },
    ],
  },
  {
    id: 'meal-3',
    name: 'Almoço',
    time: '12:45',
    notes: 'Mastigar devagar. Salada verde consumida antes do prato principal.',
    items: [
      {
        id: 'item-301',
        foodId: 'taco-arroz-integral',
        foodName: 'Arroz integral cozido',
        category: 'cereais',
        measureName: 'colher de servir (50g)',
        measureGrams: 50,
        quantity: 2,
        totalGrams: 100,
        calories: 124,
        protein: 2.6,
        carbs: 25.8,
        fat: 1.0,
        fiber: 2.7,
      },
      {
        id: 'item-302',
        foodId: 'taco-feijao-carioca',
        foodName: 'Feijão carioca cozido (grão + caldo)',
        category: 'leguminosas',
        measureName: 'concha média (140g)',
        measureGrams: 140,
        quantity: 1,
        totalGrams: 140,
        calories: 106,
        protein: 6.7,
        carbs: 19.0,
        fat: 0.7,
        fiber: 11.9,
      },
      {
        id: 'item-303',
        foodId: 'taco-frango-peito',
        foodName: 'Peito de frango grelhado sem pele',
        category: 'carnes_ovos',
        measureName: 'filé médio (100g)',
        measureGrams: 100,
        quantity: 1.3,
        totalGrams: 130,
        calories: 207,
        protein: 41.6,
        carbs: 0.0,
        fat: 3.3,
        fiber: 0.0,
      },
      {
        id: 'item-304',
        foodId: 'taco-salada-verde',
        foodName: 'Mix de folhas verdes (alface, rúcula, agrião)',
        category: 'vegetais',
        measureName: 'prato de sobremesa (50g)',
        measureGrams: 50,
        quantity: 1,
        totalGrams: 50,
        calories: 7,
        protein: 0.7,
        carbs: 1.2,
        fat: 0.1,
        fiber: 1.0,
      },
      {
        id: 'item-305',
        foodId: 'taco-azeite-oliva',
        foodName: 'Azeite de oliva extravirgem',
        category: 'gorduras',
        measureName: 'colher de sobremesa (5g/ml)',
        measureGrams: 5,
        quantity: 1,
        totalGrams: 5,
        calories: 44,
        protein: 0.0,
        carbs: 0.0,
        fat: 5.0,
        fiber: 0.0,
      },
    ],
  },
  {
    id: 'meal-4',
    name: 'Lanche da Tarde (Pré-Treino)',
    time: '16:30',
    notes: 'Consumir 45 a 60 min antes da atividade física',
    items: [
      {
        id: 'item-401',
        foodId: 'taco-whey-protein',
        foodName: 'Whey Protein Concentrado 80%',
        category: 'suplementos',
        measureName: '1 dosador / scoop (30g)',
        measureGrams: 30,
        quantity: 1,
        totalGrams: 30,
        calories: 120,
        protein: 24.0,
        carbs: 2.0,
        fat: 2.0,
        fiber: 0.0,
      },
      {
        id: 'item-402',
        foodId: 'taco-maca-fuji',
        foodName: 'Maçã Fuji com casca',
        category: 'frutas',
        measureName: '1 unidade média (130g)',
        measureGrams: 130,
        quantity: 1,
        totalGrams: 130,
        calories: 73,
        protein: 0.4,
        carbs: 19.8,
        fat: 0.3,
        fiber: 1.7,
      },
    ],
  },
  {
    id: 'meal-5',
    name: 'Jantar',
    time: '20:00',
    notes: 'Refeição pós-treino com foco em recuperação muscular',
    items: [
      {
        id: 'item-501',
        foodId: 'taco-batata-doce',
        foodName: 'Batata-doce cozida',
        category: 'cereais',
        measureName: 'fatia média (80g)',
        measureGrams: 80,
        quantity: 2,
        totalGrams: 160,
        calories: 123,
        protein: 1.0,
        carbs: 29.4,
        fat: 0.2,
        fiber: 3.5,
      },
      {
        id: 'item-502',
        foodId: 'taco-patinho',
        foodName: 'Carne bovina patinho grelhado / moído',
        category: 'carnes_ovos',
        measureName: 'porção moído (120g)',
        measureGrams: 120,
        quantity: 1,
        totalGrams: 120,
        calories: 263,
        protein: 43.1,
        carbs: 0.0,
        fat: 8.8,
        fiber: 0.0,
      },
      {
        id: 'item-503',
        foodId: 'taco-brocolis',
        foodName: 'Brócolis cozido no vapor',
        category: 'vegetais',
        measureName: 'xícara de chá (80g)',
        measureGrams: 80,
        quantity: 1.5,
        totalGrams: 120,
        calories: 30,
        protein: 2.5,
        carbs: 5.3,
        fat: 0.6,
        fiber: 4.1,
      },
      {
        id: 'item-504',
        foodId: 'taco-azeite-oliva',
        foodName: 'Azeite de oliva extravirgem',
        category: 'gorduras',
        measureName: 'colher de sobremesa (5g/ml)',
        measureGrams: 5,
        quantity: 1,
        totalGrams: 5,
        calories: 44,
        protein: 0.0,
        carbs: 0.0,
        fat: 5.0,
        fiber: 0.0,
      },
    ],
  },
  {
    id: 'meal-6',
    name: 'Ceia',
    time: '22:30',
    notes: 'Chá de camomila ou melissa sem açúcar liberado',
    items: [
      {
        id: 'item-601',
        foodId: 'taco-abacate',
        foodName: 'Abacate cru',
        category: 'frutas',
        measureName: 'colher de sopa cheia (35g)',
        measureGrams: 35,
        quantity: 2,
        totalGrams: 70,
        calories: 67,
        protein: 0.8,
        carbs: 4.2,
        fat: 5.9,
        fiber: 4.4,
      },
    ],
  },
];

export function MealPlannerEditor() {
  const [meals, setMeals] = useState<Meal[]>(INITIAL_MEALS);
  const [patientWeight] = useState<number>(64);
  const [targetCalories] = useState<number>(2080);

  // Estados para modal de Adicionar Alimento
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMealIdForAdd, setSelectedMealIdForAdd] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Estados para modal de Substituição em 1 Clique
  const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
  const [substitutingItem, setSubstitutingItem] = useState<{
    mealId: string;
    item: MealItem;
  } | null>(null);

  // Feedback Toast de micro-interação
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Cálculo ao vivo dos totais do dia
  const globalTotals: MacroValues = useMemo(() => {
    let calories = 0;
    let carbs = 0;
    let protein = 0;
    let fat = 0;
    let fiber = 0;

    for (const meal of meals) {
      for (const item of meal.items) {
        calories += item.calories;
        carbs += item.carbs;
        protein += item.protein;
        fat += item.fat;
        fiber += item.fiber;
      }
    }

    return {
      calories: Math.round(calories),
      carbs: Math.round(carbs),
      protein: Math.round(protein),
      fat: Math.round(fat),
      fiber: Math.round(fiber),
    };
  }, [meals]);

  // Alimentos filtrados para busca da Tabela TACO
  const filteredFoods = useMemo(() => {
    return TACO_DATABASE.filter((food) => {
      const matchesQuery =
        searchQuery.trim() === '' ||
        food.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'todos' || food.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Substituições calculadas quando um item está selecionado
  const substitutionsList: CalculatedSubstitution[] = useMemo(() => {
    if (!substitutingItem) return [];
    return calculateEquivalentSubstitutions(
      substitutingItem.item.foodId,
      substitutingItem.item.totalGrams
    );
  }, [substitutingItem]);

  // Manipulação de Alimentos
  const handleRemoveItem = (mealId: string, itemId: string) => {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== mealId) return meal;
        return {
          ...meal,
          items: meal.items.filter((item) => item.id !== itemId),
        };
      })
    );
    showToast('Alimento removido da refeição.');
  };

  const handleUpdateQuantity = (
    mealId: string,
    itemId: string,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) return;
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== mealId) return meal;
        return {
          ...meal,
          items: meal.items.map((item) => {
            if (item.id !== itemId) return item;
            const tacoFood = TACO_DATABASE.find((f) => f.id === item.foodId);
            if (!tacoFood) return item;

            const totalGrams = Math.round(item.measureGrams * newQuantity);
            const calories = Math.round((totalGrams / 100) * tacoFood.calories100g);
            const protein = Number(((totalGrams / 100) * tacoFood.protein100g).toFixed(1));
            const carbs = Number(((totalGrams / 100) * tacoFood.carbs100g).toFixed(1));
            const fat = Number(((totalGrams / 100) * tacoFood.fat100g).toFixed(1));
            const fiber = Number(((totalGrams / 100) * tacoFood.fiber100g).toFixed(1));

            return {
              ...item,
              quantity: newQuantity,
              totalGrams,
              calories,
              protein,
              carbs,
              fat,
              fiber,
            };
          }),
        };
      })
    );
  };

  const handleChangeMeasure = (
    mealId: string,
    itemId: string,
    measure: HouseholdMeasure
  ) => {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== mealId) return meal;
        return {
          ...meal,
          items: meal.items.map((item) => {
            if (item.id !== itemId) return item;
            const tacoFood = TACO_DATABASE.find((f) => f.id === item.foodId);
            if (!tacoFood) return item;

            const totalGrams = Math.round(measure.grams * item.quantity);
            const calories = Math.round((totalGrams / 100) * tacoFood.calories100g);
            const protein = Number(((totalGrams / 100) * tacoFood.protein100g).toFixed(1));
            const carbs = Number(((totalGrams / 100) * tacoFood.carbs100g).toFixed(1));
            const fat = Number(((totalGrams / 100) * tacoFood.fat100g).toFixed(1));
            const fiber = Number(((totalGrams / 100) * tacoFood.fiber100g).toFixed(1));

            return {
              ...item,
              measureName: measure.name,
              measureGrams: measure.grams,
              totalGrams,
              calories,
              protein,
              carbs,
              fat,
              fiber,
            };
          }),
        };
      })
    );
    showToast(`Medida alterada para ${measure.name}.`);
  };

  // Abrir modal de adição
  const handleOpenAddModal = (mealId: string) => {
    setSelectedMealIdForAdd(mealId);
    setSearchQuery('');
    setSelectedCategory('todos');
    setIsAddModalOpen(true);
  };

  // Adicionar alimento da busca TACO
  const handleAddFoodToMeal = (food: TacoFood) => {
    if (!selectedMealIdForAdd) return;

    const defaultMeasure = food.measures.find((m) => m.isDefault) || food.measures[0];
    const totalGrams = defaultMeasure.grams;
    const calories = Math.round((totalGrams / 100) * food.calories100g);
    const protein = Number(((totalGrams / 100) * food.protein100g).toFixed(1));
    const carbs = Number(((totalGrams / 100) * food.carbs100g).toFixed(1));
    const fat = Number(((totalGrams / 100) * food.fat100g).toFixed(1));
    const fiber = Number(((totalGrams / 100) * food.fiber100g).toFixed(1));

    const newItem: MealItem = {
      id: `item-${Date.now()}`,
      foodId: food.id,
      foodName: food.name,
      category: food.category,
      measureName: defaultMeasure.name,
      measureGrams: defaultMeasure.grams,
      quantity: 1,
      totalGrams,
      calories,
      protein,
      carbs,
      fat,
      fiber,
    };

    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== selectedMealIdForAdd) return meal;
        return {
          ...meal,
          items: [...meal.items, newItem],
        };
      })
    );

    setIsAddModalOpen(false);
    showToast(`${food.name} adicionado com sucesso!`);
  };

  // Abrir modal de substituição em 1 clique
  const handleOpenSubstitutionModal = (mealId: string, item: MealItem) => {
    setSubstitutingItem({ mealId, item });
    setIsSubstitutionModalOpen(true);
  };

  // Aplicar substituição em 1 clique
  const handleApplySubstitution = (sub: CalculatedSubstitution) => {
    if (!substitutingItem) return;

    const { mealId, item: oldItem } = substitutingItem;

    const updatedItem: MealItem = {
      ...oldItem,
      foodId: sub.targetFood.id,
      foodName: sub.targetFood.name,
      category: sub.targetFood.category,
      measureName: sub.bestMeasureText,
      measureGrams: sub.equivalentGrams,
      quantity: 1,
      totalGrams: sub.equivalentGrams,
      calories: sub.calories,
      protein: sub.protein,
      carbs: sub.carbs,
      fat: sub.fat,
      fiber: sub.fiber,
    };

    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== mealId) return meal;
        return {
          ...meal,
          items: meal.items.map((item) => (item.id === oldItem.id ? updatedItem : item)),
        };
      })
    );

    setIsSubstitutionModalOpen(false);
    showToast(`Substituído com sucesso: ${sub.targetFood.name} (${sub.bestMeasureText})`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Toast Notification Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-sage-950 text-white px-4 py-3 rounded-xl shadow-float flex items-center gap-3 border border-sage-800 text-sm animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header do Paciente & Prescrição */}
      <div className="bg-white rounded-2xl border border-sand-200 p-5 sm:p-6 shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sage-800 bg-sage-100 px-2.5 py-0.5 rounded-full">
              Prescrição Clínica Ativa
            </span>
            <span className="text-xs text-ink-500">•</span>
            <span className="text-xs font-medium text-ink-600">
              CRN-3 48.912/SP • Lei 8.234/91
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 font-display">
            Plano Alimentar: Camila Siqueira
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-600">
            <span><strong>Idade:</strong> 29 anos</span>
            <span>•</span>
            <span><strong>Peso:</strong> {patientWeight} kg</span>
            <span>•</span>
            <span><strong>Altura:</strong> 1,65 m</span>
            <span>•</span>
            <span><strong>% Gordura:</strong> 21,4% (Pollock 7)</span>
            <span>•</span>
            <span><strong>TMB Cunningham:</strong> 1.485 kcal</span>
          </div>
        </div>

        {/* Ações Rápidas de Alta Produtividade */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => showToast('Para duplicar um plano real, acesse Planos alimentares na sua conta.')}
          >
            📋 Duplicar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast('A impressão está disponível nos planos cadastrados na sua conta.')}
          >
            📄 Impressão (na conta)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => showToast('Para disponibilizar um plano no portal, publique-o pela sua conta.')}
          >
            📱 Enviar ao Paciente
          </Button>
          <Button
            variant="terracotta"
            size="sm"
            onClick={() => showToast('Esta é uma demonstração. Crie sua conta para salvar planos alimentares reais.')}
          >
            💾 Salvar (na conta)
          </Button>
        </div>
      </div>

      {/* 2. Painel Global de Macros e VET em Tempo Real */}
      <MacroBar
        current={globalTotals}
        target={{
          calories: targetCalories,
          bodyWeightKg: patientWeight,
        }}
        variant="detailed"
      />

      {/* 3. Lista das 6 Refeições */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink-900 font-display">
              Refeições Estruturadas ({meals.length})
            </h2>
            <p className="text-xs text-ink-500">
              Tabela TACO calculada ao vivo com medidas caseiras em português
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newMeal: Meal = {
                id: `meal-${Date.now()}`,
                name: 'Refeição Extra',
                time: '18:00',
                items: [],
              };
              setMeals((prev) => [...prev, newMeal]);
              showToast('Nova refeição adicionada ao plano.');
            }}
          >
            + Adicionar Refeição
          </Button>
        </div>

        {meals.map((meal, mealIdx) => {
          // Totais da refeição individual
          const mealTotals = meal.items.reduce(
            (acc, item) => ({
              calories: acc.calories + item.calories,
              carbs: acc.carbs + item.carbs,
              protein: acc.protein + item.protein,
              fat: acc.fat + item.fat,
              fiber: acc.fiber + item.fiber,
            }),
            { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 }
          );

          return (
            <Card key={meal.id} className="overflow-hidden border-sand-200" noPadding>
              {/* Header da Refeição */}
              <div className="p-4 sm:p-5 bg-sand-50/70 border-b border-sand-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-sage-900 text-white font-mono text-xs font-bold">
                    {mealIdx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-ink-900 font-display">
                        {meal.name}
                      </h3>
                      <span className="text-xs font-mono font-semibold text-sage-800 bg-sand-200/80 px-2 py-0.5 rounded-md">
                        {meal.time}
                      </span>
                    </div>
                    {meal.notes && (
                      <p className="text-xs text-ink-500 mt-0.5">{meal.notes}</p>
                    )}
                  </div>
                </div>

                {/* Resumo compacto de macros da refeição */}
                <div className="flex items-center gap-3 sm:justify-end">
                  <div className="text-right">
                    <span className="text-sm font-bold text-ink-900 font-mono tabular-nums">
                      {Math.round(mealTotals.calories)} kcal
                    </span>
                    <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-ink-600">
                      <span className="text-amber-800 font-medium">
                        C: {Math.round(mealTotals.carbs)}g
                      </span>
                      <span className="text-rose-800 font-medium">
                        P: {Math.round(mealTotals.protein)}g
                      </span>
                      <span className="text-teal-800 font-medium">
                        G: {Math.round(mealTotals.fat)}g
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenAddModal(meal.id)}
                    className="ml-2"
                  >
                    + Alimento
                  </Button>
                </div>
              </div>

              {/* Tabela de Alimentos da Refeição */}
              {meal.items.length === 0 ? (
                <div className="p-8 text-center text-ink-400 text-sm">
                  Nenhum alimento cadastrado nesta refeição.{' '}
                  <button
                    onClick={() => handleOpenAddModal(meal.id)}
                    className="text-sage-800 font-semibold underline ml-1"
                  >
                    Adicionar agora da TACO
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-sand-100">
                  {meal.items.map((item) => {
                    const tacoRef = TACO_DATABASE.find((f) => f.id === item.foodId);

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 sm:p-4 hover:bg-sand-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm"
                      >
                        {/* Nome do alimento & badges */}
                        <div className="md:w-1/3 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ink-900 leading-snug">
                              {item.foodName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-medium text-sage-800 bg-sage-50 px-1.5 py-0.5 rounded border border-sage-200">
                              TACO
                            </span>
                            <span className="text-[11px] text-ink-400 font-mono tabular-nums">
                              {item.totalGrams}g totais
                            </span>
                          </div>
                        </div>

                        {/* Controles de Medida Caseira & Quantidade */}
                        <div className="flex items-center gap-2 md:w-1/3">
                          {/* Quantidade */}
                          <input
                            type="number"
                            min="0.25"
                            step="0.25"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                meal.id,
                                item.id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-16 h-8 text-center text-xs font-mono font-bold border border-sand-300 rounded-lg bg-white text-ink-900 focus:outline-none focus:ring-1 focus:ring-sage-600"
                            title="Multiplicador da porção"
                          />

                          {/* Seletor de Medida Caseira */}
                          <select
                            value={item.measureName}
                            onChange={(e) => {
                              const found = tacoRef?.measures.find(
                                (m) => m.name === e.target.value
                              );
                              if (found) handleChangeMeasure(meal.id, item.id, found);
                            }}
                            className="h-8 text-xs border border-sand-300 rounded-lg px-2 bg-white text-ink-800 focus:outline-none focus:ring-1 focus:ring-sage-600 flex-1 truncate"
                          >
                            {tacoRef?.measures.map((m) => (
                              <option key={m.name} value={m.name}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Macros e Botões de Ação */}
                        <div className="flex items-center justify-between md:justify-end gap-3 md:w-1/3">
                          {/* Números nutricionais */}
                          <div className="text-right font-mono tabular-nums text-xs pr-2">
                            <span className="font-bold text-ink-900 block">
                              {item.calories} kcal
                            </span>
                            <span className="text-[11px] text-ink-500">
                              C:{item.carbs}g • P:{item.protein}g • G:{item.fat}g
                            </span>
                          </div>

                          {/* Botão Chave: Substituição em 1 Clique */}
                          <button
                            type="button"
                            onClick={() => handleOpenSubstitutionModal(meal.id, item)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta-700 bg-terracotta-50 hover:bg-terracotta-100 border border-terracotta-200 px-2.5 py-1.5 rounded-lg transition-colors active:scale-95"
                            title="Calcular substitutos do mesmo grupo alimentar"
                          >
                            <span>🔄</span>
                            <span className="hidden sm:inline">Substituir</span>
                          </button>

                          {/* Excluir alimento */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(meal.id, item.id)}
                            className="text-ink-400 hover:text-red-600 p-1 rounded-md transition-colors"
                            title="Remover alimento"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL DE BUSCA DE ALIMENTOS DA TABELA TACO           */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Adicionar Alimento (Tabela TACO)"
        description="Busque mais de 5.000 itens auditados com medidas caseiras em português"
        size="lg"
      >
        <div className="space-y-4">
          {/* Barra de Busca e Filtro de Categoria */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1">
              <Input
                placeholder="Ex: arroz, frango, aveia, banana..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-xl border border-sand-300 bg-white text-xs font-semibold text-ink-700 focus:outline-none focus:ring-2 focus:ring-sage-600"
            >
              <option value="todos">Todos os grupos</option>
              <option value="cereais">Cereais & Tubérculos</option>
              <option value="leguminosas">Leguminosas</option>
              <option value="carnes_ovos">Carnes & Ovos</option>
              <option value="laticinios">Laticínios</option>
              <option value="frutas">Frutas</option>
              <option value="vegetais">Vegetais & Folhas</option>
              <option value="gorduras">Gorduras & Oleaginosas</option>
              <option value="suplementos">Suplementos</option>
            </select>
          </div>

          {/* Lista de Resultados da TACO */}
          <div className="max-h-80 overflow-y-auto divide-y divide-sand-100 border border-sand-200 rounded-xl bg-white">
            {filteredFoods.length === 0 ? (
              <div className="p-8 text-center text-ink-400 text-sm">
                Nenhum alimento encontrado para &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredFoods.map((food) => {
                const defaultMeasure =
                  food.measures.find((m) => m.isDefault) || food.measures[0];

                return (
                  <div
                    key={food.id}
                    className="p-3.5 hover:bg-sand-50 transition-colors flex items-center justify-between gap-3 text-sm cursor-pointer"
                    onClick={() => handleAddFoodToMeal(food)}
                  >
                    <div>
                      <span className="font-semibold text-ink-900 block">
                        {food.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-ink-500">
                          {food.categoryLabel}
                        </span>
                        <span className="text-[11px] text-sage-800 bg-sage-50 px-1.5 py-0.2 rounded font-medium">
                          Porção padrão: {defaultMeasure.name}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-ink-900 font-mono tabular-nums text-xs">
                        {food.calories100g} kcal / 100g
                      </span>
                      <div className="text-[10px] text-ink-500 font-mono tabular-nums">
                        P: {food.protein100g}g • C: {food.carbs100g}g • G: {food.fat100g}g
                      </div>
                      <span className="text-xs font-semibold text-sage-800 hover:text-sage-950 inline-block mt-1">
                        + Inserir
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 5. MODAL DE SUBSTITUIÇÃO EQUIVALENTE EM 1 CLIQUE        */}
      {/* ======================================================== */}
      <Modal
        isOpen={isSubstitutionModalOpen}
        onClose={() => setIsSubstitutionModalOpen(false)}
        title="Substituições Equivalentes em 1 Clique"
        description="Calculadas automaticamente para preservar o VET e as calorias do mesmo grupo"
        size="lg"
      >
        {substitutingItem && (
          <div className="space-y-5">
            {/* Alimento de Origem Atual */}
            <div className="p-4 rounded-xl bg-sand-100 border border-sand-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                Alimento atual a substituir
              </span>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <h4 className="text-base font-bold text-ink-900">
                    {substitutingItem.item.foodName}
                  </h4>
                  <p className="text-xs text-ink-600">
                    Porção prescrita: <strong>{substitutingItem.item.quantity}x {substitutingItem.item.measureName}</strong> ({substitutingItem.item.totalGrams}g)
                  </p>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <span className="text-lg font-bold text-ink-900">
                    {substitutingItem.item.calories} kcal
                  </span>
                  <div className="text-xs text-ink-500">
                    C:{substitutingItem.item.carbs}g • P:{substitutingItem.item.protein}g • G:{substitutingItem.item.fat}g
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Opções Equivalentes Calculadas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink-700 uppercase tracking-wide">
                  Opções do mesmo grupo ({substitutionsList.length} sugestões calculadas)
                </span>
                <span className="text-xs text-sage-800 font-medium">
                  Isocalóricas • Mesma densidade de grupo
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-sand-100 border border-sand-200 rounded-xl bg-white">
                {substitutionsList.length === 0 ? (
                  <div className="p-6 text-center text-ink-400 text-sm">
                    Nenhum outro alimento no mesmo grupo para comparação.
                  </div>
                ) : (
                  substitutionsList.map((sub) => {
                    const isPerfectMatch = Math.abs(sub.deltaKcal) <= 5;

                    return (
                      <div
                        key={sub.targetFood.id}
                        className="p-3.5 hover:bg-terracotta-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-ink-900">
                            {sub.targetFood.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-sage-900 bg-sage-100 px-2 py-0.5 rounded">
                              {sub.bestMeasureText}
                            </span>
                            <span className="text-[11px] text-ink-500">
                              (equivale a {sub.equivalentGrams}g)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 font-mono tabular-nums">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className="font-bold text-ink-900 text-xs">
                                {sub.calories} kcal
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  isPerfectMatch
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-sand-200 text-ink-700'
                                }`}
                              >
                                {sub.deltaKcal > 0 ? `+${sub.deltaKcal}` : sub.deltaKcal} kcal
                              </span>
                            </div>
                            <div className="text-[10px] text-ink-500">
                              C:{sub.carbs}g • P:{sub.protein}g • G:{sub.fat}g
                            </div>
                          </div>

                          <Button
                            variant="terracotta"
                            size="sm"
                            onClick={() => handleApplySubstitution(sub)}
                          >
                            Substituir 1-Clique
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
