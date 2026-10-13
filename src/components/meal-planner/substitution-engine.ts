import { TACO_DATABASE, TacoFood, HouseholdMeasure } from './taco-data';

export interface CalculatedSubstitution {
  targetFood: TacoFood;
  equivalentGrams: number;
  bestMeasureText: string;
  bestMeasure: HouseholdMeasure;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  deltaKcal: number; // diferenca calórica em relacao ao alimento original
}

/**
 * Motor de Cálculo de Substituições Equivalentes Clínicas
 * Baseado em grupos da pirâmide alimentar brasileira e isocaloria
 */
export function calculateEquivalentSubstitutions(
  sourceFoodId: string,
  sourceGrams: number
): CalculatedSubstitution[] {
  const sourceFood = TACO_DATABASE.find((f) => f.id === sourceFoodId);
  if (!sourceFood || sourceGrams <= 0) return [];

  // Calorias originais do item
  const sourceCalories = (sourceGrams / 100) * sourceFood.calories100g;

  // Filtrar alimentos do mesmo grupo, excluindo o próprio
  const candidates = TACO_DATABASE.filter(
    (f) => f.category === sourceFood.category && f.id !== sourceFood.id
  );

  const results: CalculatedSubstitution[] = [];

  for (const candidate of candidates) {
    if (candidate.calories100g <= 0) continue;

    // Gramas exatos necessários no substituto para igualar as calorias
    const rawGrams = (sourceCalories / candidate.calories100g) * 100;
    const equivalentGrams = Math.max(5, Math.round(rawGrams));

    // Achar a medida caseira mais próxima e intuitiva
    let bestMeasure = candidate.measures[0];
    let bestMeasureText = `${equivalentGrams}g`;

    // Tentar encontrar medida que se aproxime
    const nonGramMeasures = candidate.measures.filter((m) => m.name !== 'gramas exatos');
    if (nonGramMeasures.length > 0) {
      // Procura a medida cujo peso unitário se aproxima ou permite proporção simples
      let bestDiff = Infinity;
      for (const m of nonGramMeasures) {
        const ratio = equivalentGrams / m.grams;
        const roundedRatio = Math.round(ratio * 2) / 2; // arredonda para 0.5, 1, 1.5, 2, etc.
        const diff = Math.abs(roundedRatio * m.grams - equivalentGrams);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestMeasure = m;
          if (roundedRatio === 1) {
            bestMeasureText = `1 ${m.name.split(' (')[0]} (${equivalentGrams}g)`;
          } else if (roundedRatio === 0.5) {
            bestMeasureText = `1/2 ${m.name.split(' (')[0]} (${equivalentGrams}g)`;
          } else {
            bestMeasureText = `${roundedRatio}x ${m.name.split(' (')[0]} (${equivalentGrams}g)`;
          }
        }
      }
    }

    const calculatedCalories = Math.round((equivalentGrams / 100) * candidate.calories100g);
    const calculatedProtein = Number(((equivalentGrams / 100) * candidate.protein100g).toFixed(1));
    const calculatedCarbs = Number(((equivalentGrams / 100) * candidate.carbs100g).toFixed(1));
    const calculatedFat = Number(((equivalentGrams / 100) * candidate.fat100g).toFixed(1));
    const calculatedFiber = Number(((equivalentGrams / 100) * candidate.fiber100g).toFixed(1));

    const deltaKcal = calculatedCalories - Math.round(sourceCalories);

    results.push({
      targetFood: candidate,
      equivalentGrams,
      bestMeasureText,
      bestMeasure,
      calories: calculatedCalories,
      protein: calculatedProtein,
      carbs: calculatedCarbs,
      fat: calculatedFat,
      fiber: calculatedFiber,
      deltaKcal,
    });
  }

  // Ordenar por menor delta calórico (mais próximo do 0 absoluto)
  return results.sort((a, b) => Math.abs(a.deltaKcal) - Math.abs(b.deltaKcal));
}
