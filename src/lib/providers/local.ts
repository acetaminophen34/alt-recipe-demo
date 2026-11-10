import type { Recipe } from "../types";
import { localRecipes } from "../data/recipes";
import type { RecipeProvider } from "./types";

/** 同梱レシピ（オフラインでも常に使える土台） */
export const localProvider: RecipeProvider = {
  id: "local",
  label: "同梱レシピ",

  async search(query: string): Promise<Recipe[]> {
    const q = query.trim().toLowerCase();
    if (!q) return localRecipes;
    return localRecipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.main.includes(q) ||
        r.category.sub.includes(q) ||
        r.ingredients.some((i) => i.key.includes(q) || i.label.includes(q)),
    );
  },

  async listByCategory(category: string): Promise<Recipe[]> {
    return localRecipes.filter((r) => r.category.main === category);
  },

  async getById(id: string): Promise<Recipe | null> {
    return localRecipes.find((r) => r.id === id) ?? null;
  },
};

export function getLocalCategories(): string[] {
  return Array.from(new Set(localRecipes.map((r) => r.category.main)));
}
