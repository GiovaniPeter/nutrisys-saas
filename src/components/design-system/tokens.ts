// ClinOSTec Design System 2026 — Tokens & Design Principles
// "Clínica de Precisão & Cuidado Caloroso"

export const colors = {
  // Primária: Sálvia Botânica Profunda (Editorial, clínica e confiável)
  sage: {
    50: '#F2F6F4',
    100: '#E3ECE8',
    200: '#C7D9D1',
    300: '#A1BEB3',
    400: '#739D8F',
    500: '#4D7D6F',
    600: '#396357',
    700: '#2D4F46',
    800: '#233E37',
    900: '#183B32', // Cor Principal
    950: '#0E231E',
  },
  // Apoio & Conversão: Terracota / Páprica Suave (Nutrição real, vitalidade, calor humano)
  terracotta: {
    50: '#FDF6F3',
    100: '#FCEEE8',
    200: '#F7DDD2',
    300: '#EFC2AF',
    400: '#E59A7C',
    500: '#BF4B22', // Contraste WCAG AA >4.9:1 com branco
    600: '#A83E1A',
    700: '#8F3415',
    800: '#752B12',
    900: '#5C220E',
  },
  // Neutros Quentes: Alabaster / Linho Mineral (Não cansa a visão em consultas longas)
  sand: {
    50: '#FAF9F6', // Fundo de página
    100: '#F5F3ED',
    200: '#EAE6DC', // Bordas e divisores
    300: '#DDD6C7',
    400: '#BDB4A1',
    500: '#968D7B',
    600: '#736C5D',
    700: '#565044',
    800: '#3C382F',
    900: '#24221C',
  },
  // Tipografia Neutra: Grafite Mineral com subtom botânico
  ink: {
    50: '#F4F6F5',
    100: '#E5EAE8',
    200: '#CCD5D2',
    300: '#AAB8B3',
    400: '#7E928B',
    500: '#5D716A',
    600: '#465550',
    700: '#343F3B',
    800: '#242D2A',
    900: '#131A17', // Título e texto forte
    950: '#0B0F0E',
  },
  // Macronutrientes Clínicos Universais (Reconhecimento instantâneo em 0.1s)
  macros: {
    cho: {
      label: 'Carboidratos',
      short: 'CHO',
      color: '#D97706',      // Âmbar Dourado / Caramelo Trigo
      soft: '#FEF3C7',
      border: '#FDE68A',
      text: '#92400E',
    },
    ptn: {
      label: 'Proteínas',
      short: 'PTN',
      color: '#DC4C3E',      // Coral Denso / Terracota Energético
      soft: '#FEE9E7',
      border: '#FECACA',
      text: '#991B1B',
    },
    lip: {
      label: 'Lipídios',
      short: 'LIP',
      color: '#0D9488',      // Teal / Azeite Extravirgem
      soft: '#CCFBF1',
      border: '#99F6E4',
      text: '#115E59',
    },
    fib: {
      label: 'Fibras',
      short: 'FIB',
      color: '#7C3AED',      // Violeta Semente
      soft: '#EDE9FE',
      border: '#DDD6FE',
      text: '#5B21B6',
    },
  },
  // Semânticos de Alta Acessibilidade (WCAG AA)
  semantic: {
    success: {
      color: '#1E7E56',
      soft: '#EBF7F0',
      border: '#A7F3D0',
      text: '#065F46',
    },
    warning: {
      color: '#D97706',
      soft: '#FEF3C7',
      border: '#FDE68A',
      text: '#92400E',
    },
    error: {
      color: '#DC2626',
      soft: '#FEE2E2',
      border: '#FECACA',
      text: '#991B1B',
    },
    info: {
      color: '#2563EB',
      soft: '#EFF6FF',
      border: '#BFDBFE',
      text: '#1E40AF',
    },
  },
};

export const typography = {
  fontFamily: {
    display: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
    sans: "'Plus Jakarta Sans', system-ui, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
};

export const shadows = {
  subtle: '0 1px 2px rgba(19, 26, 23, 0.04)',
  card: '0 1px 3px rgba(19, 26, 23, 0.04), 0 10px 24px -8px rgba(19, 26, 23, 0.06)',
  float: '0 12px 36px -8px rgba(24, 59, 50, 0.12), 0 4px 12px -2px rgba(19, 26, 23, 0.04)',
  glow: '0 0 28px -4px rgba(217, 107, 67, 0.25)',
};

export const radius = {
  sm: '0.375rem', // 6px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px - botões e inputs
  xl: '1rem',     // 16px - cards de módulos
  '2xl': '1.5rem',// 24px - modais e hero cards
  full: '9999px', // badges e pílulas
};
