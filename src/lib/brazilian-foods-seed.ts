export type SeedFood = {
  id: string;
  organizationId: null;
  name: string;
  portion: string;
  householdMeasure: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  category: string;
  source: string;
};

export const FOOD_CATEGORIES = [
  "Cereais, Pães e Tubérculos",
  "Carnes, Aves, Peixes e Ovos",
  "Feijões, Leguminosas e Oleaginosas",
  "Frutas e Sucos Naturais",
  "Verduras, Hortaliças e Legumes",
  "Laticínios, Queijos e Bebidas Vegetais",
  "Óleos, Gorduras e Sementes",
  "Suplementos e Nutrição Esportiva",
  "Nutrição Clínica e Enteral (Multiprofissional)",
  "Preparações Caseiras e Lanches",
  "Doces, Açúcares e Condimentos"
] as const;

export const CURATED_BRAZILIAN_FOODS: SeedFood[] = [
  // ==========================================
  // 1. CEREAIS, PÃES E TUBÉRCULOS
  // ==========================================
  {
    id: "curated-arroz-branco-cozido",
    organizationId: null,
    name: "Arroz branco, tipo 1, cozido",
    portion: "100 g",
    householdMeasure: "4 colheres de sopa cheias (100 g)",
    calories: 128.3,
    protein: 2.5,
    carbs: 28.1,
    fat: 0.2,
    fiber: 1.6,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-arroz-integral-cozido",
    organizationId: null,
    name: "Arroz integral, cozido",
    portion: "100 g",
    householdMeasure: "4 colheres de sopa cheias (100 g)",
    calories: 123.5,
    protein: 2.6,
    carbs: 25.8,
    fat: 1.0,
    fiber: 2.7,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-aveia-flocos",
    organizationId: null,
    name: "Aveia em flocos (finos ou regulares)",
    portion: "30 g",
    householdMeasure: "2 colheres de sopa cheias (30 g)",
    calories: 118.2,
    protein: 4.2,
    carbs: 20.0,
    fat: 2.5,
    fiber: 2.7,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-farelo-aveia",
    organizationId: null,
    name: "Farelo de aveia",
    portion: "20 g",
    householdMeasure: "2 colheres de sopa rasas (20 g)",
    calories: 68.0,
    protein: 3.5,
    carbs: 11.2,
    fat: 1.4,
    fiber: 3.1,
    category: "Cereais, Pães e Tubérculos",
    source: "TBCA / Curadoria Clínica"
  },
  {
    id: "curated-pao-frances",
    organizationId: null,
    name: "Pão francês (pão de sal)",
    portion: "50 g",
    householdMeasure: "1 unidade média (50 g)",
    calories: 150.0,
    protein: 4.0,
    carbs: 29.3,
    fat: 1.5,
    fiber: 1.2,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-pao-forma-integral",
    organizationId: null,
    name: "Pão de forma integral",
    portion: "50 g",
    householdMeasure: "2 fatias médias (50 g)",
    calories: 126.5,
    protein: 4.7,
    carbs: 24.9,
    fat: 1.8,
    fiber: 3.5,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-pao-queijo-assado",
    organizationId: null,
    name: "Pão de queijo tradicional, assado",
    portion: "40 g",
    householdMeasure: "1 unidade média (40 g)",
    calories: 145.2,
    protein: 2.0,
    carbs: 13.7,
    fat: 9.8,
    fiber: 0.2,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-tapioca-goma",
    organizationId: null,
    name: "Tapioca (goma hidratada de mandioca)",
    portion: "50 g",
    householdMeasure: "3 colheres de sopa (50 g)",
    calories: 121.0,
    protein: 0.1,
    carbs: 30.0,
    fat: 0.0,
    fiber: 0.2,
    category: "Cereais, Pães e Tubérculos",
    source: "TBCA / Curadoria Clínica"
  },
  {
    id: "curated-cuscuz-milho-cozido",
    organizationId: null,
    name: "Cuscuz de milho (flocão), cozido no vapor",
    portion: "100 g",
    householdMeasure: "1 pedaço médio / 5 colheres de sopa (100 g)",
    calories: 113.0,
    protein: 2.2,
    carbs: 25.3,
    fat: 0.7,
    fiber: 2.1,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-batata-doce-cozida",
    organizationId: null,
    name: "Batata-doce, cozida",
    portion: "100 g",
    householdMeasure: "3 rodelas médias / 3 colheres de sopa (100 g)",
    calories: 76.8,
    protein: 0.6,
    carbs: 18.4,
    fat: 0.1,
    fiber: 2.2,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-batata-inglesa-cozida",
    organizationId: null,
    name: "Batata inglesa, cozida",
    portion: "100 g",
    householdMeasure: "1 unidade média / 3 colheres de sopa (100 g)",
    calories: 51.6,
    protein: 1.2,
    carbs: 11.9,
    fat: 0.0,
    fiber: 1.3,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-mandioca-cozida",
    organizationId: null,
    name: "Mandioca (aipim / macaxeira), cozida",
    portion: "100 g",
    householdMeasure: "2 pedaços médios (100 g)",
    calories: 125.4,
    protein: 0.6,
    carbs: 30.1,
    fat: 0.3,
    fiber: 1.6,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-mandioquinha-cozida",
    organizationId: null,
    name: "Mandioquinha (batata-baroa), cozida",
    portion: "100 g",
    householdMeasure: "4 colheres de sopa (100 g)",
    calories: 80.1,
    protein: 0.9,
    carbs: 18.9,
    fat: 0.2,
    fiber: 1.8,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-inhame-cozido",
    organizationId: null,
    name: "Inhame (cará), cozido",
    portion: "100 g",
    householdMeasure: "3 colheres de sopa cheias (100 g)",
    calories: 97.0,
    protein: 1.5,
    carbs: 23.2,
    fat: 0.1,
    fiber: 2.6,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-macarrao-trigo-cozido",
    organizationId: null,
    name: "Macarrão de trigo, cozido",
    portion: "100 g",
    householdMeasure: "1 escumadeira cheia (100 g)",
    calories: 126.0,
    protein: 4.3,
    carbs: 26.2,
    fat: 0.5,
    fiber: 1.5,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-macarrao-integral-cozido",
    organizationId: null,
    name: "Macarrão integral, cozido",
    portion: "100 g",
    householdMeasure: "1 escumadeira cheia (100 g)",
    calories: 124.0,
    protein: 4.7,
    carbs: 25.1,
    fat: 0.8,
    fiber: 3.5,
    category: "Cereais, Pães e Tubérculos",
    source: "TBCA / Curadoria Clínica"
  },
  {
    id: "curated-granola-sem-acucar",
    organizationId: null,
    name: "Granola tradicional sem açúcar",
    portion: "30 g",
    householdMeasure: "3 colheres de sopa (30 g)",
    calories: 122.0,
    protein: 3.2,
    carbs: 19.5,
    fat: 3.4,
    fiber: 2.8,
    category: "Cereais, Pães e Tubérculos",
    source: "TBCA / Curadoria Clínica"
  },
  {
    id: "curated-biscoito-arroz-integral",
    organizationId: null,
    name: "Biscoito de arroz integral (rice cake)",
    portion: "15 g",
    householdMeasure: "3 unidades grandes (15 g)",
    calories: 57.0,
    protein: 1.2,
    carbs: 12.3,
    fat: 0.3,
    fiber: 0.6,
    category: "Cereais, Pães e Tubérculos",
    source: "TBCA / Curadoria Clínica"
  },
  {
    id: "curated-torrada-integral",
    organizationId: null,
    name: "Torrada integral industrializada",
    portion: "30 g",
    householdMeasure: "3 unidades (30 g)",
    calories: 112.0,
    protein: 3.9,
    carbs: 20.4,
    fat: 1.6,
    fiber: 2.4,
    category: "Cereais, Pães e Tubérculos",
    source: "TACO / Curadoria Clínica"
  },

  // ==========================================
  // 2. CARNES, AVES, PEIXES E OVOS
  // ==========================================
  {
    id: "curated-peito-frango-grelhado",
    organizationId: null,
    name: "Peito de frango sem pele, grelhado",
    portion: "100 g",
    householdMeasure: "1 filé médio grelhado (100 g)",
    calories: 159.2,
    protein: 32.0,
    carbs: 0.0,
    fat: 2.5,
    fiber: 0.0,
    category: "Carnes, Aves, Peixes e Ovos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-frango-desfiado-cozido",
    organizationId: null,
    name: "Frango (peito) cozido e desfiado",
    portion: "100 g",
    householdMeasure: "4 colheres de sopa cheias (100 g)",
    calories: 162.8,
    protein: 31.5,
    carbs: 0.0,
    fat: 3.2,
    fiber: 0.0,
    category: "Carnes, Aves, Peixes e Ovos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-sobrecoxa-frango-assada",
    organizationId: null,
    name: "Sobrecoxa de frango sem pele, assada",
    portion: "100 g",
    householdMeasure: "1 unidade grande assada (100 g)",
    calories: 232.9,
    protein: 29.2,
    carbs: 0.0,
    fat: 12.0,
    fiber: 0.0,
    category: "Carnes, Aves, Peixes e Ovos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-patinho-bovino-grelhado",
    organizationId: null,
    name: "Carne bovina, patinho sem gordura, grelhado / moído",
    portion: "100 g",
    householdMeasure: "1 bife médio ou 4 colheres de sopa moído (100 g)",
    calories: 219.3,
    protein: 35.9,
    carbs: 0.0,
    fat: 7.3,
    fiber: 0.0,
    category: "Carnes, Aves, Peixes e Ovos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-alcatra-grelhada",
    organizationId: null,
    name: "Carne bovina, alcatra sem gordura, grelhada",
    portion: "100 g",
    householdMeasure: "1 bife médio (100 g)",
    calories: 241.3,
    protein: 31.9,
    carbs: 0.0,
    fat: 11.6,
    fiber: 0.0,
    category: "Carnes, Aves, Peixes e Ovos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-acem-cozido",
    organizationId: null,
    name: "Carne bovina, acém magro, cozido / desfiado",
    portion: "100 g",
    householdMeasure: "3 pedaços médios ou 4 colheres de sopa (100 g)",
    calories: 214.6,
    protein: 26.7,
    carbs: 0.0,
    fat: 10.9,
    fiber: 0.0,
    category: "Carnes, Aves, Peixes e Ovos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-file-mignon-grelhado",
    organizationId: null,
    name: "Carne bovina, filé mignon sem gordura, grelhado",
    portion: "100 g",
    householdMeasure: "1 medalhão / bife médio (100 g)",
    calories: 219.7,
    protein: 32.8,
    carbs: 0.0,
    fat: 8.8,
    fiber: 0.0,
    category: "Carnes, Aves, Peixes e Ovos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-lombo-suino-assado",
    organizationId: null,
    name: "Carne suína, lombo magro, assado / grelhado",
    portion: "100 g",
    householdMeasure: "1 fatia grossa (100 g)",
    calories: 210.0,
    protein: 35.7,
    carbs: 0.0,
    fat: 6.4,
    fiber: 0.0,
    category: "Carnes, Aves, Peixes e Ovos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-tilapia-grelhada",
    organizationId: null,
    name: "Peixe tilápia (filé), grelhado",
    portion: "100 g",
    householdMeasure: "1 filé médio grelhado (100 g)",
    calories: 128.0,
    protein: 26.2,
    carbs: 0.0,
    fat: 2.7,
    fiber: 0.0,
    category: "Carnes, Aves, Peixes e Ovos",
    source: "TBCA / Curadoria Clínica"
  },
  {
    id: "curated-salmao-grelhado",
    organizationId: null,
    name: "Peixe salmão sem pele, grelhado",
    portion: "100 g",
    householdMeasure: "1 posta média (100 g)",
    calories: 242.7,
    protein: 26.1,
    carbs: 0.0,
    fat: 14.5,
    fiber: 0.0,
    category: "Carnes, Aves, Peixes e Ovos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-atum-agua",
    organizationId: null,
    name: "Atum sólido ou ralado em água (escorrido)",
    portion: "60 g",
    householdMeasure: "3 colheres de sopa / meia lata (60 g)",
    calories: 65.4,
    protein: 15.0,
    carbs: 0.0,
    fat: 0.5,
    fiber: 0.0,
    category: "Carnes, Aves, Peixes e Ovos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-ovo-inteiro-cozido",
    organizationId: null,
    name: "Ovo de galinha inteiro (cozido, pochê ou mexido sem óleo)",
    portion: "50 g",
    householdMeasure: "1 unidade média (50 g)",
    calories: 72.8,
    protein: 6.7,
    carbs: 0.3,
    fat: 4.8,
    fiber: 0.0,
    category: "Carnes, Aves, Peixes e Ovos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-clara-ovo-cozida",
    organizationId: null,
    name: "Clara de ovo de galinha, cozida",
    portion: "33 g",
    householdMeasure: "1 clara de ovo média (33 g)",
    calories: 19.5,
    protein: 4.4,
    carbs: 0.0,
    fat: 0.0,
    fiber: 0.0,
    category: "Carnes, Aves, Peixes e Ovos",
    source: "TACO / Curadoria Clínica"
  },

  // ==========================================
  // 3. FEIJÕES, LEGUMINOSAS E OLEAGINOSAS
  // ==========================================
  {
    id: "curated-feijao-carioca-cozido",
    organizationId: null,
    name: "Feijão carioca, cozido (50% grão e 50% caldo)",
    portion: "100 g",
    householdMeasure: "1 concha média cheia (100 g)",
    calories: 76.4,
    protein: 4.8,
    carbs: 13.6,
    fat: 0.5,
    fiber: 8.5,
    category: "Feijões, Leguminosas e Oleaginosas",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-feijao-preto-cozido",
    organizationId: null,
    name: "Feijão preto, cozido (50% grão e 50% caldo)",
    portion: "100 g",
    householdMeasure: "1 concha média cheia (100 g)",
    calories: 77.4,
    protein: 4.5,
    carbs: 14.0,
    fat: 0.5,
    fiber: 8.4,
    category: "Feijões, Leguminosas e Oleaginosas",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-lentilha-cozida",
    organizationId: null,
    name: "Lentilha, cozida",
    portion: "100 g",
    householdMeasure: "4 colheres de sopa cheias (100 g)",
    calories: 92.6,
    protein: 6.3,
    carbs: 16.3,
    fat: 0.5,
    fiber: 7.9,
    category: "Feijões, Leguminosas e Oleaginosas",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-grao-de-bico-cozido",
    organizationId: null,
    name: "Grão-de-bico, cozido",
    portion: "100 g",
    householdMeasure: "4 colheres de sopa cheias (100 g)",
    calories: 130.0,
    protein: 7.5,
    carbs: 21.2,
    fat: 2.1,
    fiber: 6.4,
    category: "Feijões, Leguminosas e Oleaginosas",
    source: "TBCA / Curadoria Clínica"
  },
  {
    id: "curated-castanha-do-para",
    organizationId: null,
    name: "Castanha-do-pará (Castanha-do-brasil)",
    portion: "10 g",
    householdMeasure: "2 unidades médias (10 g)",
    calories: 64.3,
    protein: 1.5,
    carbs: 1.5,
    fat: 6.4,
    fiber: 0.8,
    category: "Feijões, Leguminosas e Oleaginosas",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-castanha-de-caju-torrada",
    organizationId: null,
    name: "Castanha de caju, torrada sem sal",
    portion: "15 g",
    householdMeasure: "5 a 6 unidades (15 g)",
    calories: 85.5,
    protein: 2.8,
    carbs: 4.4,
    fat: 6.9,
    fiber: 0.6,
    category: "Feijões, Leguminosas e Oleaginosas",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-nozes",
    organizationId: null,
    name: "Nozes (cruas)",
    portion: "15 g",
    householdMeasure: "3 unidades inteiras (15 g)",
    calories: 93.0,
    protein: 2.1,
    carbs: 2.8,
    fat: 8.9,
    fiber: 1.1,
    category: "Feijões, Leguminosas e Oleaginosas",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-pasta-amendoim-integral",
    organizationId: null,
    name: "Pasta de amendoim integral (100% amendoim sem açúcar)",
    portion: "20 g",
    householdMeasure: "1 colher de sopa cheia (20 g)",
    calories: 118.0,
    protein: 5.6,
    carbs: 3.4,
    fat: 9.8,
    fiber: 1.6,
    category: "Feijões, Leguminosas e Oleaginosas",
    source: "TBCA / Curadoria Clínica"
  },

  // ==========================================
  // 4. FRUTAS E SUCOS NATURAIS
  // ==========================================
  {
    id: "curated-banana-prata",
    organizationId: null,
    name: "Banana prata, in natura",
    portion: "70 g",
    householdMeasure: "1 unidade média (70 g)",
    calories: 68.6,
    protein: 0.9,
    carbs: 18.2,
    fat: 0.1,
    fiber: 1.4,
    category: "Frutas e Sucos Naturais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-banana-nanica",
    organizationId: null,
    name: "Banana nanica (caturra), in natura",
    portion: "90 g",
    householdMeasure: "1 unidade média (90 g)",
    calories: 82.8,
    protein: 1.3,
    carbs: 21.4,
    fat: 0.1,
    fiber: 1.7,
    category: "Frutas e Sucos Naturais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-maca-fuji",
    organizationId: null,
    name: "Maçã Fuji ou Gala, com casca",
    portion: "130 g",
    householdMeasure: "1 unidade média (130 g)",
    calories: 72.8,
    protein: 0.4,
    carbs: 19.8,
    fat: 0.0,
    fiber: 1.7,
    category: "Frutas e Sucos Naturais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-mamao-formosa",
    organizationId: null,
    name: "Mamão Formosa ou Papaia, in natura",
    portion: "150 g",
    householdMeasure: "1 fatia grande ou meia unidade papaia (150 g)",
    calories: 67.5,
    protein: 1.2,
    carbs: 17.4,
    fat: 0.2,
    fiber: 2.7,
    category: "Frutas e Sucos Naturais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-morango-fresco",
    organizationId: null,
    name: "Morango fresco, in natura",
    portion: "100 g",
    householdMeasure: "8 unidades médias / 1 xícara (100 g)",
    calories: 30.2,
    protein: 0.9,
    carbs: 6.8,
    fat: 0.3,
    fiber: 1.7,
    category: "Frutas e Sucos Naturais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-abacate-fresco",
    organizationId: null,
    name: "Abacate ou Avocado, in natura",
    portion: "100 g",
    householdMeasure: "4 colheres de sopa cheias (100 g)",
    calories: 96.2,
    protein: 1.2,
    carbs: 6.0,
    fat: 8.4,
    fiber: 6.3,
    category: "Frutas e Sucos Naturais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-abacaxi-perola",
    organizationId: null,
    name: "Abacaxi pérola, in natura",
    portion: "100 g",
    householdMeasure: "1 fatia média (100 g)",
    calories: 48.3,
    protein: 0.9,
    carbs: 12.3,
    fat: 0.1,
    fiber: 1.0,
    category: "Frutas e Sucos Naturais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-laranja-pera",
    organizationId: null,
    name: "Laranja pera, in natura",
    portion: "140 g",
    householdMeasure: "1 unidade média (140 g)",
    calories: 51.8,
    protein: 1.4,
    carbs: 12.5,
    fat: 0.1,
    fiber: 1.1,
    category: "Frutas e Sucos Naturais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-melancia-fresca",
    organizationId: null,
    name: "Melancia fresca, in natura",
    portion: "200 g",
    householdMeasure: "1 fatia média (200 g)",
    calories: 65.2,
    protein: 1.8,
    carbs: 16.2,
    fat: 0.0,
    fiber: 0.2,
    category: "Frutas e Sucos Naturais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-manga-palmer",
    organizationId: null,
    name: "Manga Palmer ou Tommy, in natura",
    portion: "140 g",
    householdMeasure: "1 xícara em cubos / meia manga média (140 g)",
    calories: 100.8,
    protein: 0.6,
    carbs: 27.2,
    fat: 0.3,
    fiber: 2.2,
    category: "Frutas e Sucos Naturais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-uva-rubi-thompson",
    organizationId: null,
    name: "Uva (Rubi, Itália ou Sem Semente), in natura",
    portion: "100 g",
    householdMeasure: "12 a 15 bagos / 1 cacho pequeno (100 g)",
    calories: 53.0,
    protein: 0.7,
    carbs: 13.6,
    fat: 0.2,
    fiber: 0.9,
    category: "Frutas e Sucos Naturais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-kiwi-fresco",
    organizationId: null,
    name: "Kiwi fresco, in natura",
    portion: "80 g",
    householdMeasure: "1 unidade média (80 g)",
    calories: 40.8,
    protein: 1.0,
    carbs: 9.2,
    fat: 0.5,
    fiber: 2.2,
    category: "Frutas e Sucos Naturais",
    source: "TACO / Curadoria Clínica"
  },

  // ==========================================
  // 5. VERDURAS, HORTALIÇAS E LEGUMES
  // ==========================================
  {
    id: "curated-brocolis-cozido",
    organizationId: null,
    name: "Brócolis cozido no vapor",
    portion: "100 g",
    householdMeasure: "1 xícara de chá / 4 ramos médios (100 g)",
    calories: 24.6,
    protein: 2.1,
    carbs: 4.4,
    fat: 0.5,
    fiber: 3.4,
    category: "Verduras, Hortaliças e Legumes",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-abobrinha-refogada",
    organizationId: null,
    name: "Abobrinha italiana, cozida / refogada",
    portion: "100 g",
    householdMeasure: "4 colheres de sopa cheias (100 g)",
    calories: 15.0,
    protein: 1.1,
    carbs: 3.0,
    fat: 0.2,
    fiber: 1.6,
    category: "Verduras, Hortaliças e Legumes",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-cenoura-cozida",
    organizationId: null,
    name: "Cenoura cozida",
    portion: "100 g",
    householdMeasure: "4 colheres de sopa (100 g)",
    calories: 29.9,
    protein: 0.8,
    carbs: 6.7,
    fat: 0.2,
    fiber: 2.6,
    category: "Verduras, Hortaliças e Legumes",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-abobora-cabotian-cozida",
    organizationId: null,
    name: "Abóbora cabotián (japonesa), cozida",
    portion: "100 g",
    householdMeasure: "4 colheres de sopa (100 g)",
    calories: 48.0,
    protein: 1.4,
    carbs: 10.8,
    fat: 0.7,
    fiber: 2.5,
    category: "Verduras, Hortaliças e Legumes",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-salada-folhas-verdes",
    organizationId: null,
    name: "Mix de folhas verdes (alface, rúcula, agrião, espinafre)",
    portion: "50 g",
    householdMeasure: "1 prato de sobremesa cheio à vontade (50 g)",
    calories: 9.5,
    protein: 1.1,
    carbs: 1.4,
    fat: 0.1,
    fiber: 1.2,
    category: "Verduras, Hortaliças e Legumes",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-tomate-salada",
    organizationId: null,
    name: "Tomate cru em rodelas ou cubos",
    portion: "80 g",
    householdMeasure: "4 rodelas grandes / 1 unidade pequena (80 g)",
    calories: 12.0,
    protein: 0.9,
    carbs: 2.5,
    fat: 0.2,
    fiber: 1.0,
    category: "Verduras, Hortaliças e Legumes",
    source: "TACO / Curadoria Clínica"
  },

  // ==========================================
  // 6. LATICÍNIOS, QUEIJOS E BEBIDAS VEGETAIS
  // ==========================================
  {
    id: "curated-iogurte-natural-desnatado",
    organizationId: null,
    name: "Iogurte natural desnatado (2 ingredientes)",
    portion: "170 g",
    householdMeasure: "1 copo / pote individual (170 g)",
    calories: 70.5,
    protein: 6.5,
    carbs: 9.8,
    fat: 0.5,
    fiber: 0.0,
    category: "Laticínios, Queijos e Bebidas Vegetais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-iogurte-natural-integral",
    organizationId: null,
    name: "Iogurte natural integral (2 ingredientes)",
    portion: "170 g",
    householdMeasure: "1 copo / pote individual (170 g)",
    calories: 105.0,
    protein: 6.8,
    carbs: 9.1,
    fat: 5.1,
    fiber: 0.0,
    category: "Laticínios, Queijos e Bebidas Vegetais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-iogurte-proteico-zero",
    organizationId: null,
    name: "Iogurte proteico zero gordura (15g proteína)",
    portion: "250 g",
    householdMeasure: "1 garrafinha / pote (250 g)",
    calories: 115.0,
    protein: 15.0,
    carbs: 11.0,
    fat: 0.0,
    fiber: 0.0,
    category: "Laticínios, Queijos e Bebidas Vegetais",
    source: "Curadoria Clínica"
  },
  {
    id: "curated-leite-vaca-desnatado",
    organizationId: null,
    name: "Leite de vaca desnatado (UHT)",
    portion: "200 ml",
    householdMeasure: "1 copo americano (200 ml)",
    calories: 64.0,
    protein: 6.4,
    carbs: 9.8,
    fat: 0.2,
    fiber: 0.0,
    category: "Laticínios, Queijos e Bebidas Vegetais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-leite-vaca-semidesnatado",
    organizationId: null,
    name: "Leite de vaca semidesnatado / zero lactose",
    portion: "200 ml",
    householdMeasure: "1 copo americano (200 ml)",
    calories: 86.0,
    protein: 6.2,
    carbs: 9.6,
    fat: 2.4,
    fiber: 0.0,
    category: "Laticínios, Queijos e Bebidas Vegetais",
    source: "TBCA / Curadoria Clínica"
  },
  {
    id: "curated-queijo-minas-frescal",
    organizationId: null,
    name: "Queijo minas frescal (tradicional ou light)",
    portion: "30 g",
    householdMeasure: "1 fatia média grossa (30 g)",
    calories: 79.2,
    protein: 5.2,
    carbs: 1.0,
    fat: 6.1,
    fiber: 0.0,
    category: "Laticínios, Queijos e Bebidas Vegetais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-queijo-mucarela",
    organizationId: null,
    name: "Queijo muçarela fatiado",
    portion: "30 g",
    householdMeasure: "2 fatias finas (30 g)",
    calories: 99.0,
    protein: 6.8,
    carbs: 0.9,
    fat: 7.6,
    fiber: 0.0,
    category: "Laticínios, Queijos e Bebidas Vegetais",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-queijo-cottage-ricota",
    organizationId: null,
    name: "Queijo cottage ou creme de ricota light",
    portion: "30 g",
    householdMeasure: "2 colheres de sopa rasas (30 g)",
    calories: 32.0,
    protein: 3.6,
    carbs: 1.2,
    fat: 1.4,
    fiber: 0.0,
    category: "Laticínios, Queijos e Bebidas Vegetais",
    source: "TBCA / Curadoria Clínica"
  },
  {
    id: "curated-requeijao-light",
    organizationId: null,
    name: "Requeijão cremoso light",
    portion: "30 g",
    householdMeasure: "1 colher de sopa cheia (30 g)",
    calories: 54.0,
    protein: 3.8,
    carbs: 1.2,
    fat: 3.8,
    fiber: 0.0,
    category: "Laticínios, Queijos e Bebidas Vegetais",
    source: "TACO / Curadoria Clínica"
  },

  // ==========================================
  // 7. ÓLEOS, GORDURAS E SEMENTES
  // ==========================================
  {
    id: "curated-azeite-oliva-extra-virgem",
    organizationId: null,
    name: "Azeite de oliva extravirgem",
    portion: "10 ml",
    householdMeasure: "1 colher de sopa (10 ml)",
    calories: 88.4,
    protein: 0.0,
    carbs: 0.0,
    fat: 10.0,
    fiber: 0.0,
    category: "Óleos, Gorduras e Sementes",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-manteiga-sem-sal",
    organizationId: null,
    name: "Manteiga de leite (com ou sem sal)",
    portion: "10 g",
    householdMeasure: "1 ponta de faca / 1 colher de chá cheia (10 g)",
    calories: 72.6,
    protein: 0.0,
    carbs: 0.0,
    fat: 8.2,
    fiber: 0.0,
    category: "Óleos, Gorduras e Sementes",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-semente-chia",
    organizationId: null,
    name: "Semente de chia",
    portion: "15 g",
    householdMeasure: "1 colher de sopa cheia (15 g)",
    calories: 72.9,
    protein: 2.5,
    carbs: 6.3,
    fat: 4.6,
    fiber: 5.2,
    category: "Óleos, Gorduras e Sementes",
    source: "TBCA / Curadoria Clínica"
  },
  {
    id: "curated-semente-linhaca-dourada",
    organizationId: null,
    name: "Semente ou farinha de linhaça dourada",
    portion: "15 g",
    householdMeasure: "1 colher de sopa cheia (15 g)",
    calories: 74.3,
    protein: 2.1,
    carbs: 6.5,
    fat: 4.8,
    fiber: 5.0,
    category: "Óleos, Gorduras e Sementes",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-psyllium-fibra",
    organizationId: null,
    name: "Psyllium em pó (fibra solúvel)",
    portion: "10 g",
    householdMeasure: "1 colher de sopa rasa (10 g)",
    calories: 18.0,
    protein: 0.2,
    carbs: 8.0,
    fat: 0.0,
    fiber: 7.8,
    category: "Óleos, Gorduras e Sementes",
    source: "Curadoria Clínica"
  },

  // ==========================================
  // 8. SUPLEMENTOS E NUTRIÇÃO ESPORTIVA
  // ==========================================
  {
    id: "curated-whey-protein-concentrado",
    organizationId: null,
    name: "Whey Protein Concentrado (80%)",
    portion: "30 g",
    householdMeasure: "1 scoop dosador cheio (30 g)",
    calories: 120.0,
    protein: 24.0,
    carbs: 3.0,
    fat: 1.5,
    fiber: 0.0,
    category: "Suplementos e Nutrição Esportiva",
    source: "Suplementação Clínica"
  },
  {
    id: "curated-whey-protein-isolado",
    organizationId: null,
    name: "Whey Protein Isolado / Hidrolisado (Zero Lactose)",
    portion: "30 g",
    householdMeasure: "1 scoop dosador cheio (30 g)",
    calories: 112.0,
    protein: 26.5,
    carbs: 0.8,
    fat: 0.3,
    fiber: 0.0,
    category: "Suplementos e Nutrição Esportiva",
    source: "Suplementação Clínica"
  },
  {
    id: "curated-proteina-vegetal-ervilha-arroz",
    organizationId: null,
    name: "Proteína Vegetal Vegana (Blend Ervilha + Arroz)",
    portion: "30 g",
    householdMeasure: "1 scoop dosador cheio (30 g)",
    calories: 118.0,
    protein: 23.0,
    carbs: 2.5,
    fat: 1.8,
    fiber: 1.2,
    category: "Suplementos e Nutrição Esportiva",
    source: "Suplementação Clínica"
  },
  {
    id: "curated-albumina-po",
    organizationId: null,
    name: "Albumina em pó (clara de ovo desidratada)",
    portion: "30 g",
    householdMeasure: "2 colheres de sopa cheias (30 g)",
    calories: 114.0,
    protein: 24.0,
    carbs: 1.5,
    fat: 0.0,
    fiber: 0.0,
    category: "Suplementos e Nutrição Esportiva",
    source: "Suplementação Clínica"
  },
  {
    id: "curated-creatina-monohidratada",
    organizationId: null,
    name: "Creatina Monohidratada (100% pura)",
    portion: "5 g",
    householdMeasure: "1 dosador de 5g ou 1 colher de chá cheia (5 g)",
    calories: 0.0,
    protein: 0.0,
    carbs: 0.0,
    fat: 0.0,
    fiber: 0.0,
    category: "Suplementos e Nutrição Esportiva",
    source: "Suplementação Clínica"
  },
  {
    id: "curated-barra-proteica",
    organizationId: null,
    name: "Barra de Proteína (Protein Bar tradicional)",
    portion: "45 g",
    householdMeasure: "1 unidade / barra (45 g)",
    calories: 175.0,
    protein: 15.0,
    carbs: 14.0,
    fat: 6.5,
    fiber: 3.0,
    category: "Suplementos e Nutrição Esportiva",
    source: "Suplementação Clínica"
  },
  {
    id: "curated-maltodextrina-palatinose",
    organizationId: null,
    name: "Palatinose (Isomaltulose) / Maltodextrina",
    portion: "30 g",
    householdMeasure: "1 scoop dosador (30 g)",
    calories: 120.0,
    protein: 0.0,
    carbs: 30.0,
    fat: 0.0,
    fiber: 0.0,
    category: "Suplementos e Nutrição Esportiva",
    source: "Suplementação Clínica"
  },

  // ==========================================
  // 9. NUTRIÇÃO CLÍNICA E ENTERAL (MULTIPROFISSIONAL)
  // ==========================================
  {
    id: "curated-suplemento-hiperproteico-senior",
    organizationId: null,
    name: "Suplemento Nutricional Oral Hiperproteico (tipo Nutren Senior / Ensure)",
    portion: "55 g",
    householdMeasure: "6 colheres de sopa rasas em 180ml de água/leite (55 g)",
    calories: 235.0,
    protein: 20.0,
    carbs: 21.0,
    fat: 7.8,
    fiber: 3.0,
    category: "Nutrição Clínica e Enteral (Multiprofissional)",
    source: "Protocolo Clínico / Hospitalar"
  },
  {
    id: "curated-modulo-proteina-hospitalar",
    organizationId: null,
    name: "Módulo de Proteína Isolada 100% Soro do Leite (Sem Sabor / Uso Clínico)",
    portion: "10 g",
    householdMeasure: "1 colher de medida hospitalar (10 g)",
    calories: 37.0,
    protein: 9.2,
    carbs: 0.0,
    fat: 0.0,
    fiber: 0.0,
    category: "Nutrição Clínica e Enteral (Multiprofissional)",
    source: "Protocolo Clínico / Hospitalar"
  },
  {
    id: "curated-espessante-disfagia-fono",
    organizationId: null,
    name: "Espessante Alimentar Instantâneo para Disfagia (Fonoaudiologia / Clínica)",
    portion: "3.6 g",
    householdMeasure: "3 colheres-medida para consistência Néctar/Mel (3,6 g)",
    calories: 11.0,
    protein: 0.0,
    carbs: 2.6,
    fat: 0.0,
    fiber: 0.9,
    category: "Nutrição Clínica e Enteral (Multiprofissional)",
    source: "Protocolo Fonoaudiologia / Disfagia"
  },
  {
    id: "curated-colageno-verisol-peptideos",
    organizationId: null,
    name: "Peptídeos Bioativos de Colágeno Hidrolisado + Vitamina C",
    portion: "10 g",
    householdMeasure: "1 scoop / sachê (10 g)",
    calories: 36.0,
    protein: 9.0,
    carbs: 0.0,
    fat: 0.0,
    fiber: 0.0,
    category: "Nutrição Clínica e Enteral (Multiprofissional)",
    source: "Protocolo Dermatologia / Estética / Ortopedia"
  },
  {
    id: "curated-dieta-enteral-normocalorica",
    organizationId: null,
    name: "Fórmula Enteral / Oral Normocalórica e Normoproteica (1.0 kcal/ml)",
    portion: "200 ml",
    householdMeasure: "1 frasco / etapa de 200 ml",
    calories: 200.0,
    protein: 8.0,
    carbs: 27.0,
    fat: 6.8,
    fiber: 3.0,
    category: "Nutrição Clínica e Enteral (Multiprofissional)",
    source: "Protocolo Clínico / Enteral"
  },

  // ==========================================
  // 10. PREPARAÇÕES CASEIRAS E LANCHES
  // ==========================================
  {
    id: "curated-crepioca-tradicional",
    organizationId: null,
    name: "Crepioca tradicional (1 ovo + 2 colheres de sopa de goma de tapioca)",
    portion: "80 g",
    householdMeasure: "1 disco médio pronto (80 g)",
    calories: 145.0,
    protein: 6.8,
    carbs: 18.3,
    fat: 4.8,
    fiber: 0.1,
    category: "Preparações Caseiras e Lanches",
    source: "Preparações Brasileiras"
  },
  {
    id: "curated-panqueca-banana-aveia",
    organizationId: null,
    name: "Panqueca funcional de banana com aveia e ovo (1 banana + 1 ovo + 2 col. aveia)",
    portion: "150 g",
    householdMeasure: "1 panqueca grande (150 g)",
    calories: 259.6,
    protein: 11.8,
    carbs: 38.5,
    fat: 7.4,
    fiber: 4.1,
    category: "Preparações Caseiras e Lanches",
    source: "Preparações Brasileiras"
  },
  {
    id: "curated-omelete-queijo-ervas",
    organizationId: null,
    name: "Omelete de 2 ovos com queijo minas e ervas",
    portion: "130 g",
    householdMeasure: "1 omelete média (130 g)",
    calories: 224.8,
    protein: 18.6,
    carbs: 1.6,
    fat: 15.7,
    fiber: 0.0,
    category: "Preparações Caseiras e Lanches",
    source: "Preparações Brasileiras"
  },

  // ==========================================
  // 11. DOCES, AÇÚCARES E CONDIMENTOS
  // ==========================================
  {
    id: "curated-chocolate-amargo-70",
    organizationId: null,
    name: "Chocolate amargo 70% cacau",
    portion: "25 g",
    householdMeasure: "2 a 3 quadradinhos (25 g)",
    calories: 138.0,
    protein: 2.2,
    carbs: 10.5,
    fat: 9.8,
    fiber: 2.5,
    category: "Doces, Açúcares e Condimentos",
    source: "TBCA / Curadoria Clínica"
  },
  {
    id: "curated-mel-abelha",
    organizationId: null,
    name: "Mel de abelha puro",
    portion: "15 g",
    householdMeasure: "1 colher de sopa rasa (15 g)",
    calories: 46.4,
    protein: 0.0,
    carbs: 12.6,
    fat: 0.0,
    fiber: 0.0,
    category: "Doces, Açúcares e Condimentos",
    source: "TACO / Curadoria Clínica"
  },
  {
    id: "curated-doce-de-leite",
    organizationId: null,
    name: "Doce de leite pastoso tradicional",
    portion: "20 g",
    householdMeasure: "1 colher de sopa rasa (20 g)",
    calories: 61.2,
    protein: 1.1,
    carbs: 11.0,
    fat: 1.5,
    fiber: 0.0,
    category: "Doces, Açúcares e Condimentos",
    source: "TACO / Curadoria Clínica"
  }
];

