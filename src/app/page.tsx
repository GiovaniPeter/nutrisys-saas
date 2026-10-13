'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { MacroBar } from '@/components/design-system/MacroBar';

export default function LandingPage() {
  // Estado para o simulador interativo de hero
  const [heroSimStep, setHeroSimStep] = useState<'substituicao' | 'medidas' | 'macros'>('substituicao');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 font-sans selection:bg-terracotta-100 selection:text-terracotta-900">
      {/* ======================================================== */}
      {/* 1. TOPBAR & NAVEGAÇÃO                                    */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* 1. TOPBAR & NAVEGAÇÃO (Altura 80px fixa, zero quebras)   */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 h-20 bg-white/85 backdrop-blur-md border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          {/* Logo Exclusivo ClinOSTec 2026 */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 group focus-visible:ring-2 focus-visible:ring-sage-700 rounded-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-sage-900 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:bg-sage-800 transition-colors">
              <svg className="w-6 h-6 text-terracotta-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10M7 12h10" />
                <circle cx="12" cy="12" r="3" fill="#BF4B22" stroke="none" />
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-display font-extrabold text-xl text-ink-900 tracking-tight leading-none whitespace-nowrap">
                ClinOS<span className="text-terracotta-500 font-bold">Tec</span>
              </span>
              <span className="hidden xl:block text-[11px] uppercase font-semibold tracking-wider text-sage-900 mt-1 whitespace-nowrap">
                Nutrição Clínica de Precisão
              </span>
            </div>
          </Link>

          {/* Links Centrais (Rótulos objetivos, sem metáforas, whitespace-nowrap) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-ink-800">
            <a
              href="/editor-cardapio"
              className="whitespace-nowrap hover:text-sage-900 transition-colors py-2 focus-visible:ring-2 focus-visible:ring-sage-700 rounded-lg"
            >
              Recursos
            </a>
            <a
              href="#como-funciona"
              className="whitespace-nowrap hover:text-sage-900 transition-colors py-2 focus-visible:ring-2 focus-visible:ring-sage-700 rounded-lg"
            >
              Como funciona
            </a>
            <a
              href="#comparativo"
              className="whitespace-nowrap hover:text-sage-900 transition-colors py-2 focus-visible:ring-2 focus-visible:ring-sage-700 rounded-lg"
            >
              Comparativo
            </a>
            <a
              href="#planos"
              className="whitespace-nowrap hover:text-sage-900 transition-colors py-2 focus-visible:ring-2 focus-visible:ring-sage-700 rounded-lg"
            >
              Planos
            </a>
            <a
              href="#faq"
              className="whitespace-nowrap hover:text-sage-900 transition-colors py-2 focus-visible:ring-2 focus-visible:ring-sage-700 rounded-lg"
            >
              Dúvidas
            </a>
          </nav>

          {/* Ações (Entrar + Testar 7 dias grátis em linha única com min-height 44px) */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center text-sm font-semibold text-ink-800 hover:text-ink-950 px-3.5 py-2.5 rounded-xl transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sage-700 min-h-[44px]"
            >
              Entrar
            </Link>
            <Link href="/editor-cardapio" className="focus-visible:ring-2 focus-visible:ring-sage-700 rounded-xl">
              <button
                type="button"
                className="inline-flex items-center justify-center font-semibold select-none transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta-400 bg-terracotta-500 text-white hover:bg-terracotta-600 shadow-sm hover:shadow h-11 px-5 text-sm rounded-xl whitespace-nowrap min-h-[44px]"
              >
                Testar 7 dias grátis
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION — HIERARQUIA BALANCEADA E ACIMA DA DOBRA */}
      {/* ======================================================== */}
      <section className="pt-6 sm:pt-8 lg:pt-10 pb-12 sm:pb-16 lg:pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-white via-sand-50 to-sand-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
            
            {/* Coluna da Esquerda: Mensagem, Autoridade e CTAs */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-4 sm:space-y-5 text-left">
              {/* Selo (pill) de autoridade clínica com contraste AA / AAA */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sage-200 shadow-subtle text-xs font-semibold text-sage-950">
                <span className="w-2 h-2 rounded-full bg-terracotta-500 shrink-0" />
                <span>Projetado para o consultório brasileiro</span>
                <span className="text-sand-300">•</span>
                <span className="text-sage-800 font-medium">Tabela TACO + CFN + Lei 8.234/91</span>
              </div>

              {/* Título com clamp, line-height 1.08, max-width ~20ch, máx 3 linhas e 2 cores */}
              <h1
                className="font-display font-extrabold tracking-tight text-ink-900 leading-[1.08]"
                style={{ fontSize: 'clamp(2.35rem, 3.8vw, 3.85rem)', maxWidth: '20ch' }}
              >
                Sua consulta é sobre ciência e pessoas.{' '}
                <span className="text-sage-900 block mt-1">
                  Não sobre somar calorias no Excel.
                </span>
              </h1>

              {/* Subtítulo (até 2 linhas, 18px, contraste >8:1) */}
              <p className="text-base sm:text-lg lg:text-[18px] text-ink-700 leading-snug max-w-xl">
                Prescreva cardápios em minutos com a Tabela TACO em medidas caseiras,
                substituições em 1 clique e autoridade clínica que seu consultório merece.
              </p>

              {/* Botões de Ação com min-height 44px para toque acessível */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link href="/editor-cardapio" className="focus-visible:ring-2 focus-visible:ring-sage-700 rounded-xl">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center font-semibold select-none transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta-400 bg-terracotta-500 text-white hover:bg-terracotta-600 shadow-sm hover:shadow h-12 px-6 text-sm sm:text-base rounded-xl whitespace-nowrap min-h-[48px] w-full sm:w-auto"
                  >
                    Abrir o Editor de Cardápio →
                  </button>
                </Link>
                <a href="#planos" className="focus-visible:ring-2 focus-visible:ring-sage-700 rounded-xl">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center font-semibold select-none transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sand-400 bg-sand-100 text-ink-900 border border-sand-200 hover:bg-sand-200/80 hover:border-sand-300 h-12 px-5 text-sm sm:text-base rounded-xl whitespace-nowrap min-h-[48px] w-full sm:w-auto"
                  >
                    Ver Planos (A partir de R$ 39,50)
                  </button>
                </a>
              </div>

              {/* Microtexto com contraste AA e alinhamento elegante */}
              <p className="text-xs font-medium text-ink-600 pt-0.5">
                Sem cartão de crédito · 7 dias grátis · Cancele quando quiser
              </p>
            </div>

            {/* Coluna da Direita: Workstation Interativa Compacta (100% visível sem rolar) */}
            <div className="lg:col-span-6 xl:col-span-6">
              <div className="bg-white rounded-2xl border border-sand-200 shadow-card p-4 sm:p-5">
                {/* Seletor Compacto do Simulador */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-sand-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sage-900 bg-sage-100 px-2 py-0.5 rounded">
                      Motor Clínico Ao Vivo
                    </span>
                    <span className="text-xs text-ink-500 hidden xl:inline">
                      Interaja com o motor:
                    </span>
                  </div>

                  <div className="flex items-center gap-1 p-0.5 bg-sand-100 rounded-xl border border-sand-200">
                    <button
                      type="button"
                      onClick={() => setHeroSimStep('substituicao')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        heroSimStep === 'substituicao'
                          ? 'bg-white text-ink-900 shadow-sm'
                          : 'text-ink-600 hover:text-ink-900'
                      }`}
                    >
                      🔄 1-Clique Troca
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroSimStep('medidas')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        heroSimStep === 'medidas'
                          ? 'bg-white text-ink-900 shadow-sm'
                          : 'text-ink-600 hover:text-ink-900'
                      }`}
                    >
                      🥣 Medidas pt-BR
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroSimStep('macros')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        heroSimStep === 'macros'
                          ? 'bg-white text-ink-900 shadow-sm'
                          : 'text-ink-600 hover:text-ink-900'
                      }`}
                    >
                      📊 Macros & VET
                    </button>
                  </div>
                </div>

                {/* Área de Demonstração Reativa Compacta */}
                <div className="pt-3.5">
                  {heroSimStep === 'substituicao' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between gap-3 text-left">
                        <div>
                          <span className="text-[10px] font-semibold text-ink-500 uppercase">Almoço • Prescrição Atual</span>
                          <h4 className="text-sm font-bold text-ink-900">
                            Arroz integral cozido (100g)
                          </h4>
                          <span className="text-xs text-ink-600">2 colheres de servir • 124 kcal</span>
                        </div>
                        <span className="text-[11px] font-bold text-terracotta-700 bg-terracotta-100 px-2 py-0.5 rounded-full shrink-0">
                          Equivalência Automática
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-xl border border-sand-200 bg-white hover:border-terracotta-400 transition-all text-left">
                          <span className="text-xs font-bold text-ink-900 block truncate">Batata-doce cozida</span>
                          <span className="text-[11px] font-semibold text-sage-900 bg-sage-100 px-1.5 py-0.2 rounded inline-block mt-0.5">
                            2 fatias (160g)
                          </span>
                          <div className="mt-1.5 text-[11px] font-mono text-ink-500 flex justify-between">
                            <span>123 kcal</span>
                            <strong className="text-emerald-700">Δ -1 kcal</strong>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl border border-sand-200 bg-white hover:border-terracotta-400 transition-all text-left">
                          <span className="text-xs font-bold text-ink-900 block truncate">Mandioca cozida</span>
                          <span className="text-[11px] font-semibold text-sage-900 bg-sage-100 px-1.5 py-0.2 rounded inline-block mt-0.5">
                            1 pedaço (99g)
                          </span>
                          <div className="mt-1.5 text-[11px] font-mono text-ink-500 flex justify-between">
                            <span>124 kcal</span>
                            <strong className="text-emerald-700">Δ 0 kcal</strong>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl border border-sand-200 bg-white hover:border-terracotta-400 transition-all text-left">
                          <span className="text-xs font-bold text-ink-900 block truncate">Cuscuz de milho</span>
                          <span className="text-[11px] font-semibold text-sage-900 bg-sage-100 px-1.5 py-0.2 rounded inline-block mt-0.5">
                            1 fatia (110g)
                          </span>
                          <div className="mt-1.5 text-[11px] font-mono text-ink-500 flex justify-between">
                            <span>123 kcal</span>
                            <strong className="text-emerald-700">Δ -1 kcal</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {heroSimStep === 'medidas' && (
                    <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200 text-left space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-ink-900">
                          Medidas da cozinha brasileira convertidas em gramas
                        </h4>
                        <span className="text-[10px] text-sage-900 font-semibold bg-sage-100 px-2 py-0.2 rounded">
                          TACO Oficial
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-white rounded-lg border border-sand-200">
                          <strong>Feijão carioca</strong>
                          <p className="text-[11px] text-ink-500 mt-0.5">1 concha média = 140g</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-sand-200">
                          <strong>Peito de frango</strong>
                          <p className="text-[11px] text-ink-500 mt-0.5">1 filé médio = 100g</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-sand-200">
                          <strong>Azeite extravirgem</strong>
                          <p className="text-[11px] text-ink-500 mt-0.5">1 colher sobremesa = 5g</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-sand-200">
                          <strong>Aveia em flocos</strong>
                          <p className="text-[11px] text-ink-500 mt-0.5">1 colher sopa = 15g</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {heroSimStep === 'macros' && (
                    <div className="space-y-2">
                      <MacroBar
                        current={{
                          calories: 2080,
                          carbs: 234,
                          protein: 142,
                          fat: 64,
                          fiber: 31,
                        }}
                        target={{
                          calories: 2100,
                          bodyWeightKg: 64,
                        }}
                        variant="compact"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* ======================================================== */}
      {/* 3. OS 3 PILARES DO CLINOSTEC (Sem clichês de folhas/frutas) */}
      {/* ======================================================== */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 bg-white border-y border-sand-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sage-800 bg-sage-100 px-3 py-1 rounded-full">
              Pensado para o Dia a Dia da Nutri
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 font-display">
              Três decisões de design que mudam sua rotina clínica
            </h2>
            <p className="text-base text-ink-600">
              Menos cliques, zero distração e cálculos que você pode confiar de olhos fechados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pilar 1 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-sand-50/70 border border-sand-200 space-y-4 hover:border-sage-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sage-900 text-white flex items-center justify-center text-xl font-bold font-mono">
                01
              </div>
              <h3 className="text-xl font-bold text-ink-900 font-display">
                Velocidade Real em Consulta
              </h3>
              <p className="text-sm text-ink-600 leading-relaxed">
                Você não precisa mais fazer contas de cabeça com o paciente esperando na sua frente.
                A Tabela TACO busca sem acento e sugere substituições calculadas do mesmo grupo com delta calórico zero.
              </p>
              <div className="pt-2 text-xs font-semibold text-sage-900 flex items-center gap-1">
                <span>✓ Cardápio completo montado em 8 minutos</span>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-sand-50/70 border border-sand-200 space-y-4 hover:border-terracotta-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-terracotta-500 text-white flex items-center justify-center text-xl font-bold font-mono">
                02
              </div>
              <h3 className="text-xl font-bold text-ink-900 font-display">
                Ciência Antropométrica & VET
              </h3>
              <p className="text-sm text-ink-600 leading-relaxed">
                6 fórmulas de taxa metabólica (Cunningham, Tinsley, Katch-McArdle, Mifflin, Harris-Benedict e Schofield)
                com METs de atividade e protocolos Pollock 3/7 dobras e Guedes integrados ao plano.
              </p>
              <div className="pt-2 text-xs font-semibold text-terracotta-700 flex items-center gap-1">
                <span>✓ Prescrição fundamentada para atletas e clínicos</span>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-sand-50/70 border border-sand-200 space-y-4 hover:border-sage-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sage-800 text-white flex items-center justify-center text-xl font-bold font-mono">
                03
              </div>
              <h3 className="text-xl font-bold text-ink-900 font-display">
                Autoridade & Adesão do Paciente
              </h3>
              <p className="text-sm text-ink-600 leading-relaxed">
                Seu paciente instala um app PWA leve no celular em 1 toque (sem precisar baixar 80MB na Google Play)
                e você gera PDFs A4 impecáveis com registro CRN obrigatório pela Lei 8.234/91.
              </p>
              <div className="pt-2 text-xs font-semibold text-sage-900 flex items-center gap-1">
                <span>✓ Diário com fotos, meta de água e chat integrado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. COMPARATIVO REAL E TRANSPARENTE                      */}
      {/* ======================================================== */}
      <section id="comparativo" className="py-20 px-4 sm:px-6 bg-sand-50">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500 bg-sand-200 px-3 py-1 rounded-full">
              Comparativo Honesto
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 font-display">
              Por que nutris estão saindo de planilhas e softwares pesados?
            </h2>
            <p className="text-base text-ink-600 max-w-xl mx-auto">
              Veja a diferença prática entre insistir no Excel, pagar R$ 120+ no Dietbox ou usar o ClinOSTec.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna 1: Planilhas Excel */}
            <div className="p-6 rounded-2xl bg-white border border-sand-200 space-y-4">
              <div className="border-b border-sand-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-400">Opção 1</span>
                <h4 className="text-lg font-bold text-ink-800">Planilhas do Excel</h4>
                <span className="text-xs text-ink-500">&quot;De graça&quot;, mas rouba seu tempo</span>
              </div>
              <ul className="space-y-2.5 text-xs text-ink-600">
                <li className="flex items-start gap-2 text-red-700">
                  <span>✕</span> <span>Fórmulas quebram quando você altera linhas</span>
                </li>
                <li className="flex items-start gap-2 text-red-700">
                  <span>✕</span> <span>Horrível de ler na tela do celular do paciente</span>
                </li>
                <li className="flex items-start gap-2 text-red-700">
                  <span>✕</span> <span>Zero cálculo automático de substituições</span>
                </li>
                <li className="flex items-start gap-2 text-red-700">
                  <span>✕</span> <span>Não transmite autoridade ou profissionalismo</span>
                </li>
              </ul>
            </div>

            {/* Coluna 2: Softwares Tradicionais (Dietbox e afins) */}
            <div className="p-6 rounded-2xl bg-white border border-sand-200 space-y-4">
              <div className="border-b border-sand-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-400">Opção 2</span>
                <h4 className="text-lg font-bold text-ink-800">Softwares Antigos</h4>
                <span className="text-xs text-ink-500">Dietbox e concorrentes tradicionais</span>
              </div>
              <ul className="space-y-2.5 text-xs text-ink-600">
                <li className="flex items-start gap-2 text-amber-700">
                  <span>!</span> <span>Planos caros: R$ 99 a R$ 160 todos os meses</span>
                </li>
                <li className="flex items-start gap-2 text-amber-700">
                  <span>!</span> <span>Centenas de botões e abas que você nunca usa</span>
                </li>
                <li className="flex items-start gap-2 text-amber-700">
                  <span>!</span> <span>Lentos para editar cardápios durante a consulta</span>
                </li>
                <li className="flex items-start gap-2 text-amber-700">
                  <span>!</span> <span>App de paciente pesado com avaliações baixas</span>
                </li>
              </ul>
            </div>

            {/* Coluna 3: ClinOSTec 2026 (Destaque) */}
            <div className="p-6 rounded-2xl bg-sage-900 text-white border-2 border-terracotta-500 shadow-float space-y-4 relative">
              <span className="absolute -top-3 right-6 bg-terracotta-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow">
                Moderno & Rápido
              </span>
              <div className="border-b border-sage-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-terracotta-300">Nova Geração 2026</span>
                <h4 className="text-lg font-bold text-white font-display">ClinOSTec</h4>
                <span className="text-xs text-sage-200">A partir de R$ 39,50/mês</span>
              </div>
              <ul className="space-y-2.5 text-xs text-sage-100">
                <li className="flex items-start gap-2 text-emerald-300">
                  <span>✓</span> <span>Substituições equivalentes do mesmo grupo em 1 clique</span>
                </li>
                <li className="flex items-start gap-2 text-emerald-300">
                  <span>✓</span> <span>Tabela TACO completa com medidas caseiras em pt-BR</span>
                </li>
                <li className="flex items-start gap-2 text-emerald-300">
                  <span>✓</span> <span>Portal do paciente PWA (leve, abre direto no navegador)</span>
                </li>
                <li className="flex items-start gap-2 text-emerald-300">
                  <span>✓</span> <span>PDF A4 de prescrição médica com carimbo legal CRN</span>
                </li>
                <li className="flex items-start gap-2 text-emerald-300">
                  <span>✓</span> <span>Preço justo e sem travas em recursos essenciais</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. TABELA DE PLANOS & PREÇOS                            */}
      {/* ======================================================== */}
      <section id="planos" className="py-20 px-4 sm:px-6 bg-white border-t border-sand-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-700 bg-terracotta-100 px-3 py-1 rounded-full">
              Sem Pegadinhas
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 font-display">
              Planos transparentes que cabem no seu consultório
            </h2>
            <p className="text-base text-ink-600 max-w-xl mx-auto">
              Teste grátis por 7 dias. Sem fidelidade, sem taxa de adesão e sem surpresas na fatura.
            </p>

            {/* Toggle Mensal / Anual */}
            <div className="inline-flex items-center gap-3 p-1.5 bg-sand-100 rounded-2xl border border-sand-200 mt-4">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-sage-900 text-white shadow-sm'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                <span>Anual</span>
                <span className="bg-terracotta-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                  Economize 20%
                </span>
              </button>
            </div>
          </div>

          {/* Cards dos 3 Planos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* PLANO 1: Essencial R$ 39,50 */}
            <div className="p-7 rounded-3xl bg-white border border-sand-200 shadow-subtle flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-sage-800 bg-sage-50 px-2.5 py-1 rounded-md border border-sage-200">
                  Para Início de Carreira
                </span>
                <h3 className="text-2xl font-bold text-ink-900 font-display">
                  Plano Essencial
                </h3>
                <p className="text-xs text-ink-600">
                  Perfeito para quem atende até 25 pacientes ativos e quer agilidade na prescrição.
                </p>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-ink-600">R$</span>
                    <span className="text-4xl font-extrabold text-ink-900 font-display font-mono">
                      {billingCycle === 'yearly' ? '31,60' : '39,50'}
                    </span>
                    <span className="text-xs text-ink-500">/mês</span>
                  </div>
                  <span className="text-[11px] text-ink-400 block mt-0.5">
                    {billingCycle === 'yearly' ? 'Cobrado anualmente (R$ 379,20)' : 'Cobrança mensal recorrente'}
                  </span>
                </div>

                <div className="border-t border-sand-100 pt-4 space-y-2.5 text-xs text-ink-700">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Até <strong>25 pacientes ativos</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Cardápios e receitas ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Tabela TACO completa com medidas caseiras</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Prescrição PDF A4 com carimbo legal CRN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Suporte prioritário via WhatsApp</span>
                  </div>
                </div>
              </div>

              <Link href="/register?plan=essencial">
                <Button variant="outline" size="md" fullWidth>
                  Começar Teste Grátis (7 Dias)
                </Button>
              </Link>
            </div>

            {/* PLANO 2: Pro R$ 74,50 (Destaque Mais Popular) */}
            <div className="p-7 rounded-3xl bg-white border-2 border-sage-900 shadow-float flex flex-col justify-between space-y-6 relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-sage-900 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow">
                Mais Escolhido pelas Nutris
              </span>

              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-terracotta-700 bg-terracotta-50 px-2.5 py-1 rounded-md border border-terracotta-200">
                  Consultório Ativo
                </span>
                <h3 className="text-2xl font-bold text-ink-900 font-display">
                  Plano Pro
                </h3>
                <p className="text-xs text-ink-600">
                  Para nutricionistas com agenda cheia que querem o app do paciente e antropometria completa.
                </p>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-ink-600">R$</span>
                    <span className="text-4xl font-extrabold text-ink-900 font-display font-mono">
                      {billingCycle === 'yearly' ? '59,60' : '74,50'}
                    </span>
                    <span className="text-xs text-ink-500">/mês</span>
                  </div>
                  <span className="text-[11px] text-ink-400 block mt-0.5">
                    {billingCycle === 'yearly' ? 'Cobrado anualmente (R$ 715,20)' : 'Cobrança mensal recorrente'}
                  </span>
                </div>

                <div className="border-t border-sand-100 pt-4 space-y-2.5 text-xs text-ink-700">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Até <strong>80 pacientes ativos</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Portal do Paciente (PWA)</strong> no celular</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Diário com fotos de refeições & meta de água</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Motor de Substituições em 1 Clique</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Antropometria Pollock 3/7, Guedes & 6 fórmulas VET</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Chat direto e orientações pós-consulta</span>
                  </div>
                </div>
              </div>

              <Link href="/register?plan=pro">
                <Button variant="terracotta" size="md" fullWidth>
                  Começar 7 Dias no Pro Grátis →
                </Button>
              </Link>
            </div>

            {/* PLANO 3: Clínica Total R$ 124,50 */}
            <div className="p-7 rounded-3xl bg-white border border-sand-200 shadow-subtle flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-sage-800 bg-sage-50 px-2.5 py-1 rounded-md border border-sage-200">
                  Clínica & Alta Performance
                </span>
                <h3 className="text-2xl font-bold text-ink-900 font-display">
                  Clínica Total
                </h3>
                <p className="text-xs text-ink-600">
                  Pacientes ilimitados, link público de agendamento e controle financeiro completo.
                </p>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-ink-600">R$</span>
                    <span className="text-4xl font-extrabold text-ink-900 font-display font-mono">
                      {billingCycle === 'yearly' ? '99,60' : '124,50'}
                    </span>
                    <span className="text-xs text-ink-500">/mês</span>
                  </div>
                  <span className="text-[11px] text-ink-400 block mt-0.5">
                    {billingCycle === 'yearly' ? 'Cobrado anualmente (R$ 1.195,20)' : 'Cobrança mensal recorrente'}
                  </span>
                </div>

                <div className="border-t border-sand-100 pt-4 space-y-2.5 text-xs text-ink-700">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Pacientes ilimitados</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Todos os recursos do Plano Pro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Link público de agendamento online</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Módulo financeiro (recibos, cobranças, fluxo)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Prescrição com identidade visual personalizada</span>
                  </div>
                </div>
              </div>

              <Link href="/register?plan=clinica">
                <Button variant="outline" size="md" fullWidth>
                  Testar Clínica Total Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. FAQ CIRÚRGICO                                        */}
      {/* ======================================================== */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-sand-50">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500 bg-sand-200 px-3 py-1 rounded-full">
              Tira-Dúvidas
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 font-display">
              Perguntas frequentes das nutricionistas
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Como funciona o teste grátis de 7 dias?',
                a: 'Você se cadastra apenas com nome, e-mail e CRN. Não pedimos cartão de crédito. Durante 7 dias você tem acesso total a todos os recursos para testar em consultas reais.',
              },
              {
                q: 'O paciente precisa pagar para usar o Portal do Paciente?',
                a: 'Não! O portal é 100% gratuito para os seus pacientes. Eles não precisam nem baixar app pesado da Play Store: basta abrir o link seguro enviado por você no WhatsApp e adicionar à tela inicial do celular como um PWA leve.',
              },
              {
                q: 'A prescrição em PDF é aceita pelo Conselho Federal de Nutricionistas (CFN)?',
                a: 'Sim. Todas as prescrições geradas no ClinOSTec contêm cabeçalho com identificação profissional, número de inscrição no Conselho Regional de Nutricionistas (CRN), carimbo digital e cumprem rigorosamente a Lei Federal nº 8.234/91 e a LGPD.',
              },
              {
                q: 'Consigo importar pacientes que já atendo em planilhas?',
                a: 'Sim, você pode importar listas de pacientes via planilha Excel ou CSV em poucos cliques, sem perder o histórico do seu consultório.',
              },
              {
                q: 'Como funciona a substituição em 1 clique?',
                a: 'O ClinOSTec cruza os grupos de alimentos da Tabela TACO. Ao clicar em substituir, ele calcula matematicamente a gramagem exata do novo alimento para igualar as calorias e o grupo alimentar, mantendo o VET planejado intacto.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-sand-200 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-ink-900 hover:text-sage-900 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <span className="text-lg text-ink-400 font-mono">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-ink-600 leading-relaxed border-t border-sand-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. CTA FINAL                                            */}
      {/* ======================================================== */}
      <section className="py-20 px-4 sm:px-6 bg-sage-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta-300 bg-sage-800 px-3.5 py-1.5 rounded-full inline-block">
            Sem Burocracia • Sem Cartão de Crédito
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight">
            Seu consultório merece a elegância e a velocidade de 2026.
          </h2>
          <p className="text-base sm:text-lg text-sage-100 max-w-xl mx-auto leading-relaxed">
            Junte-se às nutricionistas que recuperaram o tempo de consulta e impressionam seus pacientes desde o primeiro plano alimentar.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/editor-cardapio" className="w-full sm:w-auto">
              <Button variant="terracotta" size="lg" fullWidth>
                Experimentar o Editor Agora →
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="border-sage-700 text-white hover:bg-sage-800" fullWidth>
                Criar Minha Conta Grátis
              </Button>
            </Link>
          </div>

          <p className="text-xs text-sage-300 pt-2">
            Planos a partir de R$ 39,50/mês após os 7 dias • Suporte em português por nutricionistas
          </p>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. FOOTER INSTITUCIONAL                                 */}
      {/* ======================================================== */}
      <footer className="bg-sand-100 border-t border-sand-200 py-12 px-4 sm:px-6 text-xs text-ink-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="font-display font-bold text-base text-ink-900">
              ClinOS<span className="text-terracotta-500">Tec</span>
            </div>
            <p className="text-xs text-ink-500">
              Sistema de Gestão Clínica e Prescrição Nutricional de Alta Performance.
            </p>
            <p className="text-[11px] text-ink-400">
              Desenvolvido em conformidade com a Lei Federal nº 8.234/91, resoluções do CFN e LGPD.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-ink-600">
            <Link href="/editor-cardapio" className="hover:text-ink-900">Editor de Cardápio</Link>
            <Link href="/termos-de-uso" className="hover:text-ink-900">Termos de Uso</Link>
            <Link href="/politica-de-privacidade" className="hover:text-ink-900">Privacidade & LGPD</Link>
            <a href="mailto:contato@clinos.tec.br" className="hover:text-ink-900">contato@clinos.tec.br</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
