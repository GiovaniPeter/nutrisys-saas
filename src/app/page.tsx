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
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Logo Exclusivo ClinOSTec 2026 */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-sage-900 text-white flex items-center justify-center font-display font-bold text-lg shadow-sm group-hover:bg-sage-800 transition-colors">
              <svg className="w-6 h-6 text-terracotta-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10M7 12h10" />
                <circle cx="12" cy="12" r="3" fill="#D96B43" stroke="none" />
              </svg>
            </div>
            <div>
              <span className="font-display font-bold text-xl text-ink-900 tracking-tight block leading-none">
                ClinOS<span className="text-terracotta-500 font-normal">Tec</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-sage-800">
                Nutrição Clínica de Precisão
              </span>
            </div>
          </Link>

          {/* Links Centrais */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-ink-700">
            <a href="#proposta" className="hover:text-sage-900 transition-colors">
              A Nova Consulta
            </a>
            <a href="#demonstracao" className="hover:text-sage-900 transition-colors">
              Motor Clínico
            </a>
            <a href="#comparativo" className="hover:text-sage-900 transition-colors">
              Comparativo Real
            </a>
            <a href="#planos" className="hover:text-sage-900 transition-colors">
              Planos & Preços
            </a>
            <a href="#faq" className="hover:text-sage-900 transition-colors">
              Dúvidas
            </a>
          </nav>

          {/* Ações */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-ink-700 hover:text-ink-900 px-3.5 py-2 rounded-xl transition-colors"
            >
              Entrar
            </Link>
            <Link href="/editor-cardapio">
              <Button variant="terracotta" size="md">
                Testar Grátis (7 Dias)
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION — NARRATIVA EDITORIAL & SIMULADOR VIVO   */}
      {/* ======================================================== */}
      <section className="pt-12 pb-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-white via-sand-50 to-sand-50">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Tag de autoridade clínica */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-50 border border-sage-200 text-xs font-semibold text-sage-900">
            <span className="w-2 h-2 rounded-full bg-terracotta-500" />
            <span>Projetado para o ritmo real do consultório brasileiro</span>
            <span className="text-sand-300">•</span>
            <span className="text-sage-700 font-normal">Tabela TACO + CFN + Lei 8.234/91</span>
          </div>

          {/* Headline com voz autoral */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-ink-900 font-display tracking-tight leading-[1.12]">
            Você estudou 5 anos de bioquímica para ouvir seus pacientes.
            <span className="block mt-2 text-sage-900">
              Não para somar calorias no Excel.
            </span>
          </h1>

          {/* Parágrafo de posicionamento */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-ink-600 leading-relaxed">
            O <strong>ClinOSTec</strong> elimina o pesadelo das planilhas feias e dos softwares caros e travados.
            Calcule cardápios em minutos com a Tabela TACO em medidas caseiras, substituições em 1 clique
            e entregue uma prescrição elegante que gera autoridade no primeiro olhar.
          </p>

          {/* Botões de Ação Imediata */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link href="/editor-cardapio" className="w-full sm:w-auto">
              <Button variant="terracotta" size="lg" fullWidth>
                Abrir o Editor de Cardápio Agora (Sem Cadastro) →
              </Button>
            </Link>
            <Link href="#planos" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth>
                Ver Planos (A partir de R$ 39,50/mês)
              </Button>
            </Link>
          </div>

          <p className="text-xs text-ink-500">
            ✓ 7 dias de teste completo grátis • Sem pedir cartão de crédito • Cancele quando quiser
          </p>
        </div>

        {/* WORKSTATION INTERATIVA NO HERO (Simulador vivo sem template padrão) */}
        <div className="max-w-5xl mx-auto mt-12 bg-white rounded-3xl border border-sand-200 shadow-float p-5 sm:p-7">
          {/* Seletor de Micro-Demonstração */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-sand-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sage-900 bg-sage-100 px-2.5 py-1 rounded-md">
                Simulação Viva do Motor ClinOSTec
              </span>
              <span className="text-xs text-ink-400 hidden sm:inline">
                Clique para ver a interface em ação:
              </span>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-sand-100 rounded-xl border border-sand-200">
              <button
                type="button"
                onClick={() => setHeroSimStep('substituicao')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  heroSimStep === 'substituicao'
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                🔄 Troca em 1 Clique
              </button>
              <button
                type="button"
                onClick={() => setHeroSimStep('medidas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  heroSimStep === 'medidas'
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                🥣 Medidas Caseiras
              </button>
              <button
                type="button"
                onClick={() => setHeroSimStep('macros')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  heroSimStep === 'macros'
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                📊 VET & Macros
              </button>
            </div>
          </div>

          {/* Painel Reativo baseado no seletor */}
          <div className="pt-6">
            {heroSimStep === 'substituicao' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-xs font-semibold text-ink-500 uppercase">Almoço • Prescrição Original</span>
                    <h4 className="text-base font-bold text-ink-900 mt-0.5">
                      Arroz integral cozido — 2 colheres de servir (100g)
                    </h4>
                    <p className="text-xs text-ink-600">
                      124 kcal • C: 25,8g • P: 2,6g • G: 1,0g • TACO #18
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-terracotta-700 bg-terracotta-100 px-3 py-1 rounded-full">
                      1 Clique ➔ Sugestão Isocalórica
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-sand-200 bg-white hover:border-terracotta-400 transition-all text-left">
                    <span className="text-xs font-bold text-ink-900 block">Batata-doce cozida</span>
                    <span className="text-xs font-semibold text-sage-900 bg-sage-100 px-2 py-0.5 rounded inline-block mt-1">
                      2 fatias médias (160g)
                    </span>
                    <div className="mt-2 text-xs font-mono text-ink-500 flex justify-between">
                      <span>123 kcal</span>
                      <strong className="text-emerald-700">Δ -1 kcal (Exato)</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-sand-200 bg-white hover:border-terracotta-400 transition-all text-left">
                    <span className="text-xs font-bold text-ink-900 block">Mandioca cozida</span>
                    <span className="text-xs font-semibold text-sage-900 bg-sage-100 px-2 py-0.5 rounded inline-block mt-1">
                      1 pedaço médio (99g)
                    </span>
                    <div className="mt-2 text-xs font-mono text-ink-500 flex justify-between">
                      <span>124 kcal</span>
                      <strong className="text-emerald-700">Δ 0 kcal (Perfeito)</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-sand-200 bg-white hover:border-terracotta-400 transition-all text-left">
                    <span className="text-xs font-bold text-ink-900 block">Cuscuz de milho</span>
                    <span className="text-xs font-semibold text-sage-900 bg-sage-100 px-2 py-0.5 rounded inline-block mt-1">
                      1 fatia média (110g)
                    </span>
                    <div className="mt-2 text-xs font-mono text-ink-500 flex justify-between">
                      <span>123 kcal</span>
                      <strong className="text-emerald-700">Δ -1 kcal (Exato)</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {heroSimStep === 'medidas' && (
              <div className="p-5 rounded-2xl bg-sand-50 border border-sand-200 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-ink-900">
                    Linguagem que a paciente entende na cozinha, não enigma de laboratório
                  </h4>
                  <span className="text-xs text-sage-800 font-semibold bg-sage-100 px-2.5 py-0.5 rounded">
                    Gramas Automáticos
                  </span>
                </div>
                <p className="text-xs text-ink-600">
                  Chega de receber WhatsApp da paciente às 19h perguntando se 130g de feijão é uma concha cheia ou rasa.
                  No ClinOSTec, cada alimento já tem as porções da mesa brasileira com densidade em gramas calculada:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-sand-200">
                    <strong>Feijão carioca</strong>
                    <p className="text-ink-500 mt-0.5">1 concha média = 140g</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-sand-200">
                    <strong>Peito de frango</strong>
                    <p className="text-ink-500 mt-0.5">1 filé médio = 100g</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-sand-200">
                    <strong>Azeite extravirgem</strong>
                    <p className="text-ink-500 mt-0.5">1 colher sobremesa = 5g</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-sand-200">
                    <strong>Aveia em flocos</strong>
                    <p className="text-ink-500 mt-0.5">1 colher sopa = 15g</p>
                  </div>
                </div>
              </div>
            )}

            {heroSimStep === 'macros' && (
              <div className="space-y-3">
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
                  variant="detailed"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. OS 3 PILARES DO CLINOSTEC (Sem clichês de folhas/frutas) */}
      {/* ======================================================== */}
      <section id="proposta" className="py-20 px-4 sm:px-6 bg-white border-y border-sand-200">
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