export function normalizeTextForSearch(value: string): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function inferHouseholdMeasure(name: string, category?: string | null): string {
  const norm = normalizeTextForSearch(`${name} ${category || ""}`);

  if (norm.includes("arroz") || norm.includes("feijao") || norm.includes("lentilha") || norm.includes("grao")) {
    if (norm.includes("feijao")) return "1 concha média cheia (100 g)";
    return "4 colheres de sopa cheias (100 g)";
  }
  if (norm.includes("aveia") || norm.includes("farelo") || norm.includes("granola") || norm.includes("farinha")) {
    return "5 colheres de sopa cheias (100 g) | 1 col. sopa ≈ 20 g";
  }
  if (norm.includes("pao frances") || norm.includes("pao de sal")) {
    return "2 unidades médias (100 g) | 1 unidade ≈ 50 g";
  }
  if (norm.includes("pao")) {
    return "4 fatias médias (100 g) | 1 fatia ≈ 25 g";
  }
  if (norm.includes("frango") || norm.includes("bife") || norm.includes("patinho") || norm.includes("alcatra") || norm.includes("file") || norm.includes("peixe") || norm.includes("tilapia") || norm.includes("salmao") || norm.includes("carne") || norm.includes("suina")) {
    return "1 filé / bife médio (100 g)";
  }
  if (norm.includes("ovo")) {
    return "2 unidades médias (100 g) | 1 ovo ≈ 50 g";
  }
  if (norm.includes("queijo") || norm.includes("mucarela") || norm.includes("minas") || norm.includes("prato")) {
    return "3 fatias médias (100 g) | 1 fatia ≈ 30 g";
  }
  if (norm.includes("leite") || norm.includes("iogurte") || norm.includes("suco") || norm.includes("bebida")) {
    return "1/2 copo americano (100 ml) | 1 copo = 200 ml";
  }
  if (norm.includes("banana") || norm.includes("maca") || norm.includes("laranja") || norm.includes("pera") || norm.includes("fruta") || norm.includes("mamao") || norm.includes("abacaxi") || norm.includes("manga")) {
    return "1 porção / unidade média (100 g)";
  }
  if (norm.includes("azeite") || norm.includes("oleo") || norm.includes("manteiga")) {
    return "10 colheres de sopa (100 g) | 1 col. sopa ≈ 10 g";
  }
  if (norm.includes("castanha") || norm.includes("nozes") || norm.includes("amendoim") || norm.includes("amendoa")) {
    return "1 xícara (100 g) | 1 porção usual ≈ 15 g";
  }
  if (norm.includes("whey") || norm.includes("proteina") || norm.includes("suplemento")) {
    return "1 scoop dosador (30 g)";
  }
  if (norm.includes("batata") || norm.includes("mandioca") || norm.includes("inhame") || norm.includes("legume") || norm.includes("brocolis") || norm.includes("cenoura")) {
    return "4 colheres de sopa cheias (100 g)";
  }
  return "4 colheres de sopa / 1 porção padrão (100 g)";
}

