import { Suspense } from "react";
import type { Metadata } from "next";
import MealDbRecipeClient from "./MealDbRecipeClient";

export const metadata: Metadata = {
  title: "レシピ詳細（TheMealDB） | 代用レシピ",
};

/**
 * TheMealDB レシピ用の静的ページ。
 * 実データはクライアント側で ?id= を読んで取得する（useSearchParams のため Suspense で包む）。
 */
export default function MealDbRecipePage() {
  return (
    <Suspense
      fallback={
        <p className="pt-10 text-center text-sm text-stone-500">レシピを読み込み中…</p>
      }
    >
      <MealDbRecipeClient />
    </Suspense>
  );
}
