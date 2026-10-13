import React from 'react';

export interface MacroValues {
  calories: number;
  carbs: number;   // grams
  protein: number; // grams
  fat: number;     // grams
  fiber?: number;  // grams
}

export interface MacroTargets {
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  fiber?: number;
  bodyWeightKg?: number; // for g/kg calculation
}

export interface MacroBarProps {
  current: MacroValues;
  target?: MacroTargets;
  variant?: 'compact' | 'detailed' | 'minimal';
  showPercentages?: boolean;
  className?: string;
}

export const MacroBar = ({
  current,
  target,
  variant = 'detailed',
  showPercentages = true,
  className = '',
}: MacroBarProps) => {
  // Caloric calculations: Carbs: 4 kcal/g, Protein: 4 kcal/g, Fat: 9 kcal/g
  const choKcal = current.carbs * 4;
  const ptnKcal = current.protein * 4;
  const lipKcal = current.fat * 9;
  const calculatedVET = choKcal + ptnKcal + lipKcal;
  const totalKcal = current.calories > 0 ? current.calories : calculatedVET;

  // Percentage of energy distribution (AMDR - Acceptable Macronutrient Distribution Ranges)
  const choPct = calculatedVET > 0 ? Math.round((choKcal / calculatedVET) * 100) : 0;
  const ptnPct = calculatedVET > 0 ? Math.round((ptnKcal / calculatedVET) * 100) : 0;
  const lipPct = calculatedVET > 0 ? Math.max(0, 100 - choPct - ptnPct) : 0;

  // g/kg calculations
  const weight = target?.bodyWeightKg;
  const ptnPerKg = weight && weight > 0 ? (current.protein / weight).toFixed(1) : null;
  const choPerKg = weight && weight > 0 ? (current.carbs / weight).toFixed(1) : null;

  // Comparison with target calories
  const targetKcal = target?.calories;
  const kcalDelta = targetKcal ? Math.round(totalKcal - targetKcal) : null;
  const kcalProgressPct = targetKcal ? Math.min(100, Math.round((totalKcal / targetKcal) * 100)) : null;

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-3 text-xs ${className}`}>
        <span className="font-semibold text-ink-900 font-mono tabular-nums">
          {Math.round(totalKcal)} kcal
        </span>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5 text-amber-800 font-mono tabular-nums">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            {Math.round(current.carbs)}g
          </span>
          <span className="inline-flex items-center gap-0.5 text-rose-800 font-mono tabular-nums">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            {Math.round(current.protein)}g
          </span>
          <span className="inline-flex items-center gap-0.5 text-teal-800 font-mono tabular-nums">
            <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
            {Math.round(current.fat)}g
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-ink-900 font-mono tabular-nums">
            {Math.round(totalKcal)} kcal
          </span>
          <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-ink-600">
            <span className="text-amber-800 font-medium">C: {Math.round(current.carbs)}g ({choPct}%)</span>
            <span className="text-rose-800 font-medium">P: {Math.round(current.protein)}g ({ptnPct}%)</span>
            <span className="text-teal-800 font-medium">G: {Math.round(current.fat)}g ({lipPct}%)</span>
          </div>
        </div>

        {/* Proportional Segmented Bar */}
        <div className="h-2 w-full rounded-full bg-sand-200 overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${choPct}%` }}
            className="bg-amber-500 transition-all duration-300"
            title={`Carboidratos: ${choPct}%`}
          />
          <div
            style={{ width: `${ptnPct}%` }}
            className="bg-rose-500 transition-all duration-300"
            title={`Proteínas: ${ptnPct}%`}
          />
          <div
            style={{ width: `${lipPct}%` }}
            className="bg-teal-500 transition-all duration-300"
            title={`Lipídios: ${lipPct}%`}
          />
        </div>
      </div>
    );
  }

  // Detailed Variant (Global Prescription / Header)
  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white border border-sand-200/90 shadow-subtle ${className}`}>
      {/* Top Header: Total VET vs Meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-sand-100">
        <div>
          <span className="text-[11px] font-semibold text-ink-500 tracking-wider uppercase">
            Valor Energético Total (VET)
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-bold text-ink-900 font-display font-mono tabular-nums">
              {Math.round(totalKcal).toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-ink-500 font-medium">kcal / dia</span>

            {targetKcal && (
              <span className="text-xs font-mono tabular-nums text-ink-500 ml-1">
                de meta de <strong className="text-ink-700">{targetKcal} kcal</strong>
              </span>
            )}
          </div>
        </div>

        {targetKcal && kcalDelta !== null && (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full font-mono tabular-nums ${
                Math.abs(kcalDelta) <= 50
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : kcalDelta > 50
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {kcalDelta > 0 ? `+${kcalDelta}` : kcalDelta} kcal {kcalDelta === 0 ? 'exato' : ''}
            </span>
            {weight && (
              <span className="text-xs text-ink-500 bg-sand-100 px-2.5 py-1 rounded-full font-mono">
                {weight} kg
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Segmented Bar */}
      <div className="mt-3.5">
        <div className="h-3 w-full rounded-full bg-sand-200 overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${choPct}%` }}
            className="bg-amber-500 transition-all duration-300 hover:brightness-105"
            title={`Carboidratos: ${current.carbs}g (${choPct}%)`}
          />
          <div
            style={{ width: `${ptnPct}%` }}
            className="bg-rose-500 transition-all duration-300 hover:brightness-105"
            title={`Proteínas: ${current.protein}g (${ptnPct}%)`}
          />
          <div
            style={{ width: `${lipPct}%` }}
            className="bg-teal-500 transition-all duration-300 hover:brightness-105"
            title={`Lipídios: ${current.fat}g (${lipPct}%)`}
          />
        </div>
      </div>

      {/* Grid of Macro Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4">
        {/* Carboidratos */}
        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Carboidratos
            </span>
            {showPercentages && (
              <span className="text-xs font-bold text-amber-800 font-mono tabular-nums">
                {choPct}%
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-bold text-amber-950 font-mono tabular-nums">
              {Math.round(current.carbs)}g
            </span>
            {choPerKg && (
              <span className="text-[11px] text-amber-700 font-mono tabular-nums">
                {choPerKg} g/kg
              </span>
            )}
          </div>
        </div>

        {/* Proteínas */}
        <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Proteínas
            </span>
            {showPercentages && (
              <span className="text-xs font-bold text-rose-800 font-mono tabular-nums">
                {ptnPct}%
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-bold text-rose-950 font-mono tabular-nums">
              {Math.round(current.protein)}g
            </span>
            {ptnPerKg && (
              <span className="text-[11px] text-rose-700 font-mono tabular-nums">
                {ptnPerKg} g/kg
              </span>
            )}
          </div>
        </div>

        {/* Lipídios */}
        <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              Gorduras
            </span>
            {showPercentages && (
              <span className="text-xs font-bold text-teal-800 font-mono tabular-nums">
                {lipPct}%
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-bold text-teal-950 font-mono tabular-nums">
              {Math.round(current.fat)}g
            </span>
            <span className="text-[11px] text-teal-700 font-mono tabular-nums">
              {Math.round(lipKcal)} kcal
            </span>
          </div>
        </div>

        {/* Fibras */}
        <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Fibras
            </span>
            <span className="text-[11px] text-purple-700 font-mono">
              meta 25g+
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-bold text-purple-950 font-mono tabular-nums">
              {Math.round(current.fiber || 0)}g
            </span>
            <span className="text-[11px] text-purple-700 font-mono tabular-nums">
              {(current.fiber || 0) >= 25 ? '✓ Ideal' : 'Atenção'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
