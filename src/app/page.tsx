'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MacroBar } from '@/components/design-system/MacroBar';
import { CompanyIdentity } from '@/components/marketing/company-identity';
import { PublicPricing } from '@/components/marketing/public-pricing';
import { ConnectedCare } from '@/components/marketing/connected-care';

const FAQ_ITEMS = [
  {
    q: 'Como funciona o teste grátis de 7 dias?',
    a: 'Você se cadastra apenas com nome, e-mail e nome do seu consultório ou clínica. Não pedimos cartão de crédito. Durante 7 dias você tem acesso total a todos os recursos para testar em atendimentos reais ou estudos de caso.',
  },
  {
    q: 'Sou estudante de Nutrição. Posso usar para treinar e nos estágios?',
    a: 'Com certeza! O ClinOSTec foi desenhado com medidas caseiras em português e cálculos automáticos para você ganhar confiança clínica desde o primeiro semestre de estágio. O plano Essencial (R$ 39,50/mês) foi pensado para caber no orçamento estudantil.',
  },
  {
    q: 'O paciente precisa pagar para usar o Portal do Paciente?',
    a: 'Não! O portal é 100% gratuito para os seus pacientes. Eles acessam com um link leve e seguro no navegador do celular, salvam o app como PWA na tela inicial e podem consultar o plano, registrar refeições com foto e acompanhar a hidratação.',
  },
  {
    q: 'Como funciona a substituição em 1 clique?',
    a: 'O ClinOSTec cruza os grupos de alimentos da Tabela TACO. Ao clicar em substituir, ele calcula matematicamente a gramagem exata do novo alimento para igualar as calorias e manter o equilíbrio nutricional planejado intacto com delta calórico mínimo.',
  },
  {
    q: 'Quais equações de gasto energético e taxa metabólica estão disponíveis?',
    a: 'O sistema calcula e compara simultaneamente 6 equações de Taxa Metabólica Basal (TMB/GEB): Mifflin-St Jeor (1990), Harris-Benedict (1919), Schofield (1985), Cunningham (1980), Katch-McArdle e Tinsley (2018), integrando gasto de atividade física e METs esportivos para o cálculo do VET.',
  },
  {
    q: 'Os PDFs gerados cumprem as exigências do CFN e da Lei 8.234/91?',
    a: 'Sim. Os PDFs são gerados em padrão A4 de alta definição, com cabeçalho contendo seu logotipo, dados do consultório, dados do paciente e seu carimbo de assinatura com número de registro no CRN, em conformidade com a Lei Federal nº 8.234/91 e o Código de Ética do Nutricionista (Resoluções CFN nº 599/2018 e nº 731/2022).',
  },
  {
    q: 'Existe contrato de fidelidade ou multa de cancelamento?',
    a: 'Nenhum! Nossos planos são mensais recorrentes. Você pode cancelar sua assinatura a qualquer momento com um único clique no painel, sem qualquer tipo de multa ou burocracia.',
  },
];

