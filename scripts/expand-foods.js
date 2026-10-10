const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const TARGET_GLOBAL_FOODS = Number(process.env.FOOD_IMPORT_TARGET || 5000);
const OFF_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";

// Termos de busca da culinária brasileira, marcas e suplementos
const BRAZILIAN_KEYWORDS = [
  // Grãos e Cereais
  "arroz", "feijao", "lentilha", "grao de bico", "milho", "aveia", "quinoa", "chia", "linhaca",
  "farinha de trigo", "farinha de mandioca", "tapioca", "polvilho", "fuba", "cuscuz", "macarrao",
  
  // Pães e Torradas
  "pao frances", "pao integral", "pao de forma", "torrada", "biscoito integral", "bolacha",
  
  // Carnes, Aves e Peixes
  "frango", "peito de frango", "carne bovina", "patinho", "alcatra", "contrafile", "maminha",
  "acem", "carne moida", "lombo suino", "costelinha", "peixe", "tilapia", "salmao", "atum",
  "sardinha", "camarao", "ovo", "clara de ovo",
  
  // Laticínios e Derivados
  "leite desnatado", "leite integral", "leite semi", "iogurte natural", "iogurte grego",
  "queijo minas", "queijo cotagge", "queijo ricota", "queijo mucarela", "queijo prato", "parmesao",
  "requeijao", "coalhada",
  
  // Frutas Brasileiras
  "banana", "maca", "mamao", "abacate", "abacaxi", "manga", "laranja", "limao", "melancia",
  "melao", "morango", "uva", "maracuja", "goiaba", "acerola", "acai", "pera", "kiwi",
  
  // Verduras e Legumes
  "alface", "rucula", "espinafre", "couve", "brocolis", "couve flor", "tomate", "cenoura",
  "beterraba", "abobrinha", "berinjela", "chuchu", "pepino", "pimentao", "vagem", "mandioca",
  "batata doce", "batata inglesa", "inhame", "mandioquinha",
  
  // Gorduras e Oleaginosas
  "azeite de oliva", "oleo de soja", "manteiga", "pasta de amendoim", "castanha de caju",
  "castanha do para", "nozes", "amendoas",
  
  // Suplementos e Nutrição Esportiva
  "whey protein", "creatina", "albumina", "caseina", "barra de proteina", "bcaa",
  "glutamina", "maltodextrina", "palatinose", "isotonico", "suplemento hipercalorico",
  
  // Marcas Brasileiras Famosas
  "nestle", "danone", "itambe", "piracanjuba", "tirolez", "sadia", "perdigao", "seara",
  "wickbold", "plus vita", "bauducco", "growth", "max titanium", "integralmedica"
];