export function normalizeCategoryName(rawCategory?: string | null, name?: string): string {
  const norm = normalizeTextForSearch(`${rawCategory || ""} ${name || ""}`);

  if (norm.includes("suplemento") || norm.includes("whey") || norm.includes("creatina") || norm.includes("esportiv")) {
    return "Suplementos e Nutrição Esportiva";
  }
  if (norm.includes("enteral") || norm.includes("hospitalar") || norm.includes("disfagia") || norm.includes("espessante") || norm.includes("clinica")) {
    return "Nutrição Clínica e Enteral (Multiprofissional)";
  }
  if (norm.includes("cereal") || norm.includes("cereais") || norm.includes("pao") || norm.includes("paes") || norm.includes("tuberculo") || norm.includes("arroz") || norm.includes("batata") || norm.includes("mandioca") || norm.includes("macarrao") || norm.includes("aveia")) {
    return "Cereais, Pães e Tubérculos";
  }
  if (norm.includes("carne") || norm.includes("ave") || norm.includes("frango") || norm.includes("bovin") || norm.includes("suin") || norm.includes("peixe") || norm.includes("pescado") || norm.includes("ovo")) {
    return "Carnes, Aves, Peixes e Ovos";
  }
  if (norm.includes("leguminosa") || norm.includes("feijao") || norm.includes("lentilha") || norm.includes("grao") || norm.includes("castanha") || norm.includes("nozes") || norm.includes("oleaginosa") || norm.includes("amendoim")) {
    return "Feijões, Leguminosas e Oleaginosas";
  }
  if (norm.includes("fruta") || norm.includes("banana") || norm.includes("maca") || norm.includes("laranja") || norm.includes("mamao") || norm.includes("abacaxi") || norm.includes("morango")) {
    return "Frutas e Sucos Naturais";
  }
  if (norm.includes("verdura") || norm.includes("hortalica") || norm.includes("legume") || norm.includes("brocolis") || norm.includes("alface") || norm.includes("tomate") || norm.includes("cenoura") || norm.includes("abobrinha")) {
    return "Verduras, Hortaliças e Legumes";
  }
  if (norm.includes("leite") || norm.includes("laticinio") || norm.includes("queijo") || norm.includes("iogurte") || norm.includes("requeijao")) {
    return "Laticínios, Queijos e Bebidas Vegetais";
  }
  if (norm.includes("oleo") || norm.includes("gordura") || norm.includes("azeite") || norm.includes("manteiga") || norm.includes("chia") || norm.includes("linhaca")) {
    return "Óleos, Gorduras e Sementes";
  }
  if (norm.includes("doce") || norm.includes("acucar") || norm.includes("chocolate") || norm.includes("mel")) {
    return "Doces, Açúcares e Condimentos";
  }

  return rawCategory?.trim() || "Cereais, Pães e Tubérculos";
}
