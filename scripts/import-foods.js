const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const TARGET_GLOBAL_FOODS = Number(process.env.FOOD_IMPORT_TARGET || 1000);
const TACO_URL = "https://raw.githubusercontent.com/machine-learning-mocha/taco/main/formatados/alimentos.csv";
const OFF_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";

const CURATED_FOODS = [
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
  }
];

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

async function main() {
  await prisma.food.deleteMany({
    where: {
      organizationId: null,
      source: "base inicial"
    }
  });

  await upsertFoods(CURATED_FOODS);

  const tacoFoods = await fetchTacoFoods();
  await upsertFoods(tacoFoods);

  let globalCount = await prisma.food.count({
    where: { organizationId: null }
  });

  if (globalCount < TARGET_GLOBAL_FOODS) {
    const openFoodFactsFoods = await fetchOpenFoodFactsFoods(TARGET_GLOBAL_FOODS - globalCount);
    await upsertFoods(openFoodFactsFoods);
  }

  globalCount = await prisma.food.count({
    where: { organizationId: null }
  });
  const customCount = await prisma.food.count({
    where: { organizationId: { not: null } }
  });

  console.log(
    JSON.stringify(
      {
        targetGlobalFoods: TARGET_GLOBAL_FOODS,
        curatedImported: CURATED_FOODS.length,
        tacoImported: tacoFoods.length,
        globalFoods: globalCount,
        customFoods: customCount
      },
      null,
      2
    )
  );
}

async function fetchTacoFoods() {
  const response = await fetch(TACO_URL, {
    headers: {
      "User-Agent": "NutriPlan/0.2 local importer"
    }
  });

  if (!response.ok) {
    throw new Error(`TACO download failed: ${response.status}`);
  }

  const csv = await response.text();
  const rows = parseCsv(csv);
  const [header, ...body] = rows;
  const headerIndex = indexHeader(header);

  return body
    .map((row) => {
      const number = getValue(row, headerIndex, "numero do alimento");
      const name = titleCaseFood(getValue(row, headerIndex, "descricao dos alimentos"));
      const rawCategory = getValue(row, headerIndex, "categoria do alimento");

      if (!number || !name) {
        return null;
      }

      const category = normalizeCategory(rawCategory, name);

      return {
        id: `taco-${number}`,
        organizationId: null,
        name,
        portion: "100 g",
        householdMeasure: inferHouseholdMeasure(name, category),
        calories: parseNumber(getValue(row, headerIndex, "energia kcal")),
        protein: parseNumber(getValue(row, headerIndex, "proteina g")),
        carbs: parseNumber(getValue(row, headerIndex, "carboidrato g")),
        fat: parseNumber(getValue(row, headerIndex, "lipideos g")),
        fiber: parseNullableNumber(getValue(row, headerIndex, "fibra alimentar g")),
        category,
        source: "TACO/NEPA-Unicamp 4a edicao"
      };
    })
    .filter(Boolean)
    .filter(hasRequiredMacros);
}

