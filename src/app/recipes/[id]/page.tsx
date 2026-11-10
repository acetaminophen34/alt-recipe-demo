import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRecipeById } from "@/lib/providers";
import { localRecipes } from "@/lib/data/recipes";
import RecipeDetail from "@/components/RecipeDetail";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * 静的エクスポート: 同梱レシピの ID だけをビルド時に静的生成する。
 * TheMealDB のレシピは任意の ID を取るため、この動的ルートではなく
 * /recipes/mealdb?id=... のクライアント取得ページで扱う。
 */
export function generateStaticParams() {
  return localRecipes.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipeById(decodeURIComponent(id));
  return {
    title: recipe ? `${recipe.title} | 代用レシピ` : "レシピが見つかりません | 代用レシピ",
  };
}

export default async function RecipePage({ params }: Props) {
  const { id } = await params;
  const recipe = await getRecipeById(decodeURIComponent(id));
  if (!recipe) notFound();
  return <RecipeDetail recipe={recipe} />;
}