async function main() {
  console.log(`[1/3] Verificando total atual no Neon PostgreSQL...`);
  const initialCount = await prisma.food.count({
    where: { organizationId: null }
  });
  console.log(`Total atual de alimentos públicos no Neon: ${initialCount}`);

  if (initialCount >= TARGET_GLOBAL_FOODS) {
    console.log(`Meta de ${TARGET_GLOBAL_FOODS} alimentos já alcançada!`);
    return;
  }

  const existingRecords = await prisma.food.findMany({
    where: { organizationId: null },
    select: { id: true, name: true }
  });
  const seenIds = new Set(existingRecords.map((r) => r.id));
  const seenNames = new Set(existingRecords.map((r) => normalize(r.name)));

  let currentTotal = initialCount;
  let batch = [];

  console.log(`[2/3] Buscando por categorias e termos-chave brasileiros...`);

  for (const keyword of BRAZILIAN_KEYWORDS) {
    if (currentTotal >= TARGET_GLOBAL_FOODS) break;

    console.log(`\n--- Buscando termo: "${keyword}" (Total atual: ${currentTotal}/${TARGET_GLOBAL_FOODS}) ---`);

    for (let page = 1; page <= 5; page++) {
      if (currentTotal >= TARGET_GLOBAL_FOODS) break;

      const params = new URLSearchParams({
        search_terms: keyword,
        tagtype_0: "countries",
        tag_contains_0: "contains",
        tag_0: "Brazil",
        search_simple: "1",
        action: "process",
        fields: "code,product_name,brands,nutriments,categories",
        json: "1",
        page_size: "50",
        page: String(page)
      });

      try {
        const response = await fetchWithRetry(`${OFF_SEARCH_URL}?${params}`, {
          headers: {
            "User-Agent": "NutriPlan-ClinOS/1.0 (contato@clinos.tec.br)"
          }
        });

        const data = await response.json();
        const products = Array.isArray(data.products) ? data.products : [];

        if (products.length === 0) break;

        for (const product of products) {
          if (currentTotal >= TARGET_GLOBAL_FOODS) break;

          const code = String(product.code || "").trim();
          const rawName = cleanName(product.product_name || "");
          const brand = cleanName(product.brands || "");
          const name = brand && !rawName.toLowerCase().includes(brand.toLowerCase()) ? `${rawName} [${brand}]` : rawName;
          const nutriments = product.nutriments || {};

          if (!code || !rawName || rawName.length < 3) continue;

          const foodId = `off-${code}`;
          const normName = normalize(name);

          if (seenIds.has(foodId) || seenNames.has(normName)) continue;

          const category = normalizeCategory(firstCategory(product.categories), name);
          const calories = parseNumber(nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"]);
          const protein = parseNumber(nutriments.proteins_100g ?? nutriments.proteins);
          const carbs = parseNumber(nutriments.carbohydrates_100g ?? nutriments.carbohydrates);
          const fat = parseNumber(nutriments.fat_100g ?? nutriments.fat);
          const fiber = parseNullableNumber(nutriments.fiber_100g ?? nutriments.fiber);

          // Validação nutricional para banco de dados clínico
          if (calories <= 0 || calories > 950 || protein < 0 || carbs < 0 || fat < 0) {
            continue;
          }

          const food = {
            id: foodId,
            organizationId: null,
            name: name.slice(0, 180),
            portion: "100 g",
            householdMeasure: inferHouseholdMeasure(name, category),
            calories,
            protein,
            carbs,
            fat,
            fiber,
            category,
            source: brand ? `Open Food Facts Brasil (${brand})` : "Open Food Facts Brasil"
          };

          seenIds.add(foodId);
          seenNames.add(normName);
          batch.push(food);
          currentTotal++;
        }

        if (batch.length >= 50) {
          const toInsert = batch.splice(0, batch.length);
          const result = await prisma.food.createMany({
            data: toInsert,
            skipDuplicates: true
          });
          console.log(`[Neon DB] +${result.count} alimentos inseridos! Total no banco: ${currentTotal}`);
        }

        await sleep(350);
      } catch (err) {
        console.error(`Aviso no termo "${keyword}" pág ${page}: ${err.message}`);
        await sleep(1500);
      }
    }
  }

  if (batch.length > 0) {
    const result = await prisma.food.createMany({
      data: batch,
      skipDuplicates: true
    });
    console.log(`[Finalização] +${result.count} alimentos inseridos.`);
  }

  const finalCount = await prisma.food.count({
    where: { organizationId: null }
  });
  console.log(`\n=============================================`);
  console.log(`[3/3] SUCESSO! TOTAL FINAL DE ALIMENTOS NO NEON: ${finalCount}`);
  console.log(`=============================================\n`);
}

function inferHouseholdMeasure(name, category) {
  const norm = normalize(`${name} ${category || ""}`);
  if (norm.includes("feijao")) return "1 concha média cheia (100 g)";
  if (norm.includes("arroz") || norm.includes("lentilha") || norm.includes("grao")) return "4 colheres de sopa cheias (100 g)";
  if (norm.includes("aveia") || norm.includes("farelo") || norm.includes("granola") || norm.includes("farinha")) return "5 colheres de sopa cheias (100 g) | 1 col. sopa ≈ 20 g";
  if (norm.includes("pao frances")) return "2 unidades médias (100 g) | 1 unidade ≈ 50 g";
  if (norm.includes("pao de forma") || norm.includes("torrada")) return "4 fatias médias (100 g) | 1 fatia ≈ 25 g";
  if (norm.includes("pao")) return "2 fatias ou 1 unidade (100 g)";
  if (norm.includes("frango") || norm.includes("bife") || norm.includes("patinho") || norm.includes("alcatra") || norm.includes("file") || norm.includes("peixe") || norm.includes("tilapia") || norm.includes("salmao") || norm.includes("carne")) return "1 filé / bife médio (100 g)";
  if (norm.includes("ovo")) return "2 unidades médias (100 g) | 1 ovo ≈ 50 g";
  if (norm.includes("queijo") || norm.includes("mucarela") || norm.includes("minas") || norm.includes("parmesao")) return "3 fatias médias (100 g) | 1 fatia ≈ 30 g";
  if (norm.includes("leite") || norm.includes("iogurte") || norm.includes("suco") || norm.includes("bebida")) return "1/2 copo americano (100 ml) | 1 copo = 200 ml";
  if (norm.includes("fruta") || norm.includes("banana") || norm.includes("maca") || norm.includes("laranja") || norm.includes("mamao")) return "1 unidade / porção média (100 g)";
  if (norm.includes("azeite") || norm.includes("oleo") || norm.includes("manteiga")) return "10 colheres de sopa (100 g) | 1 col. sopa ≈ 10 g";
  if (norm.includes("whey") || norm.includes("creatina") || norm.includes("proteina") || norm.includes("suplemento")) return "3 scoops dosadores (100 g) | 1 scoop ≈ 30 g";
  if (norm.includes("biscoito") || norm.includes("bolacha")) return "6 unidades médias (100 g)";
  return "4 colheres de sopa / 1 porção padrão (100 g)";
}

function normalizeCategory(rawCategory, name) {
  const norm = normalize(`${rawCategory || ""} ${name || ""}`);
  if (norm.includes("suplemento") || norm.includes("whey") || norm.includes("creatina") || norm.includes("bcaa") || norm.includes("maltodextrina")) return "Suplementos e Nutrição Esportiva";
  if (norm.includes("enteral") || norm.includes("hospitalar") || norm.includes("disfagia") || norm.includes("espessante")) return "Nutrição Clínica e Enteral (Multiprofissional)";
  if (norm.includes("cereal") || norm.includes("cereais") || norm.includes("pao") || norm.includes("arroz") || norm.includes("batata") || norm.includes("mandioca") || norm.includes("macarrao") || norm.includes("aveia")) return "Cereais, Pães e Tubérculos";
  if (norm.includes("carne") || norm.includes("ave") || norm.includes("frango") || norm.includes("bovin") || norm.includes("suin") || norm.includes("peixe") || norm.includes("pescado") || norm.includes("ovo")) return "Carnes, Aves, Peixes e Ovos";
  if (norm.includes("leguminosa") || norm.includes("feijao") || norm.includes("lentilha") || norm.includes("grao") || norm.includes("castanha") || norm.includes("nozes") || norm.includes("amendoim")) return "Feijões, Leguminosas e Oleaginosas";
  if (norm.includes("fruta") || norm.includes("banana") || norm.includes("maca") || norm.includes("laranja") || norm.includes("mamao") || norm.includes("abacaxi") || norm.includes("morango")) return "Frutas e Sucos Naturais";
  if (norm.includes("verdura") || norm.includes("hortalica") || norm.includes("legume") || norm.includes("brocolis") || norm.includes("alface") || norm.includes("tomate") || norm.includes("cenoura")) return "Verduras, Hortaliças e Legumes";
  if (norm.includes("leite") || norm.includes("laticinio") || norm.includes("queijo") || norm.includes("iogurte") || norm.includes("requeijao")) return "Laticínios, Queijos e Bebidas Vegetais";
  if (norm.includes("oleo") || norm.includes("gordura") || norm.includes("azeite") || norm.includes("manteiga")) return "Óleos, Gorduras e Sementes";
  if (norm.includes("doce") || norm.includes("acucar") || norm.includes("chocolate") || norm.includes("mel") || norm.includes("bala") || norm.includes("sobremesa")) return "Doces, Açúcares e Condimentos";
  return "Cereais, Pães e Tubérculos";
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

function parseNumber(value) {
  const number = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(number) ? number : 0;
}

function parseNullableNumber(value) {
  const number = parseNumber(value);
  return Number.isFinite(number) ? number : null;
}

async function fetchWithRetry(url, init, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
      if (![429, 500, 502, 503, 504].includes(response.status)) throw lastError;
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

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
