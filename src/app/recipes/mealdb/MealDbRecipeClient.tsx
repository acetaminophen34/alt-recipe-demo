"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Recipe } from "@/lib/types";
import { mealDbProvider } from "@/lib/providers/themealdb";
import RecipeDetail from "@/components/RecipeDetail";

type Status = "loading" | "ok" | "notfound" | "error";

/**
 * TheMealDB レシピの詳細ページ（クライアント取得）。
 * 静的エクスポートでは任意 ID の動的ルートを生成できないため、
 * /recipes/mealdb?id=mealdb-<idMeal> の形で ID を受け取り、
 * ブラウザから TheMealDB を直接取得して表示する。
 */
export default function MealDbRecipeClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [fetchStatus, setFetchStatus] = useState<Status>("loading");
  // id が無い場合は取得を試みるまでもなく「見つからない」として扱う
  const status: Status = id ? fetchStatus : "notfound";

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const found = await mealDbProvider.getById(id);
        if (cancelled) return;
        if (found) {
          setRecipe(found);
          setFetchStatus("ok");
        } else {
          setFetchStatus("notfound");
        }
      } catch {
        if (!cancelled) setFetchStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "ok" && recipe) {
    return <RecipeDetail recipe={recipe} />;
  }

  return (
    <div className="pt-6">
      <Link href="/" className="text-sm font-medium text-orange-700 hover:underline">
        ← レシピ一覧へ戻る
      </Link>
      <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-orange-100">
        {status === "loading" && (
          <p className="text-sm text-stone-500">TheMealDB からレシピを読み込み中…</p>
        )}
        {status === "notfound" && (
          <p className="text-sm text-stone-600">
            レシピが見つかりませんでした。リンクが正しいか確認してください。
          </p>
        )}
        {status === "error" && (
          <p className="text-sm font-medium text-red-600">
            レシピの取得に失敗しました。通信環境を確認して、ページを再読み込みしてください。
          </p>
        )}
      </div>
    </div>
  );
}
