const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const TARGET_GLOBAL_FOODS = Number(process.env.FOOD_IMPORT_TARGET || 1000);
const TACO_URL = "https://raw.githubusercontent.com/machine-learning-mocha/taco/main/formatados/alimentos.csv";
const OFF_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";
const BASE_FOODS = [
  {
    id: "base-knorr-caldo-em-po-sabor-carne-144g",
    organizationId: null,
    name: "Caldo em po sabor carne [Knorr]",
    portion: "100 g",
    householdMeasure: "21 porcoes de 4,75 g",
    calories: 316,
    protein: 0,
    carbs: 29.47,
    fat: 21.05,
    fiber: 0,
    category: "Temperos",
    source: "base inicial"
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

  const tacoFoods = await fetchTacoFoods();
  await upsertFoods(tacoFoods);
  await upsertFoods(BASE_FOODS);

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
      "User-Agent": "NutriPlan/0.1 local importer"
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
      const category = getValue(row, headerIndex, "categoria do alimento");

      if (!number || !name) {
        return null;
      }

      return {
        id: `taco-${number}`,
        organizationId: null,
        name,
        portion: "100 g",
        householdMeasure: null,
        calories: parseNumber(getValue(row, headerIndex, "energia kcal")),
        protein: parseNumber(getValue(row, headerIndex, "proteina g")),
        carbs: parseNumber(getValue(row, headerIndex, "carboidrato g")),
        fat: parseNumber(getValue(row, headerIndex, "lipideos g")),
        fiber: parseNullableNumber(getValue(row, headerIndex, "fibra alimentar g")),
        category: category || "TACO",
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
        "User-Agent": "NutriPlan/0.1 local importer"
      }
    });

    const data = await response.json();
    const products = Array.isArray(data.products) ? data.products : [];

    for (const product of products) {
      if (foods.length >= limit) {
        break;
      }

      const code = String(product.code || "").trim();
      const name = cleanName(product.product_name || "");
      const nutriments = product.nutriments || {};

      if (!code || !name || seenCodes.has(code)) {
        continue;
      }

      const food = {
        id: `off-${code}`,
        organizationId: null,
        name,
        portion: "100 g",
        householdMeasure: null,
        calories: parseNumber(nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"]),
        protein: parseNumber(nutriments.proteins_100g ?? nutriments.proteins),
        carbs: parseNumber(nutriments.carbohydrates_100g ?? nutriments.carbohydrates),
        fat: parseNumber(nutriments.fat_100g ?? nutriments.fat),
        fiber: parseNullableNumber(nutriments.fiber_100g ?? nutriments.fiber),
        category: firstCategory(product.categories) || "Open Food Facts",
        source: "Open Food Facts ODbL"
      };

      if (!hasRequiredMacros(food)) {
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
