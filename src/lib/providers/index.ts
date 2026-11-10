import type { Recipe } from "../types";
import type { RecipeProvider } from "./types";
import { localProvider } from "./local";
import { mealDbProvider, MEALDB_ID_PREFIX } from "./themealdb";

export type { RecipeProvider } from "./types";

/**
 * プロバイダのレジストリ。
 * 楽天レシピAPIなどを追加する場合は、RecipeProvider を実装してここに足す。
 */
export const providers: RecipeProvider[] = [localProvider, mealDbProvider];

/** IDの接頭辞や出所から担当プロバイダを解決して1件取得する */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  if (id.startsWith(MEALDB_ID_PREFIX)) {
    return mealDbProvider.getById(id);
  }
  return localProvider.getById(id);
}

/**
 * 全プロバイダを横断検索し、同梱レシピを先頭にマージする。
 * 外部プロバイダが落ちていても同梱分だけで結果を返せる。
 */
export async function searchAllProviders(query: string): Promise<Recipe[]> {
  const results = await Promise.all(
    providers.map(async (p) => {
      try {
        return await p.search(query);
      } catch {
        return [];
      }
    }),
  );
  const seen = new Set<string>();
  const merged: Recipe[] = [];
  for (const list of results) {
    for (const recipe of list) {
      if (seen.has(recipe.id)) continue;
      seen.add(recipe.id);
      merged.push(recipe);
    }
  }
  return merged;
}
