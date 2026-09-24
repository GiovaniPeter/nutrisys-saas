import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { error, json, validationError } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import {
  CURATED_BRAZILIAN_FOODS,
  inferHouseholdMeasure,
  normalizeCategoryName,
  normalizeTextForSearch
} from "@/lib/brazilian-foods-seed";

const foodSchema = z.object({
  name: z.string().min(2, "Informe o nome do alimento."),
  portion: z.string().min(1, "Informe a porção."),
  householdMeasure: z.string().optional(),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
  fiber: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
  source: z.string().optional()
});

const bulkSeedSchema = z.object({
  action: z.enum(["seed_curated", "bulk_import"]),
  foods: z.array(foodSchema).optional()
});

let autoSeedStarted = false;

async function syncCuratedFoodsToSupabaseInBackground() {
  if (autoSeedStarted) return;
  autoSeedStarted = true;

  try {
    for (const item of CURATED_BRAZILIAN_FOODS) {
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

    const missingMeasureFoods = await prisma.food.findMany({
      where: {
        organizationId: null,
        OR: [{ householdMeasure: null }, { householdMeasure: "" }]
      },
      select: { id: true, name: true, category: true },
      take: 600
    });

    for (const item of missingMeasureFoods) {
      await prisma.food.update({
        where: { id: item.id },
        data: {
          householdMeasure: inferHouseholdMeasure(item.name, item.category),
          category: normalizeCategoryName(item.category, item.name)
        }
      });
    }
  } catch {
    autoSeedStarted = false;
  }
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  const search = request.nextUrl.searchParams.get("q")?.trim() || "";
  const category = request.nextUrl.searchParams.get("category")?.trim() || "";
  const origin = request.nextUrl.searchParams.get("origin")?.trim() || "all";
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") || 300), 1500);

  let dbFoods: Array<{
    id: string;
    organizationId: string | null;
    name: string;
    portion: string;
    householdMeasure: string | null;
    calories: unknown;
    protein: unknown;
    carbs: unknown;
    fat: unknown;
    fiber: unknown;
    category: string | null;
    source: string | null;
  }> = [];

  try {
    dbFoods = await prisma.food.findMany({
      where: {
        OR: [{ organizationId: null }, { organizationId: user.organizationId }]
      },
      orderBy: [{ name: "asc" }],
      take: 2500
    });

    const hasCuratedInDb = dbFoods.some((item) => String(item.id).startsWith("curated-"));
    const hasNullMeasureInDb = dbFoods.some((item) => !item.householdMeasure);
    if (!hasCuratedInDb || hasNullMeasureInDb) {
      void syncCuratedFoodsToSupabaseInBackground();
    }
  } catch {
    // Fallback para base curada em memória caso o banco esteja temporariamente indisponível
    dbFoods = [];
  }

  // Merge curated foods that aren't in the DB yet so the professional always has the full clinical catalog
  const existingIds = new Set(dbFoods.map((item) => item.id));
  const existingNames = new Set(dbFoods.map((item) => normalizeTextForSearch(item.name)));

  const mergedRaw = [
    ...dbFoods.map((food) => ({
      ...food,
      householdMeasure: food.householdMeasure || inferHouseholdMeasure(food.name, food.category),
      category: food.category ? normalizeCategoryName(food.category, food.name) : normalizeCategoryName(null, food.name),
      source: food.source || (food.organizationId ? "Personalizado (Clínica)" : "TACO / Base Oficial")
    })),
    ...CURATED_BRAZILIAN_FOODS.filter(
      (seed) => !existingIds.has(seed.id) && !existingNames.has(normalizeTextForSearch(seed.name))
    )
  ];

  // Filter by origin
  let filtered = mergedRaw.filter((food) => {
    if (origin === "custom") return Boolean(food.organizationId);
    if (origin === "curated") return String(food.source || "").toLowerCase().includes("curadoria") || String(food.id).startsWith("curated-");
    if (origin === "supplements") {
      const cat = normalizeTextForSearch(food.category || "");
      return cat.includes("suplemento") || cat.includes("clinica") || cat.includes("enteral");
    }
    if (origin === "taco") {
      return String(food.source || "").toLowerCase().includes("taco");
    }
    return true;
  });

  // Filter by category
  if (category) {
    const targetCategory = normalizeTextForSearch(category);
    filtered = filtered.filter((food) => normalizeTextForSearch(food.category || "") === targetCategory);
  }

  // Accent-insensitive search + intelligent ranking
  if (search) {
    const normalizedQuery = normalizeTextForSearch(search);
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    filtered = filtered
      .map((food) => {
        const normName = normalizeTextForSearch(food.name);
        const normCategory = normalizeTextForSearch(food.category || "");
        const normMeasure = normalizeTextForSearch(food.householdMeasure || "");
        const haystack = `${normName} ${normCategory} ${normMeasure}`;

        const matchesAllTokens = queryTokens.every((token) => haystack.includes(token));
        if (!matchesAllTokens) {
          return null;
        }

        let score = 0;
        if (food.organizationId) score += 30; // Prioriza itens personalizados da clínica
        if (String(food.id).startsWith("curated-")) score += 20; // Prioriza itens curados com medidas caseiras exatas
        if (normName === normalizedQuery) score += 100;
        else if (normName.startsWith(normalizedQuery)) score += 60;
        else if (normName.includes(normalizedQuery)) score += 35;

        return { food, score };
      })
      .filter((entry): entry is { food: (typeof mergedRaw)[number]; score: number } => Boolean(entry))
      .sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name, "pt-BR"))
      .map((entry) => entry.food);
  } else {
    // Default sorting: Clinic custom first, then curated clinical foods, then TACO/others alphabetically
    filtered.sort((a, b) => {
      const aCustom = a.organizationId ? 1 : 0;
      const bCustom = b.organizationId ? 1 : 0;
      if (aCustom !== bCustom) return bCustom - aCustom;

      const aCurated = String(a.id).startsWith("curated-") ? 1 : 0;
      const bCurated = String(b.id).startsWith("curated-") ? 1 : 0;
      if (aCurated !== bCurated) return bCurated - aCurated;

      return a.name.localeCompare(b.name, "pt-BR");
    });
  }

  const total = filtered.length;
  const foods = filtered.slice(0, limit);

  return json({ foods, total });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return error("Não autenticado.", 401);
  }

  try {
    const rawBody = await request.json();

    // Check if it is a bulk seed or CSV import action
    if (rawBody && typeof rawBody === "object" && "action" in rawBody) {
      const parsedAction = bulkSeedSchema.parse(rawBody);

      if (parsedAction.action === "seed_curated") {
        let seededCount = 0;

        for (const item of CURATED_BRAZILIAN_FOODS) {
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
          seededCount += 1;
        }

        // Also enrich existing global foods that lack householdMeasure
        const missingMeasureFoods = await prisma.food.findMany({
          where: {
            organizationId: null,
            OR: [{ householdMeasure: null }, { householdMeasure: "" }]
          },
          select: { id: true, name: true, category: true }
        });

        for (const item of missingMeasureFoods) {
          await prisma.food.update({
            where: { id: item.id },
            data: {
              householdMeasure: inferHouseholdMeasure(item.name, item.category),
              category: normalizeCategoryName(item.category, item.name)
            }
          });
        }

        await audit({
          organizationId: user.organizationId,
          userId: user.id,
          action: "food.seed_curated",
          entity: "Food"
        });

        return json({
          seededCount,
          enrichedCount: missingMeasureFoods.length
        });
      }

      if (parsedAction.action === "bulk_import" && parsedAction.foods?.length) {
        const created = await prisma.$transaction(
          parsedAction.foods.slice(0, 500).map((input) =>
            prisma.food.create({
              data: {
                organizationId: user.organizationId,
                name: input.name,
                portion: input.portion,
                householdMeasure: input.householdMeasure || inferHouseholdMeasure(input.name, input.category),
                calories: input.calories,
                protein: input.protein,
                carbs: input.carbs,
                fat: input.fat,
                fiber: input.fiber ?? 0,
                category: normalizeCategoryName(input.category, input.name),
                source: input.source || "Importação Clínica"
              }
            })
          )
        );

        await audit({
          organizationId: user.organizationId,
          userId: user.id,
          action: "food.bulk_imported",
          entity: "Food"
        });

        return json({ importedCount: created.length }, { status: 201 });
      }
    }

    const input = foodSchema.parse(rawBody);
    const food = await prisma.food.create({
      data: {
        organizationId: user.organizationId,
        name: input.name,
        portion: input.portion,
        householdMeasure: input.householdMeasure || inferHouseholdMeasure(input.name, input.category),
        calories: input.calories,
        protein: input.protein,
        carbs: input.carbs,
        fat: input.fat,
        fiber: input.fiber,
        category: input.category || normalizeCategoryName(null, input.name),
        source: input.source || "Personalizado (Clínica)"
      }
    });

    await audit({
      organizationId: user.organizationId,
      userId: user.id,
      action: "food.created",
      entity: "Food",
      entityId: food.id
    });

    return json({ food }, { status: 201 });
  } catch (err) {
    return validationError(err);
  }
}
