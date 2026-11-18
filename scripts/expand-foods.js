const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const ts = require("typescript");
const { PrismaClient } = require("@prisma/client");
const { loadEnv } = require("./load-env");

loadEnv();

const prisma = new PrismaClient();
const TARGET_GLOBAL_FOODS = Number(process.env.FOOD_IMPORT_TARGET || 10500);
const OFF_V2_SEARCH_URL = "https://br.openfoodfacts.org/api/v2/search";
const IBGE_SQL_URL = "https://raw.githubusercontent.com/renandspedrosa/tabela-alimentos-ibge-api/master/database/seeders/scripts/ibge.sql";
const INSA_XLSX_URL = "https://portfir.insa.min-saude.pt/wp-content/uploads/2025/11/insa_tca.xlsx";

const OFF_CATEGORIES = [
  "en:groceries",
  "en:breakfast-cereals",
  "en:cookies",
  "en:cakes",
  "en:crackers",
  "en:chips-and-fries",
  "en:sodas",
  "en:candies",
  "en:plant-milks",
  "en:dairy-substitutes",
  "en:poultry",
  "en:beef",
  "en:pork",
  "en:fishes",
  "en:rice",
  "en:jams",
  "en:vegetable-oils",
  "en:tomato-sauces",
  "en:canned-vegetables",
  "en:protein-bars",
  "en:beers",
  "en:wines",
  "en:dairies",
  "en:snacks",
  "en:cereals-and-potatoes",
  "en:beverages",
  "en:sweet-snacks",
  "en:plant-based-foods-and-beverages",
  "en:meats",
  "en:breads",
  "en:cheeses",
  "en:yogurts",
  "en:biscuits-and-cakes",
  "en:chocolates",
  "en:condiments",
  "en:sauces",
  "en:meals",
  "en:fats",
  "en:seafood",
  "en:fruits-and-vegetables-based-foods",
  "en:desserts",
  "en:frozen-foods",
  "en:canned-foods",
  "en:breakfasts",
  "en:pasta",
  "en:flours",
  "en:nuts-and-their-products",
  "en:fruit-juices",
  "en:dietary-supplements",
  "en:spreads",
  "en:salty-snacks",
  "en:legumes-and-their-products",
  "en:ice-creams-and-sorbets",
  "en:coffees",
  "en:teas",
  "en:eggs",
  "en:baby-foods"
];

function loadCuratedFoods() {
  const seedPath = path.join(process.cwd(), "src", "lib", "brazilian-foods-seed.ts");
  const source = fs.readFileSync(seedPath, "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const mod = { exports: {} };
  const fn = new Function("exports", "module", js);
  fn(mod.exports, mod);
  return Array.isArray(mod.exports.CURATED_BRAZILIAN_FOODS) ? mod.exports.CURATED_BRAZILIAN_FOODS : [];
}

function isAlcoholicName(name) {
  return /cerveja|vinho|vodka|whisky|uisque|cachaca|aguardente|gin\b|rum\b|licor|champagne|espumante|sake|tequila|conhaque|sidra|catuaba|chopp/i.test(
    normalize(name)
  );
}

function isValidProductName(name) {
  const cleaned = cleanName(name);
  if (cleaned.length < 4) return false;
  if (cleaned.includes("\uFFFD")) return false;
  if (/^[\d\s\-./,+%]+$/.test(cleaned)) return false;
  return true;
}

function isValidOffNutrition({ name, calories, protein, carbs, fat, fiber }) {
  if (!isValidProductName(name)) return false;
  if (!Number.isFinite(calories) || calories <= 0 || calories > 920) return false;
  if (!Number.isFinite(protein) || protein < 0 || protein > 100) return false;
  if (!Number.isFinite(carbs) || carbs < 0 || carbs > 100) return false;
  if (!Number.isFinite(fat) || fat < 0 || fat > 100) return false;
  if (protein + carbs + fat > 103) return false;
  if (fiber !== null && (!Number.isFinite(fiber) || fiber < 0 || fiber > 100)) return false;

  if (calories >= 40 && !isAlcoholicName(name)) {
    if (protein === 0 && carbs === 0 && fat === 0) return false;
    const fib = fiber ?? 0;
    const atwaterGross = protein * 4 + carbs * 4 + fat * 9;
    const atwaterNet = protein * 4 + Math.max(0, carbs - fib) * 4 + fib * 2 + fat * 9;
    const diff = Math.min(Math.abs(calories - atwaterGross), Math.abs(calories - atwaterNet));
    if (diff > Math.max(35, calories * 0.28)) return false;
  }

  return true;
}

async function auditAndCleanExistingOffFoods() {
  console.log("[1/5] Auditando registros Open Food Facts existentes no banco...");
  const existingOff = await prisma.food.findMany({
    where: {
      organizationId: null,
      id: { startsWith: "off-" }
    },
    select: {
      id: true,
      name: true,
      calories: true,
      protein: true,
      carbs: true,
      fat: true,
      fiber: true
    }
  });

  const badIds = [];
  for (const item of existingOff) {
    const valid = isValidOffNutrition({
      name: item.name,
      calories: Number(item.calories),
      protein: Number(item.protein),
      carbs: Number(item.carbs),
      fat: Number(item.fat),
      fiber: item.fiber === null ? null : Number(item.fiber)
    });
    if (!valid) badIds.push(item.id);
  }

  if (badIds.length > 0) {
    const del = await prisma.food.deleteMany({
      where: { id: { in: badIds } }
    });
    console.log(`[Auditoria] Removidos ${del.count} registros inconsistentes do Open Food Facts.`);
  } else {
    console.log("[Auditoria] Nenhum registro inconsistente encontrado.");
  }
}

async function syncCuratedFoods() {
  const curated = loadCuratedFoods();
  console.log(`[2/5] Sincronizando ${curated.length} alimentos de curadoria clínica...`);
  for (const item of curated) {
    await prisma.food.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        portion: item.portion,
        householdMeasure: item.householdMeasure,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        category: item.category,
        source: item.source
      },
      create: item
    });
  }
}

