import { localRecipes } from "@/lib/data/recipes";
import { getLocalCategories } from "@/lib/providers/local";
import type { RecipeSummary } from "@/lib/types";
import HomeClient from "@/components/HomeClient";

export default function HomePage() {
  const summaries: RecipeSummary[] = localRecipes.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    image: r.image,
    source: r.source,
    ingredientCount: r.ingredients.length,
  }));

  return <HomeClient localRecipes={summaries} categories={getLocalCategories()} />;
}