export default function LandingPage() {
  // Estado para o simulador interativo de hero
  const [heroSimStep, setHeroSimStep] = useState<'substituicao' | 'medidas' | 'macros'>('substituicao');
  // Estado para alternância de perfil (Nutri Estabelecida x Estudante/Recém-formada)
  const [activePersona, setActivePersona] = useState<'recem-formada' | 'estabelecida'>('recem-formada');

  // Dados estruturados JSON-LD Schema.org
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://clinos.tec.br/#organization',
        name: 'ClinOSTec',
        legalName: 'Egert Sistemas e Consultoria em Alimentos LTDA',
        taxID: '69.642.291/0001-18',
        url: 'https://clinos.tec.br',
        logo: 'https://clinos.tec.br/social-card.png',
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'contato@clinos.tec.br',
          contactType: 'customer service',
          availableLanguage: ['Portuguese'],
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://clinos.tec.br/#software',
        name: 'ClinOSTec',
        applicationCategory: 'HealthApplication, BusinessApplication',
        operatingSystem: 'Web, iOS, Android (PWA)',
        url: 'https://clinos.tec.br',
        description:
          'Software de gestão clínica e prescrição nutricional com Tabela TACO (+1.000 alimentos), medidas caseiras, substituição em 1 clique, antropometria Pollock/Guedes, 6 equações de TMB e Portal do Paciente PWA.',
        publisher: {
          '@id': 'https://clinos.tec.br/#organization',
        },
        offers: [
          {
            '@type': 'Offer',
            name: 'Plano Essencial',
            price: '39.50',
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2027-12-31',
          },
          {
            '@type': 'Offer',
            name: 'Plano Profissional',
            price: '74.50',
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2027-12-31',
          },
          {
            '@type': 'Offer',
            name: 'Plano Clínica',
            price: '124.50',
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2027-12-31',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://clinos.tec.br/#faq',
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 font-sans selection:bg-terracotta-100 selection:text-terracotta-900">
      {/* Dados Estruturados Schema.org para o Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ======================================================== */}
      {/* 1. TOPBAR & NAVEGAÇÃO (80px fixa, blur translúcido, sem quebras) */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 h-20 bg-white/85 backdrop-blur-md border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          {/* Logo Exclusivo ClinOSTec */}
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
                Nutrição Clínica & Tecnologia
              </span>
            </div>
          </Link>

          {/* Links Centrais (Rótulos objetivos, whitespace-nowrap) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-ink-800">
            <Link
              href="/recursos"
              className="whitespace-nowrap hover:text-sage-900 transition-colors py-2 focus-visible:ring-2 focus-visible:ring-sage-700 rounded-lg"
            >
              Recursos
            </Link>
            <a
              href="#como-funciona"
              className="whitespace-nowrap hover:text-sage-900 transition-colors py-2 focus-visible:ring-2 focus-visible:ring-sage-700 rounded-lg"
            >
              Como funciona
            </a>
            <a
              href="#para-quem"
              className="whitespace-nowrap hover:text-sage-900 transition-colors py-2 focus-visible:ring-2 focus-visible:ring-sage-700 rounded-lg"
            >
              Para você
            </a>
            <a
              href="#comparativo"
              className="whitespace-nowrap hover:text-sage-900 transition-colors py-2 focus-visible:ring-2 focus-visible:ring-sage-700 rounded-lg"
            >
              Acompanhamento
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

          {/* Ações (Entrar + Testar 7 dias grátis estilizados como Link direto, sem button aninhado) */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center text-sm font-semibold text-ink-800 hover:text-ink-950 px-3.5 py-2.5 rounded-xl transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sage-700 min-h-[44px]"
            >
              Entrar
            </Link>
            <Link
              href="/register?perfil=nutricionista&plan=professional&source=home-header"
              className="inline-flex items-center justify-center font-semibold select-none transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta-400 bg-terracotta-500 text-white hover:bg-terracotta-600 shadow-sm hover:shadow h-11 px-5 text-sm rounded-xl whitespace-nowrap min-h-[44px]"
            >
              Testar 7 dias grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION — PROFUNDA, MODERNA & ACIMA DA DOBRA    */}
      {/* ======================================================== */}
      <section className="pt-6 sm:pt-8 lg:pt-10 pb-12 sm:pb-16 lg:pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-white via-sand-50 to-sand-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
            
            {/* Coluna da Esquerda: Mensagem Visceral, Autoridade e CTAs */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-4 sm:space-y-5 text-left">
              {/* Selo (pill) de autoridade clínica com contraste AA / AAA */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sage-200 shadow-subtle text-xs font-semibold text-sage-950">
                <span className="w-2 h-2 rounded-full bg-terracotta-500 shrink-0" />
                <span>O Novo Padrão Clínico</span>
                <span className="text-sand-300">•</span>
                <span className="text-sage-800 font-medium">Da 1ª consulta à clínica cheia</span>
              </div>

              {/* Título de Alto Impacto Psicológico (clamp, 2 cores, max 3 linhas) */}
              <h1
                className="font-display font-extrabold tracking-tight text-ink-900 leading-[1.08]"
                style={{ fontSize: 'clamp(2.35rem, 3.8vw, 3.85rem)', maxWidth: '20ch' }}
              >
                Você se formou para transformar vidas.{' '}
                <span className="text-sage-900 block mt-1">
                  Não para perder noites no Excel.
                </span>
              </h1>

              {/* Subtítulo Conectado com a Dor Real */}
              <p className="text-base sm:text-lg lg:text-[18px] text-ink-700 leading-snug max-w-xl">
                Prescreva o cardápio ao vivo enquanto acolhe seu paciente. Medidas caseiras em português, 
                substituições automáticas em 1 clique e entrega instantânea no app — para você nunca mais levar trabalho para casa.
              </p>

              {/* Botões de Ação com min-height 48px — estilizados como Links diretos (HTML válido) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  href="/register?perfil=nutricionista&plan=professional&source=home-hero"
                  className="inline-flex items-center justify-center font-semibold select-none transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta-400 bg-terracotta-500 text-white hover:bg-terracotta-600 shadow-sm hover:shadow h-12 px-6 text-sm sm:text-base rounded-xl whitespace-nowrap min-h-[48px] w-full sm:w-auto text-center"
                >
                  Testar 7 dias grátis →
                </Link>
                <Link
                  href="/editor-cardapio"
                  className="inline-flex items-center justify-center font-semibold select-none transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sand-400 bg-sand-100 text-ink-900 border border-sand-200 hover:bg-sand-200/80 hover:border-sand-300 h-12 px-5 text-sm sm:text-base rounded-xl whitespace-nowrap min-h-[48px] w-full sm:w-auto text-center"
                >
                  Ver Demonstração do Editor
                </Link>
              </div>

              {/* Microtexto com contraste AA */}
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
                      Motor Clínico Ativo
                    </span>
                    <span className="text-xs text-ink-500 hidden xl:inline">
                      Simule ao vivo:
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

                {/* Área de Demonstração Reativa Compacta (Hierarquia correta h2 -> h3) */}
                <h2 className="sr-only">Demonstração Interativa do Editor de Cardápio</h2>
                <div className="pt-3.5">
                  {heroSimStep === 'substituicao' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between gap-3 text-left">
                        <div>
                          <span className="text-[10px] font-semibold text-ink-500 uppercase">Almoço • Prescrição Atual</span>
                          <h3 className="text-sm font-bold text-ink-900">
                            Arroz integral cozido (100g)
                          </h3>
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
                        <h3 className="text-xs font-bold text-ink-900">
                          Medidas da cozinha brasileira convertidas em gramas
                        </h3>
                        <span className="text-[10px] text-sage-900 font-semibold bg-sage-100 px-2 py-0.2 rounded">
                          Tabela TACO Oficial
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
      {/* 3. O CICLO QUE ROUBA SEU CONSULTÓRIO vs. O PADRÃO CLINOSTEC */}
      {/* ======================================================== */}
      <section className="py-20 px-4 sm:px-6 bg-white border-y border-sand-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-3.5 py-1 rounded-full">
              O Confronto Clínico
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 font-display tracking-tight">
              A razão pela qual tantos pacientes desistem e tantas nutris se esgotam
            </h2>
            <p className="text-base sm:text-lg text-ink-600">
              O modelo antigo cria uma barreira invisível entre a consulta e a prática real do paciente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* O Ciclo Vicioso Tradicional */}
            <div className="p-8 rounded-3xl bg-sand-50/80 border border-sand-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold mb-4">
                  <span>❌ O Modelo Desgastante Antigo</span>
                </div>
                <h3 className="text-2xl font-bold font-display text-ink-900">
                  &ldquo;Te envio o plano em até 48 horas&rdquo;
                </h3>
                <p className="text-sm text-ink-600 mt-2">
                  O paciente sai motivado da sua sala, mas a motivação tem prazo de validade curto.
                </p>

                <div className="space-y-4 mt-6">
                  <div className="flex items-start gap-3 text-sm text-ink-700">
                    <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                    <p>
                      <strong>A centelha esfria:</strong> Quando o PDF chega na quarta-feira pelo WhatsApp, o paciente já esqueceu as orientações que você deu na consulta.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-ink-700">
                    <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                    <p>
                      <strong>Seu domingo sequestrado:</strong> Horas extras na frente do computador somando gramas, calculando VET na mão e convertendo medidas caseiras.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-ink-700">
                    <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                    <p>
                      <strong>Abandono na 2ª semana:</strong> O paciente não achou o alimento exato no mercado, não sabia como substituir e abandonou o tratamento.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-ink-700">
                    <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                    <p>
                      <strong>Softwares lentos e caros:</strong> Cheios de funções que você não usa, cobrando mensalidades pesadas de R$ 150 a R$ 250 e travando na frente do paciente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-sand-200 text-xs text-ink-600 italic">
                Resultado: Nutricionistas em sobrecarga e pacientes com baixa adesão ao tratamento.
              </div>
            </div>

            {/* O Padrão ClinOSTec */}
            <div className="p-8 rounded-3xl bg-sage-950 text-white border border-sage-800 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sage-800/20 rounded-full blur-3xl pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-4">
                  <span>✨ O Padrão ClinOSTec</span>
                </div>
                <h3 className="text-2xl font-bold font-display text-white">
                  A Consulta de Entrega Imediata
                </h3>
                <p className="text-sm text-sage-200 mt-2">
                  O plano alimentar nasce com o paciente na sala e ele já sai sabendo o que vai jantar hoje.
                </p>

                <div className="space-y-4 mt-6">
                  <div className="flex items-start gap-3 text-sm text-sage-100">
                    <span className="text-terracotta-400 font-bold shrink-0 mt-0.5">✓</span>
                    <p>
                      <strong>Prescrição ao vivo em minutos:</strong> O paciente acompanha as opções na tela, participa da escolha e entende os porquês de cada grupo.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-sage-100">
                    <span className="text-terracotta-400 font-bold shrink-0 mt-0.5">✓</span>
                    <p>
                      <strong>Fim da consulta = Fim do expediente:</strong> Terminou o atendimento, o prontuário está fechado e o plano está no app. Seus fins de semana são sagrados.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-sage-100">
                    <span className="text-terracotta-400 font-bold shrink-0 mt-0.5">✓</span>
                    <p>
                      <strong>Substituições equivalentes em 1 clique:</strong> Se não tiver arroz integral em casa, o app do paciente sugere batata ou mandioca com calorias equivalentes.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-sage-100">
                    <span className="text-terracotta-400 font-bold shrink-0 mt-0.5">✓</span>
                    <p>
                      <strong>Preço justo e acessível:</strong> Planos a partir de R$ 39,50/mês para você ter o melhor da tecnologia sem comprometer seu orçamento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sage-900 border border-sage-800 text-xs text-sage-200">
                Resultado: Paciente engajado desde o primeiro minuto, maior adesão ao tratamento e mais segurança para você.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. PARA QUEM É: O ESTUDANTE E A PROFISSIONAL             */}
      {/* ======================================================== */}
      <section id="para-quem" className="py-20 px-4 sm:px-6 bg-sand-50 scroll-mt-24">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sage-900 bg-sage-100 px-3.5 py-1 rounded-full">
              Feito para Sua Realidade
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 font-display tracking-tight">
              Projetado para dois momentos decisivos da sua carreira
            </h2>
            <p className="text-base text-ink-600">
              Seja na segurança da sua primeira consulta ou na produtividade de um consultório lotado.
            </p>

            {/* Alternador de Persona */}
            <div className="pt-4 flex items-center justify-center">
              <div className="inline-flex p-1 bg-white rounded-2xl border border-sand-300 shadow-sm">
                <button
                  type="button"
                  onClick={() => setActivePersona('recem-formada')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activePersona === 'recem-formada'
                      ? 'bg-sage-900 text-white shadow-sm'
                      : 'text-ink-600 hover:text-ink-950'
                  }`}
                >
                  🎓 Para Estudantes & Recém-Formadas
                </button>
                <button
                  type="button"
                  onClick={() => setActivePersona('estabelecida')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activePersona === 'estabelecida'
                      ? 'bg-sage-900 text-white shadow-sm'
                      : 'text-ink-600 hover:text-ink-950'
                  }`}
                >
                  💼 Para Nutricionistas em Atuação
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo Dinâmico por Persona */}
          {activePersona === 'recem-formada' ? (
            <div className="bg-white rounded-3xl border border-sand-200 p-8 sm:p-12 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-50 text-terracotta-700 text-xs font-bold border border-terracotta-200">
                  <span>Elimine a Insegurança Clínica</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-ink-900 leading-tight">
                  A autoridade clínica de quem atende com precisão, desde o seu primeiro paciente
                </h3>
                <p className="text-base text-ink-600 leading-relaxed">
                  A faculdade te ensinou bioquímica profunda, patologias e ciclo de Krebs, mas não ensinou como conduzir 
                  uma consulta prática sem travar na hora de calcular. O ClinOSTec te dá a fundamentação clínica estruturada:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-sand-50 border border-sand-200">
                    <h4 className="font-bold text-sm text-ink-900">Zero decoreba de gramas</h4>
                    <p className="text-xs text-ink-600 mt-1">
                      Medidas caseiras automáticas da TACO: saiba exatamente quantas colheres de aveia ou conchas de feijão equivalem à meta calórica.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-sand-50 border border-sand-200">
                    <h4 className="font-bold text-sm text-ink-900">6 fórmulas de TMB e VET</h4>
                    <p className="text-xs text-ink-600 mt-1">
                      Mifflin-St Jeor, Harris-Benedict, Schofield, Cunningham, Katch-McArdle e Tinsley calculadas na hora com fator atividade e METs esportivos.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-sand-50 border border-sand-200">
                    <h4 className="font-bold text-sm text-ink-900">PDF com Carimbo e CRN</h4>
                    <p className="text-xs text-ink-600 mt-1">
                      Layout profissional em conformidade com a Lei Federal nº 8.234/91 e o Código de Ética do CFN.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-sand-50 border border-sand-200">
                    <h4 className="font-bold text-sm text-ink-900">Cabe no seu bolso</h4>
                    <p className="text-xs text-ink-600 mt-1">
                      Plano Essencial por apenas R$ 39,50/mês. Menos do que o valor de meia consulta, sem anuidade e sem fidelidade.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/register?perfil=nutricionista&plan=essential&source=persona-student"
                    className="inline-flex items-center justify-center font-semibold select-none transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta-400 bg-terracotta-500 text-white hover:bg-terracotta-600 shadow-sm hover:shadow h-12 px-6 text-sm sm:text-base rounded-xl whitespace-nowrap min-h-[48px]"
                  >
                    Começar com o Plano Essencial (R$ 39,50) →
                  </Link>
                </div>
              </div>

              {/* Cenário Prático Objetivo (Sem depoimento fictício) */}
              <div className="lg:col-span-5 bg-sand-100 rounded-2xl p-6 border border-sand-200 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-sage-900">
                  Cenário Clínico: Estágio e Primeiro Atendimento
                </span>
                <p className="text-sm text-ink-700 leading-relaxed">
                  Em vez de perder minutos preciosos tentando lembrar a gramagem de uma concha ou calculando equações de cabeça na frente do paciente, a interface estruturada guia o atendimento do início ao fim: da anamnese ao laudo com carimbo e CRN.
                </p>
                <div className="p-3.5 bg-white rounded-xl border border-sand-200 text-xs text-ink-700 space-y-2">
                  <span className="font-bold text-ink-900 block">Segurança clínica garantida:</span>
                  <ul className="space-y-1.5 text-ink-600">
                    <li>✓ Conversão automática de gramas para colheres, fatias e conchas</li>
                    <li>✓ 6 fórmulas comparadas lado a lado para TMB e VET</li>
                    <li>✓ Prescrição dietética pronta para impressão em PDF durante a consulta</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-sand-200 p-8 sm:p-12 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-sage-900 text-xs font-bold border border-sage-200">
                  <span>Alta Performance Clínica</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-ink-900 leading-tight">
                  Recupere 15 horas semanais e aumente a adesão dos seus retornos
                </h3>
                <p className="text-base text-ink-600 leading-relaxed">
                  Você já tem experiência, mas continua trabalhando até tarde ou passando o fim de semana digitando dietas em softwares lentos. 
                  Com o ClinOSTec, você atende com leveza, reduz o custo fixo do consultório e entrega uma experiência premium ao paciente:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-sand-50 border border-sand-200">
                    <h4 className="font-bold text-sm text-ink-900">Cardápio em 8 minutos</h4>
                    <p className="text-xs text-ink-600 mt-1">
                      Motor com +1.000 alimentos da Tabela TACO, busca sem acento instantânea e cópia inteligente de refeições.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-sand-50 border border-sand-200">
                    <h4 className="font-bold text-sm text-ink-900">Portal do Paciente PWA</h4>
                    <p className="text-xs text-ink-600 mt-1">
                      Seu paciente acessa no celular sem baixar nada pesado: fotos das refeições, registro de água e chat com você.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-sand-50 border border-sand-200">
                    <h4 className="font-bold text-sm text-ink-900">Antropometria Completa</h4>
                    <p className="text-xs text-ink-600 mt-1">
                      Protocolos Pollock 3 e 7 dobras, Guedes, % de gordura e gráficos comparativos de evolução corporal.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-sand-50 border border-sand-200">
                    <h4 className="font-bold text-sm text-ink-900">Economia Inteligente</h4>
                    <p className="text-xs text-ink-600 mt-1">
                      Por R$ 74,50/mês você tem pacientes ilimitados, sem as taxas abusivas dos softwares legados.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/register?perfil=nutricionista&plan=professional&source=persona-pro"
                    className="inline-flex items-center justify-center font-semibold select-none transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta-400 bg-terracotta-500 text-white hover:bg-terracotta-600 shadow-sm hover:shadow h-12 px-6 text-sm sm:text-base rounded-xl whitespace-nowrap min-h-[48px]"
                  >
                    Testar o Plano Profissional por 7 Dias →
                  </Link>
                </div>
              </div>

              {/* Cenário Prático Objetivo (Sem depoimento fictício) */}
              <div className="lg:col-span-5 bg-sand-100 rounded-2xl p-6 border border-sand-200 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-sage-900">
                  Cenário Clínico: Consultório com Alto Volume de Retornos
                </span>
                <p className="text-sm text-ink-700 leading-relaxed">
                  Quando o paciente participa da construção do plano na tela e sai da consulta já com o cardápio e o Portal PWA no celular, as dúvidas diárias de substituição caem drasticamente, liberando as noites e fins de semana da nutricionista.
                </p>
                <div className="p-3.5 bg-white rounded-xl border border-sand-200 text-xs text-ink-700 space-y-2">
                  <span className="font-bold text-ink-900 block">Eficiência de atendimento:</span>
                  <ul className="space-y-1.5 text-ink-600">
                    <li>✓ Fim do retrabalho de montar dietas fora do expediente</li>
                    <li>✓ Menos mensagens de dúvidas pelo WhatsApp com substituições em 1 clique</li>
                    <li>✓ Acompanhamento do diário com fotos e meta de hidratação pelo PWA</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. OS 3 PILARES DO CLINOSTEC                             */}
      {/* ======================================================== */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 bg-white border-y border-sand-200 scroll-mt-24">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sage-800 bg-sage-100 px-3 py-1 rounded-full">
              Pensado para o Dia a Dia da Nutri
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 font-display">
              Três decisões de design que transformam sua rotina
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
                A Tabela TACO busca sem acento e sugere substituições calculadas do mesmo grupo com delta calórico mínimo.
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
                Ciência Antropométrica, TMB & VET
              </h3>
              <p className="text-sm text-ink-600 leading-relaxed">
                6 equações de Taxa Metabólica Basal (Mifflin-St Jeor, Harris-Benedict, Schofield, Cunningham, Katch-McArdle e Tinsley) com fator de atividade, gasto adicional por METs esportivos e protocolos Pollock 3/7 dobras e Guedes integrados.
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
                Seu paciente instala um app PWA leve no celular em 1 toque (sem precisar baixar 80MB na loja de apps)
                e você gera PDFs A4 com carimbo e identificação de CRN em conformidade com a Lei Federal nº 8.234/91 e o Código de Ética do CFN.
              </p>
              <div className="pt-2 text-xs font-semibold text-sage-900 flex items-center gap-1">
                <span>✓ Diário com fotos, meta de água e chat integrado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. ATENDIMENTO CONECTADO & COMPARATIVO                   */}
      {/* ======================================================== */}
      <ConnectedCare />

      {/* ======================================================== */}
      {/* 7. PLANOS & PREÇOS (PublicPricing)                      */}
      {/* ======================================================== */}
      <PublicPricing />

      {/* ======================================================== */}
      {/* 8. FAQ TIRA-DÚVIDAS (Renderizado nativamente com details/summary para indexação 100% no HTML pelo Google) */}
      {/* ======================================================== */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-sand-50 scroll-mt-24">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500 bg-sand-200 px-3 py-1 rounded-full">
              Tira-Dúvidas
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 font-display">
              Perguntas frequentes das nutricionistas e estudantes
            </h2>
            <p className="text-sm text-ink-600">
              Tudo o que você precisa saber para começar a usar com total tranquilidade.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-2xl border border-sand-200 overflow-hidden transition-all [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-ink-900 hover:text-sage-900 transition-colors cursor-pointer select-none">
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <span className="text-lg text-ink-400 font-mono transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-xs sm:text-sm text-ink-600 leading-relaxed border-t border-sand-100 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. CTA FINAL DE ALTA CONVERSÃO                           */}
      {/* ======================================================== */}
      <section className="py-20 px-4 sm:px-6 bg-sage-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta-300 bg-sage-800 px-3.5 py-1.5 rounded-full inline-block">
            Sem Burocracia • Sem Cartão de Crédito
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight">
            A próxima consulta que você fizer pode ser a última em que você leva trabalho para casa.
          </h2>
          <p className="text-base sm:text-lg text-sage-100 max-w-xl mx-auto leading-relaxed">
            Junte-se às nutricionistas e estudantes que recuperaram a paz dos fins de semana e entregam cardápios com autoridade máxima desde o primeiro minuto.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register?perfil=nutricionista&plan=professional&source=home-footer"
              className="inline-flex items-center justify-center font-semibold select-none transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta-400 bg-terracotta-500 text-white hover:bg-terracotta-600 shadow-sm hover:shadow h-12 px-6 text-sm sm:text-base rounded-xl whitespace-nowrap min-h-[48px] w-full sm:w-auto text-center"
            >
              Testar 7 Dias Grátis Agora →
            </Link>
            <Link
              href="/editor-cardapio"
              className="inline-flex items-center justify-center font-semibold select-none transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sage-700 border border-sage-700 text-white hover:bg-sage-800 shadow-sm hover:shadow h-12 px-6 text-sm sm:text-base rounded-xl whitespace-nowrap min-h-[48px] w-full sm:w-auto text-center"
            >
              Ver Demonstração do Editor
            </Link>
          </div>

          <p className="text-xs text-sage-300 pt-2">
            Planos a partir de R$ 39,50/mês • Teste 7 dias grátis sem cartão
          </p>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. FOOTER INSTITUCIONAL                                */}
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
              Ferramenta de apoio ao atendimento. A avaliação e a prescrição cabem ao profissional responsável.
            </p>
            <CompanyIdentity />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-ink-600">
            <Link href="/editor-cardapio" className="hover:text-ink-900">Editor de Cardápio</Link>
            <Link href="/recursos" className="hover:text-ink-900">Recursos</Link>
            <Link href="/termos-de-uso" className="hover:text-ink-900">Termos de Uso</Link>
            <Link href="/politica-de-privacidade" className="hover:text-ink-900">Privacidade & LGPD</Link>
            <a href="mailto:contato@clinos.tec.br" className="hover:text-ink-900">contato@clinos.tec.br</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