async function fetchIbgeFoods(seenIds, seenNames) {
  console.log("[3/5] Baixando e validando tabela oficial IBGE / POF...");
  const response = await fetchWithRetry(IBGE_SQL_URL, {
    headers: { "User-Agent": "NutriPlan-ClinOS/1.0 (contato@clinos.tec.br)" }
  });
  const text = await response.text();
  const rowRegex =
    /\((\d+),\s*'((?:[^'\\]|\\'|'')*)',\s*'((?:[^'\\]|\\'|'')*)',\s*(NULL|\d+),\s*'((?:[^'\\]|\\'|'')*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'/g;

  const groupedByCode = new Map();
  let match;
  while ((match = rowRegex.exec(text)) !== null) {
    const [, code, rawDesc, rawCat, rawPrepCode, rawPrepName, kcalS, protS, fatS, carbS, fiberS] = match;
    const desc = cleanName(rawDesc.replace(/''/g, "'").replace(/\\'/g, "'"));
    const catRaw = cleanName(rawCat.replace(/''/g, "'").replace(/\\'/g, "'"));
    const prepCode = rawPrepCode === "NULL" ? "99" : rawPrepCode;
    const prepName = cleanName(rawPrepName.replace(/''/g, "'").replace(/\\'/g, "'"));

    const calories = parseNumber(kcalS === "-" ? "0" : kcalS);
    const protein = parseNumber(protS === "-" ? "0" : protS);
    const fat = parseNumber(fatS === "-" ? "0" : fatS);
    const carbs = parseNumber(carbS === "-" ? "0" : carbS);
    const fiber = fiberS === "-" ? 0 : parseNumber(fiberS);

    if (!desc || calories < 0 || protein < 0 || carbs < 0 || fat < 0 || protein + carbs + fat > 103) {
      continue;
    }

    const sig = `${calories.toFixed(2)}|${protein.toFixed(2)}|${carbs.toFixed(2)}|${fat.toFixed(2)}`;
    if (!groupedByCode.has(code)) groupedByCode.set(code, new Map());
    const bySig = groupedByCode.get(code);

    const existing = bySig.get(sig);
    // Prefer "Não se aplica", "Cru(a)" or "Cozido(a)" when multiple preparations share identical macros
    const rankPrep = (p) => (p === "Não se aplica" ? 0 : p.startsWith("Cru") ? 1 : p.startsWith("Cozido") ? 2 : 3);
    if (!existing || rankPrep(prepName) < rankPrep(existing.prepName)) {
      bySig.set(sig, { code, desc, catRaw, prepCode, prepName, calories, protein, carbs, fat, fiber });
    }
  }

  const toInsert = [];
  for (const [, bySig] of groupedByCode) {
    const multi = bySig.size > 1;
    for (const entry of bySig.values()) {
      const displayName =
        entry.prepName && entry.prepName !== "Não se aplica" && (multi || !entry.desc.toLowerCase().includes(entry.prepName.toLowerCase()))
          ? `${entry.desc} — ${entry.prepName}`
          : entry.desc;

      const id = `ibge-${entry.code}-${entry.prepCode}`;
      const normName = normalize(displayName);
      if (seenIds.has(id) || seenNames.has(normName)) continue;

      const category = normalizeCategory(entry.catRaw, displayName);
      seenIds.add(id);
      seenNames.add(normName);
      toInsert.push({
        id,
        organizationId: null,
        name: displayName.slice(0, 180),
        portion: "100 g",
        householdMeasure: inferHouseholdMeasure(displayName, category),
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        fiber: entry.fiber,
        category,
        source: "IBGE / POF (Tabela Oficial)"
      });
    }
  }

  if (toInsert.length > 0) {
    for (let i = 0; i < toInsert.length; i += 200) {
      await prisma.food.createMany({ data: toInsert.slice(i, i + 200), skipDuplicates: true });
    }
  }
  console.log(`[IBGE / POF] +${toInsert.length} alimentos oficiais importados.`);
  return toInsert.length;
}

function parseInsaWithPython() {
  const pyScript = `
import json, urllib.request, zipfile, io, xml.etree.ElementTree as ET
url = ${JSON.stringify(INSA_XLSX_URL)}
data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'NutriPlan-ClinOS/1.0'}), timeout=30).read()
z = zipfile.ZipFile(io.BytesIO(data))
ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
sst = []
for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si', ns):
    sst.append(''.join(t.text or '' for t in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')))
def col_idx(ref):
    col = ''.join(ch for ch in ref if ch.isalpha())
    n = 0
    for ch in col: n = n * 26 + (ord(ch) - ord('A') + 1)
    return n - 1
rows = ET.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//s:row', ns)
def row_vals(r):
    out = {}
    for c in r.findall('s:c', ns):
        idx = col_idx(c.attrib.get('r', 'A1'))
        t = c.attrib.get('t')
        v = c.find('s:v', ns)
        val = v.text if v is not None else ''
        if t == 's' and val != '': val = sst[int(val)]
        out[idx] = val
    return out
hdr = row_vals(rows[1])
def find_col(prefix):
    for k, v in hdr.items():
        if v.strip().lower().startswith(prefix): return k
c_cod, c_name, c_cat = find_col('cod'), find_col('nome do alimento'), find_col('nível 1')
c_kcal, c_fat, c_carb, c_fib, c_prot = find_col('energia\\n[kcal]'), find_col('lípidos'), find_col('hidratos de carbono'), find_col('fibra'), find_col('proteínas')
def num(v):
    if v is None or v == '' or str(v).strip().lower() in ('-', 'vest', 'vest.', 'nd', 'na'): return 0.0
    return round(float(str(v).replace(',', '.')), 2)
items = []
for r in rows[2:]:
    rv = row_vals(r)
    cod, name = str(rv.get(c_cod, '')).strip(), str(rv.get(c_name, '')).strip()
    if not cod or not name: continue
    items.append({
        'cod': cod,
        'name': name,
        'cat': str(rv.get(c_cat, '')).strip(),
        'calories': num(rv.get(c_kcal)),
        'fat': num(rv.get(c_fat)),
        'carbs': num(rv.get(c_carb)),
        'fiber': num(rv.get(c_fib)),
        'protein': num(rv.get(c_prot)),
    })
print(json.dumps(items, ensure_ascii=False))
`;
  const stdout = execFileSync("python", ["-c", pyScript], { maxBuffer: 20 * 1024 * 1024, encoding: "utf8" });
  return JSON.parse(stdout);
}

async function fetchInsaFoods(seenIds, seenNames) {
  console.log("[4/5] Baixando e validando INSA - BDCA v7.1 (2026)...");
  const rows = parseInsaWithPython();
  const toInsert = [];

  for (const row of rows) {
    const id = `insa-${row.cod}`;
    const name = cleanName(row.name);
    const normName = normalize(name);
    if (!name || seenIds.has(id) || seenNames.has(normName)) continue;

    if (
      row.calories < 0 ||
      row.protein < 0 ||
      row.carbs < 0 ||
      row.fat < 0 ||
      row.protein + row.carbs + row.fat > 103
    ) {
      continue;
    }

    const category = normalizeCategory(row.cat, name);
    seenIds.add(id);
    seenNames.add(normName);
    toInsert.push({
      id,
      organizationId: null,
      name: name.slice(0, 180),
      portion: "100 g",
      householdMeasure: inferHouseholdMeasure(name, category),
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
      fiber: row.fiber,
      category,
      source: "INSA - BDCA v7.1 (2026)"
    });
  }

  if (toInsert.length > 0) {
    for (let i = 0; i < toInsert.length; i += 200) {
      await prisma.food.createMany({ data: toInsert.slice(i, i + 200), skipDuplicates: true });
    }
  }
  console.log(`[INSA BDCA v7.1] +${toInsert.length} alimentos oficiais importados.`);
  return toInsert.length;
}

function buildFoodFromOffProduct(product, seenIds, seenNames) {
  const code = String(product.code || "").trim();
  const rawName = cleanName(product.product_name_pt || product.product_name || "");
  const brand = cleanName(product.brands || "");
  if (!code || !rawName) return null;
  if (brand && normalize(rawName) === normalize(brand)) return null;

  const name = brand && !rawName.toLowerCase().includes(brand.toLowerCase()) ? `${rawName} [${brand}]` : rawName;
  const nutriments = product.nutriments || {};
  const foodId = `off-${code}`;
  const normName = normalize(name);

  if (seenIds.has(foodId) || seenNames.has(normName)) return null;

  const calories = round2(parseNumber(nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"]));
  const protein = round2(parseNumber(nutriments.proteins_100g ?? nutriments.proteins));
  const carbs = round2(parseNumber(nutriments.carbohydrates_100g ?? nutriments.carbohydrates));
  const fat = round2(parseNumber(nutriments.fat_100g ?? nutriments.fat));
  const rawFiber = nutriments.fiber_100g ?? nutriments.fiber;
  const fiber = rawFiber === undefined || rawFiber === null || rawFiber === "" ? null : round2(parseNumber(rawFiber));

  if (!isValidOffNutrition({ name, calories, protein, carbs, fat, fiber })) {
    return null;
  }

  const category = normalizeCategory(firstCategory(product.categories), name);
  seenIds.add(foodId);
  seenNames.add(normName);

  return {
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
}

async function flushBatch(batch, state) {
  if (batch.length === 0) return;
  const toInsert = batch.splice(0, batch.length);
  const result = await prisma.food.createMany({
    data: toInsert,
    skipDuplicates: true
  });
  state.currentTotal += result.count;
  console.log(`[Neon DB] +${result.count} validados inseridos! Total no banco: ${state.currentTotal}/${TARGET_GLOBAL_FOODS}`);
}

async function expandOffByCategories(state, seenIds, seenNames) {
  console.log(`[5/5] Expandindo catálogo brasileiro validado (Open Food Facts v2 por categoria)...`);
  const batch = [];

  for (const offCat of OFF_CATEGORIES) {
    if (state.currentTotal + batch.length >= TARGET_GLOBAL_FOODS) break;

    for (let page = 1; page <= 10; page++) {
      if (state.currentTotal + batch.length >= TARGET_GLOBAL_FOODS) break;

      const params = new URLSearchParams({
        countries_tags_en: "brazil",
        languages_tags_en: "portuguese",
        states_tags_en: "nutrition-facts-completed",
        categories_tags_en: offCat,
        sort_by: "unique_scans_n",
        fields: "code,product_name,product_name_pt,brands,nutriments,categories",
        page_size: "100",
        page: String(page)
      });

      try {
        const response = await fetchWithRetry(`${OFF_V2_SEARCH_URL}?${params}`, {
          headers: { "User-Agent": "NutriPlan-ClinOS/1.0 (contato@clinos.tec.br)" }
        }, 4);

        const data = await response.json();
        const products = Array.isArray(data.products) ? data.products : [];
        if (products.length === 0) break;

        for (const product of products) {
          if (state.currentTotal + batch.length >= TARGET_GLOBAL_FOODS) break;
          const food = buildFoodFromOffProduct(product, seenIds, seenNames);
          if (food) batch.push(food);
        }

        if (batch.length >= 100) {
          await flushBatch(batch, state);
        }

        if (products.length < 100) break;
        await sleep(3000);
      } catch (err) {
        console.error(`Aviso em ${offCat} pág ${page}: ${err.message}`);
        await sleep(5000);
        if (String(err.message).includes("401")) break;
      }
    }
  }

  await flushBatch(batch, state);
}

async function main() {
  await auditAndCleanExistingOffFoods();
  await syncCuratedFoods();

  const existingRecords = await prisma.food.findMany({
    where: { organizationId: null },
    select: { id: true, name: true }
  });
  const seenIds = new Set(existingRecords.map((r) => r.id));
  const seenNames = new Set(existingRecords.map((r) => normalize(r.name)));

  await fetchIbgeFoods(seenIds, seenNames);
  await fetchInsaFoods(seenIds, seenNames);

  const countAfterOfficial = await prisma.food.count({
    where: { organizationId: null }
  });
  console.log(`Total após bases oficiais (Curadoria + TACO + IBGE + INSA + OFF limpo): ${countAfterOfficial}`);

  const state = { currentTotal: countAfterOfficial };
  if (state.currentTotal < TARGET_GLOBAL_FOODS) {
    await expandOffByCategories(state, seenIds, seenNames);
  }

  const finalCount = await prisma.food.count({
    where: { organizationId: null }
  });
  console.log(`\n=============================================`);
  console.log(`SUCESSO! TOTAL FINAL DE ALIMENTOS NO NEON: ${finalCount}`);
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
  if (norm.includes("pizza") || norm.includes("lasanha") || norm.includes("sanduiche") || norm.includes("hamburguer") || norm.includes("salgado") || norm.includes("torta") || norm.includes("prato pronto") || norm.includes("preparacoes")) return "Preparações Caseiras e Lanches";
  if (norm.includes("carne") || norm.includes("ave") || norm.includes("frango") || norm.includes("bovin") || norm.includes("suin") || norm.includes("peixe") || norm.includes("pescado") || norm.includes("marisco") || norm.includes("ovo") || norm.includes("presunto") || norm.includes("linguica")) return "Carnes, Aves, Peixes e Ovos";
  if (norm.includes("leguminosa") || norm.includes("feijao") || norm.includes("lentilha") || norm.includes("grao") || norm.includes("castanha") || norm.includes("nozes") || norm.includes("amendoim") || norm.includes("coco")) return "Feijões, Leguminosas e Oleaginosas";
  if (norm.includes("fruta") || norm.includes("fruto") || norm.includes("banana") || norm.includes("maca") || norm.includes("laranja") || norm.includes("mamao") || norm.includes("abacaxi") || norm.includes("morango") || norm.includes("suco")) return "Frutas e Sucos Naturais";
  if (norm.includes("verdura") || norm.includes("hortalica") || norm.includes("legume") || norm.includes("brocolis") || norm.includes("alface") || norm.includes("tomate") || norm.includes("cenoura") || norm.includes("abobora")) return "Verduras, Hortaliças e Legumes";
  if (norm.includes("leite") || norm.includes("laticinio") || norm.includes("queijo") || norm.includes("iogurte") || norm.includes("requeijao")) return "Laticínios, Queijos e Bebidas Vegetais";
  if (norm.includes("oleo") || norm.includes("gordura") || norm.includes("azeite") || norm.includes("manteiga") || norm.includes("margarina") || norm.includes("chia") || norm.includes("linhaca")) return "Óleos, Gorduras e Sementes";
  if (norm.includes("doce") || norm.includes("acucar") || norm.includes("chocolate") || norm.includes("mel") || norm.includes("bala") || norm.includes("sobremesa") || norm.includes("condimento") || norm.includes("molho") || norm.includes("biscoito") || norm.includes("sorvete")) return "Doces, Açúcares e Condimentos";
  if (norm.includes("cereal") || norm.includes("cereais") || norm.includes("pao") || norm.includes("paes") || norm.includes("arroz") || norm.includes("batata") || norm.includes("mandioca") || norm.includes("macarrao") || norm.includes("aveia") || norm.includes("farinha") || norm.includes("panificado")) return "Cereais, Pães e Tubérculos";
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

function round2(value) {
  return Math.round(value * 100) / 100;
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
    await sleep(2500 * attempt);
  }
  throw lastError;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