async function fetchOpenFoodFactsFoods(limit) {
  const foods = [];
  const seenCodes = new Set();
  let page = 1;

  while (foods.length < limit && page <= 20) {
    const params = new URLSearchParams({
      search_terms: "",
      tagtype_0: "countries",
      tag_contains_0: "contains",
      tag_0: "Brazil",
      fields: "code,product_name,brands,nutriments,categories",
      json: "1",
      page_size: "50",
      page: String(page)
    });

    const response = await fetchWithRetry(`${OFF_SEARCH_URL}?${params}`, {
      headers: {
        "User-Agent": "NutriPlan/0.2 local importer"
      }
    });

    const data = await response.json();
    const products = Array.isArray(data.products) ? data.products : [];

    for (const product of products) {
      if (foods.length >= limit) {
        break;
      }

      const code = String(product.code || "").trim();
      const rawName = cleanName(product.product_name || "");
      const brand = cleanName(product.brands || "");
      const name = brand && !rawName.toLowerCase().includes(brand.toLowerCase()) ? `${rawName} [${brand}]` : rawName;
      const nutriments = product.nutriments || {};

      if (!code || !rawName || rawName.length < 3 || seenCodes.has(code)) {
        continue;
      }

      const category = normalizeCategory(firstCategory(product.categories), name);

      const food = {
        id: `off-${code}`,
        organizationId: null,
        name: name.slice(0, 180),
        portion: "100 g",
        householdMeasure: inferHouseholdMeasure(name, category),
        calories: parseNumber(nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"]),
        protein: parseNumber(nutriments.proteins_100g ?? nutriments.proteins),
        carbs: parseNumber(nutriments.carbohydrates_100g ?? nutriments.carbohydrates),
        fat: parseNumber(nutriments.fat_100g ?? nutriments.fat),
        fiber: parseNullableNumber(nutriments.fiber_100g ?? nutriments.fiber),
        category,
        source: "Open Food Facts Brasil"
      };

      if (!hasRequiredMacros(food) || food.calories <= 0) {
        continue;
      }

      seenCodes.add(code);
      foods.push(food);
    }

    if (products.length === 0) {
      break;
    }

    page += 1;
  }

  return foods;
}

function inferHouseholdMeasure(name, category) {
  const norm = normalize(`${name} ${category || ""}`);
  if (norm.includes("feijao")) return "1 concha média cheia (100 g)";
  if (norm.includes("arroz") || norm.includes("lentilha") || norm.includes("grao")) return "4 colheres de sopa cheias (100 g)";
  if (norm.includes("aveia") || norm.includes("farelo") || norm.includes("granola") || norm.includes("farinha")) return "5 colheres de sopa cheias (100 g) | 1 col. sopa ≈ 20 g";
  if (norm.includes("pao frances")) return "2 unidades médias (100 g) | 1 unidade ≈ 50 g";
  if (norm.includes("pao")) return "4 fatias médias (100 g) | 1 fatia ≈ 25 g";
  if (norm.includes("frango") || norm.includes("bife") || norm.includes("patinho") || norm.includes("alcatra") || norm.includes("file") || norm.includes("peixe") || norm.includes("tilapia") || norm.includes("salmao") || norm.includes("carne")) return "1 filé / bife médio (100 g)";
  if (norm.includes("ovo")) return "2 unidades médias (100 g) | 1 ovo ≈ 50 g";
  if (norm.includes("queijo") || norm.includes("mucarela") || norm.includes("minas")) return "3 fatias médias (100 g) | 1 fatia ≈ 30 g";
  if (norm.includes("leite") || norm.includes("iogurte") || norm.includes("suco") || norm.includes("bebida")) return "1/2 copo americano (100 ml) | 1 copo = 200 ml";
  if (norm.includes("fruta") || norm.includes("banana") || norm.includes("maca") || norm.includes("laranja") || norm.includes("mamao")) return "1 porção / unidade média (100 g)";
  if (norm.includes("azeite") || norm.includes("oleo") || norm.includes("manteiga")) return "10 colheres de sopa (100 g) | 1 col. sopa ≈ 10 g";
  return "4 colheres de sopa / 1 porção padrão (100 g)";
}

function normalizeCategory(rawCategory, name) {
  const norm = normalize(`${rawCategory || ""} ${name || ""}`);
  if (norm.includes("cereal") || norm.includes("cereais") || norm.includes("pao") || norm.includes("arroz") || norm.includes("batata") || norm.includes("mandioca") || norm.includes("macarrao") || norm.includes("aveia")) return "Cereais, Pães e Tubérculos";
  if (norm.includes("carne") || norm.includes("ave") || norm.includes("frango") || norm.includes("bovin") || norm.includes("suin") || norm.includes("peixe") || norm.includes("pescado") || norm.includes("ovo")) return "Carnes, Aves, Peixes e Ovos";
  if (norm.includes("leguminosa") || norm.includes("feijao") || norm.includes("lentilha") || norm.includes("grao") || norm.includes("castanha") || norm.includes("nozes") || norm.includes("amendoim")) return "Feijões, Leguminosas e Oleaginosas";
  if (norm.includes("fruta") || norm.includes("banana") || norm.includes("maca") || norm.includes("laranja") || norm.includes("mamao") || norm.includes("abacaxi") || norm.includes("morango")) return "Frutas e Sucos Naturais";
  if (norm.includes("verdura") || norm.includes("hortalica") || norm.includes("legume") || norm.includes("brocolis") || norm.includes("alface") || norm.includes("tomate") || norm.includes("cenoura")) return "Verduras, Hortaliças e Legumes";
  if (norm.includes("leite") || norm.includes("laticinio") || norm.includes("queijo") || norm.includes("iogurte")) return "Laticínios, Queijos e Bebidas Vegetais";
  if (norm.includes("oleo") || norm.includes("gordura") || norm.includes("azeite") || norm.includes("manteiga")) return "Óleos, Gorduras e Sementes";
  if (norm.includes("doce") || norm.includes("acucar") || norm.includes("chocolate") || norm.includes("mel")) return "Doces, Açúcares e Condimentos";
  return "Cereais, Pães e Tubérculos";
}

async function fetchWithRetry(url, init, attempts = 4) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, init);

      if (response.ok) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}`);
      if (![429, 500, 502, 503, 504].includes(response.status)) {
        throw lastError;
      }
    } catch (error) {
      lastError = error;
    }

    await sleep(1000 * attempt);
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function upsertFoods(foods) {
  for (const food of foods) {
    await prisma.food.upsert({
      where: { id: food.id },
      update: {
        name: food.name,
        portion: food.portion,
        householdMeasure: food.householdMeasure,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        category: food.category,
        source: food.source
      },
      create: food
    });
  }
}

function parseCsv(csv) {
  const rows = [];
  let field = "";
  let row = [];
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      row.push(field);
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      field = "";
      row = [];
      continue;
    }

    field += char;
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function indexHeader(header) {
  return header.reduce((index, column, position) => {
    index[normalize(column)] = position;
    return index;
  }, {});
}

function getValue(row, headerIndex, wanted) {
  const key = Object.keys(headerIndex).find((candidate) => candidate.includes(normalize(wanted)));
  const value = key ? row[headerIndex[key]] : "";
  return String(value || "").trim();
}

function normalize(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function parseNumber(value) {
  const number = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(number) ? number : 0;
}

function parseNullableNumber(value) {
  const number = parseNumber(value);
  return Number.isFinite(number) ? number : null;
}

function hasRequiredMacros(food) {
  return food.name && food.calories >= 0 && food.protein >= 0 && food.carbs >= 0 && food.fat >= 0;
}

function titleCaseFood(value) {
  return cleanName(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

function cleanName(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function firstCategory(value) {
  return String(value || "")
    .split(",")
    .map((part) => part.trim())
    .find(Boolean)
    ?.slice(0, 80);
}
