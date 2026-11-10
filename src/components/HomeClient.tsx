"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Recipe, RecipeSummary } from "@/lib/types";
import { mealDbProvider } from "@/lib/providers/themealdb";
import RecipeCard from "./RecipeCard";

function toSummary(r: Recipe): RecipeSummary {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    image: r.image,
    source: r.source,
    ingredientCount: r.ingredients.length,
  };
}

interface Props {
  localRecipes: RecipeSummary[];
  categories: string[];
}

export default function HomeClient({ localRecipes, categories }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("すべて");
  const [remoteResults, setRemoteResults] = useState<RecipeSummary[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredLocal = useMemo(() => {
    const q = query.trim().toLowerCase();
    return localRecipes.filter((r) => {
      if (activeCategory !== "すべて" && r.category.main !== activeCategory) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.category.main.includes(q) ||
        r.category.sub.includes(q)
      );
    });
  }, [localRecipes, query, activeCategory]);

  // TheMealDB は英語名検索が中心。2文字以上で少し待ってから検索する。
  // 状態の更新はすべて非同期コールバック内でのみ行う。
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) return;
    debounceRef.current = setTimeout(async () => {
      setRemoteLoading(true);
      try {
        // 静的エクスポート版: ブラウザから TheMealDB を直接検索する（CORS 許可済み）
        const recipes = await mealDbProvider.search(q);
        setRemoteResults(recipes.map(toSummary));
      } catch {
        setRemoteResults([]);
      } finally {
        setSearchedQuery(q);
        setRemoteLoading(false);
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const trimmedQuery = query.trim();
  const showRemoteSection =
    trimmedQuery.length >= 2 && (remoteLoading || searchedQuery === trimmedQuery);

  return (
    <div>
      {/* ヒーロー */}
      <section className="pb-8 pt-10 text-center sm:pt-14">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-stone-800 sm:text-4xl">
          「あれがない」でも、
          <span className="text-orange-600">作れます。</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone-500 sm:text-base">
          レシピを選んで、持っていない材料・器具にチェックを入れるだけ。
          代わりになるものと、書き換えた手順を提案します。
        </p>
        <div className="mx-auto mt-6 max-w-lg">
          <label className="sr-only" htmlFor="search">
            レシピを検索
          </label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="レシピ名・カテゴリで検索（例: ティラミス / chicken）"
            className="w-full rounded-full border border-orange-200 bg-white px-5 py-3 text-sm shadow-sm outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          />
          <p className="mt-2 text-xs text-stone-400">
            英語で入力すると海外の無料レシピDB（TheMealDB）からも探します
          </p>
        </div>
      </section>

      {/* カテゴリフィルタ */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {["すべて", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeCategory === cat
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white text-stone-600 ring-1 ring-orange-200 hover:bg-orange-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 同梱レシピ */}
      <section aria-label="同梱レシピ">
        <h2 className="mb-4 flex items-baseline gap-2 text-lg font-bold text-stone-800">
          レシピ一覧
          <span className="text-sm font-normal text-stone-400">{filteredLocal.length}件</span>
        </h2>
        {filteredLocal.length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-stone-500 ring-1 ring-orange-100">
            条件に合う同梱レシピがありませんでした。検索語を変えるか、下の海外レシピ結果をご覧ください。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLocal.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </section>

      {/* TheMealDB 検索結果 */}
      {showRemoteSection && (
        <section aria-label="TheMealDBの検索結果" className="mt-12">
          <h2 className="mb-1 flex items-baseline gap-2 text-lg font-bold text-stone-800">
            TheMealDB の検索結果
            <span className="text-sm font-normal text-stone-400">
              {remoteLoading ? "検索中…" : `${remoteResults.length}件`}
            </span>
          </h2>
          <p className="mb-4 text-xs text-stone-400">
            海外の無料レシピデータベースから取得しています（タイトル・手順は英語です）。
          </p>
          {remoteResults.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {remoteResults.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
