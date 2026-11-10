import type { Recipe, RecipeItem } from "../types";
import type { RecipeProvider } from "./types";

/**
 * TheMealDB プロバイダ。
 * 無料公開API（キー不要）: https://www.themealdb.com/api/json/v1/1/
 *
 * - search.php?s=  名前検索
 * - filter.php?c=  カテゴリ別一覧（軽量データのみ → lookup で詳細化）
 * - lookup.php?i=  ID指定で詳細取得
 *
 * 取得結果はアプリの Recipe 形式に正規化する。
 * 通信に失敗した場合は例外を投げず空を返し、アプリ全体は同梱レシピで動作継続する。
 */

const BASE = "https://www.themealdb.com/api/json/v1/1";
export const MEALDB_ID_PREFIX = "mealdb-";

/** TheMealDB のカテゴリ名 → 表示用ラベル（日本語化できるものだけ） */
const CATEGORY_LABELS: Record<string, string> = {
  Beef: "牛肉料理",
  Chicken: "鶏肉料理",
  Dessert: "デザート",
  Lamb: "ラム料理",
  Miscellaneous: "その他",
  Pasta: "パスタ",
  Pork: "豚肉料理",
  Seafood: "シーフード",
  Side: "副菜",
  Starter: "前菜",
  Vegan: "ヴィーガン",
  Vegetarian: "ベジタリアン",
  Breakfast: "朝食",
  Goat: "ヤギ肉料理",
};

interface MealDbMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string | null;
  strYoutube: string | null;
  strSource: string | null;
  [key: string]: string | null;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    // 静的エクスポート版ではブラウザから直接取得する。
    // TheMealDB は Access-Control-Allow-Origin: * を返すため CORS の問題はない
    // （2026-11-10 に search.php / lookup.php の応答ヘッダで確認済み）。
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function splitSteps(instructions: string | null): string[] {
  if (!instructions) return [];
  return instructions
    .split(/\r?\n+/)
    .map((s) => s.replace(/^step\s*\d+\s*[:：.]?\s*/i, "").trim())
    .filter((s) => s.length > 0);
}

export function normalizeMeal(meal: MealDbMeal): Recipe {
  const ingredients: RecipeItem[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = (meal[`strIngredient${i}`] ?? "").trim();
    if (!name) continue;
    const measure = (meal[`strMeasure${i}`] ?? "").trim();
    ingredients.push({
      key: name,
      label: measure ? `${name} ${measure}` : name,
    });
  }

  const categoryMain = meal.strCategory ?? "その他";
  return {
    id: `${MEALDB_ID_PREFIX}${meal.idMeal}`,
    title: meal.strMeal,
    category: {
      main: CATEGORY_LABELS[categoryMain] ?? categoryMain,
      sub: meal.strArea ? `${meal.strArea}料理` : "TheMealDB",
    },
    ingredients,
    tools: [],
    steps: splitSteps(meal.strInstructions),
    image: meal.strMealThumb ?? undefined,
    sourceUrl: meal.strSource || meal.strYoutube || undefined,
    source: "mealdb",
  };
}

export const mealDbProvider: RecipeProvider = {
  id: "mealdb",
  label: "TheMealDB",

  async search(query: string): Promise<Recipe[]> {
    const q = query.trim();
    if (!q) return [];
    const data = await fetchJson<{ meals: MealDbMeal[] | null }>(
      `${BASE}/search.php?s=${encodeURIComponent(q)}`,
    );
    return (data?.meals ?? []).map(normalizeMeal);
  },

  async listByCategory(category: string): Promise<Recipe[]> {
    const data = await fetchJson<{ meals: MealDbMeal[] | null }>(
      `${BASE}/filter.php?c=${encodeURIComponent(category)}`,
    );
    const summaries = data?.meals ?? [];
    // filter.php は材料・手順を含まないため、上位だけ詳細取得して正規化する
    const detailed = await Promise.all(
      summaries.slice(0, 12).map((m) => mealDbProvider.getById(`${MEALDB_ID_PREFIX}${m.idMeal}`)),
    );
    return detailed.filter((r): r is Recipe => r !== null);
  },

  async getById(id: string): Promise<Recipe | null> {
    const rawId = id.startsWith(MEALDB_ID_PREFIX) ? id.slice(MEALDB_ID_PREFIX.length) : id;
    const data = await fetchJson<{ meals: MealDbMeal[] | null }>(
      `${BASE}/lookup.php?i=${encodeURIComponent(rawId)}`,
    );
    const meal = data?.meals?.[0];
    return meal ? normalizeMeal(meal) : null;
  },
};
