import Link from 'next/link';
import { MealPlannerEditor } from '@/components/meal-planner/MealPlannerEditor';

export const metadata = {
  title: 'Editor de Cardápio TACO com 1-Clique Substituições | ClinOSTec',
  description:
    'Monte planos alimentares com Tabela TACO (+5.000 alimentos), medidas caseiras brasileiras e substituições equivalentes em tempo real.',
};

export default function EditorCardapioPage() {
  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 font-sans selection:bg-terracotta-100 selection:text-terracotta-900">
      {/* Top Header do Sistema ClinOSTec 2026 */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-sage-900 text-white flex items-center justify-center font-display font-bold text-base shadow-sm group-hover:bg-sage-800 transition-colors">
                C
              </div>
              <div>
                <span className="font-display font-bold text-lg text-ink-900 tracking-tight block leading-none">
                  ClinOS<span className="text-terracotta-500 font-normal">Tec</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-sage-800">
                  Prontuário & Cardápio
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1 pl-4 border-l border-sand-200 text-xs text-ink-500">
              <Link href="/" className="hover:text-ink-900 transition-colors">Início</Link>
              <span>/</span>
              <span className="text-ink-500">Pacientes</span>
              <span>/</span>
              <span className="text-ink-500">Camila Siqueira</span>
              <span>/</span>
              <span className="font-semibold text-sage-900 bg-sage-50 px-2 py-0.5 rounded border border-sage-200">
                Cardápio Ativo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-ink-600 bg-sand-100 px-3 py-1.5 rounded-xl border border-sand-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Autossalvamento ativo</span>
            </div>

            <Link
              href="/"
              className="text-xs font-semibold text-ink-600 hover:text-ink-900 px-3 py-1.5 rounded-lg border border-sand-200 hover:bg-sand-100 transition-colors"
            >
              ← Voltar à Apresentação
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <MealPlannerEditor />
      </main>
    </div>
  );
}
