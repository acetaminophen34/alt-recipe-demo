"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Recipe, RecipeItem, SubstituteResponse } from "@/lib/types";
import { runLocalEngine } from "@/lib/engine/substitute";
import { getSubstitutionCandidates } from "@/lib/data/substitutions";

type ItemKind = "ingredient" | "tool";

/** 自由入力を選んだときの select の値 */
const CUSTOM_CHOICE = "__custom__";

export default function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);
  const [missingTools, setMissingTools] = useState<string[]>([]);
  // 「代わりにこれがある」の指定状態（item.key 単位）
  const [choiceByKey, setChoiceByKey] = useState<Record<string, string>>({});
  const [customByKey, setCustomByKey] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubstituteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missingCount = missingIngredients.length + missingTools.length;

  const toggle = (key: string, kind: ItemKind) => {
    const [list, setter] =
      kind === "ingredient"
        ? ([missingIngredients, setMissingIngredients] as const)
        : ([missingTools, setMissingTools] as const);
    const isMissing = list.includes(key);
    setter(isMissing ? list.filter((k) => k !== key) : [...list, key]);
    if (isMissing) {
      // チェックを外したら、その項目の代用指定も消す
      setChoiceByKey((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setCustomByKey((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    setResult(null);
    setError(null);
  };

  const setChoice = (key: string, value: string) => {
    setChoiceByKey((prev) => ({ ...prev, [key]: value }));
    setResult(null);
    setError(null);
  };

  const setCustom = (key: string, value: string) => {
    setCustomByKey((prev) => ({ ...prev, [key]: value }));
    setResult(null);
    setError(null);
  };

  /** 現在の選択状態から、エンジンに渡す overrides（item.key → 代わりに使うもの）を組み立てる */
  const buildOverrides = (): Record<string, string> => {
    const overrides: Record<string, string> = {};
    for (const key of [...missingIngredients, ...missingTools]) {
      const choice = choiceByKey[key] ?? "";
      if (choice === CUSTOM_CHOICE) {
        const text = (customByKey[key] ?? "").trim();
        if (text) overrides[key] = text;
      } else if (choice) {
        overrides[key] = choice;
      }
    }
    return overrides;
  };

  const runSubstitution = () => {
    setLoading(true);
    setError(null);
    try {
      // 静的エクスポート版: サーバーAPIを介さず、ブラウザ内でローカルエンジンを直接実行する
      setResult(runLocalEngine(recipe, missingIngredients, missingTools, buildOverrides()));
    } catch {
      setError("代替案の取得に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const subByKey = useMemo(() => {
    const map = new Map<string, SubstituteResponse["substitutions"][number]>();
    for (const s of result?.substitutions ?? []) map.set(`${s.kind}:${s.key}`, s);
    return map;
  }, [result]);

  const renderItemList = (items: RecipeItem[], kind: ItemKind, missing: string[]) => (
    <ul className="divide-y divide-orange-50">
      {items.map((item) => {
        const isMissing = missing.includes(item.key);
        const sub = result ? subByKey.get(`${kind}:${item.key}`) : undefined;
        const candidates = isMissing ? getSubstitutionCandidates(item.key, kind) : [];
        const choice = choiceByKey[item.key] ?? "";
        return (
          <li key={item.key} className="py-2.5">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={isMissing}
                onChange={() => toggle(item.key, kind)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-orange-600"
              />
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <span
                  className={`font-medium ${isMissing ? "text-stone-400 line-through decoration-orange-300" : "text-stone-800"}`}
                >
                  {item.label}
                </span>
                {isMissing ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    ない
                  </span>
                ) : (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 ring-1 ring-green-200">
                    ✓ 使える
                  </span>
                )}
              </span>
            </label>

            {isMissing && (
              <div className="ml-8 mt-2 rounded-lg bg-stone-50 px-3 py-2 ring-1 ring-stone-200">
                <span className="text-xs font-semibold text-stone-500">
                  代わりにこれがある（任意）
                </span>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <select
                    value={choice}
                    onChange={(e) => setChoice(item.key, e.target.value)}
                    className="max-w-full rounded-md bg-white px-2 py-1.5 text-sm text-stone-700 ring-1 ring-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    aria-label={`${item.key}の代わりにあるもの`}
                  >
                    <option value="">おまかせ（おすすめの代替案）</option>
                    {candidates.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value={CUSTOM_CHOICE}>自分で入力する</option>
                  </select>
                  {choice === CUSTOM_CHOICE && (
                    <input
                      type="text"
                      value={customByKey[item.key] ?? ""}
                      onChange={(e) => setCustom(item.key, e.target.value)}
                      placeholder="例：豚こま切れ肉"
                      className="min-w-40 flex-1 rounded-md bg-white px-2 py-1.5 text-sm text-stone-700 ring-1 ring-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      aria-label={`${item.key}の代わりにあるものを入力`}
                    />
                  )}
                </div>
              </div>
            )}

            {isMissing && sub && (
              <div className="ml-8 mt-1.5 rounded-lg bg-orange-50 px-3 py-2 text-sm leading-relaxed text-stone-700 ring-1 ring-orange-100">
                {sub.replacement ? (
                  <>
                    <span className="font-semibold text-orange-700">
                      → {sub.replacement}
                    </span>
                    {sub.resolvedBy === "user" && (
                      <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                        指定したもの
                      </span>
                    )}
                    {sub.detail && <span className="mt-0.5 block text-stone-600">{sub.detail}</span>}
                  </>
                ) : (
                  <span className="font-semibold text-red-600">
                    代替案が見つかりませんでした。買い足すか、別のレシピをご検討ください。
                  </span>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const availableIngredients = recipe.ingredients.length - missingIngredients.length;
  const availableTools = recipe.tools.length - missingTools.length;

  return (
    <div className="pt-6">
      <Link href="/" className="text-sm font-medium text-orange-700 hover:underline">
        ← レシピ一覧へ戻る
      </Link>

      {/* ヘッダ */}
      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-orange-100">
        {recipe.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.image} alt={recipe.title} className="h-56 w-full object-cover sm:h-72" />
        )}
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-700">
              {recipe.category.main}
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-600">
              {recipe.category.sub}
            </span>
            {recipe.servings && (
              <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-600">
                {recipe.servings}
              </span>
            )}
            {recipe.source === "mealdb" && (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700 ring-1 ring-sky-200">
                TheMealDB のレシピ（手順は英語）
              </span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-800 sm:text-3xl">
            {recipe.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">
            持っていないものにチェックを入れて「代替案を表示」を押すと、代わりになるものと書き換えた手順を提案します。
            チェックしていないものは「今使えるもの」として表示されます。
            「これがないけど、代わりにこれがある」という場合は、チェックした項目の下で手元にあるものを指定できます。
          </p>
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-sky-700 hover:underline"
            >
              出典ページを見る ↗
            </a>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* 左カラム: 材料・器具 */}
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-orange-100 sm:p-6">
            <h2 className="flex items-baseline justify-between text-lg font-bold text-stone-800">
              🥣 材料
              <span className="text-sm font-medium text-green-700">
                {availableIngredients}/{recipe.ingredients.length}品 使える
              </span>
            </h2>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{
                  width: `${recipe.ingredients.length ? (availableIngredients / recipe.ingredients.length) * 100 : 0}%`,
                }}
              />
            </div>
            {renderItemList(recipe.ingredients, "ingredient", missingIngredients)}
          </section>

          {recipe.tools.length > 0 ? (
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-orange-100 sm:p-6">
              <h2 className="flex items-baseline justify-between text-lg font-bold text-stone-800">
                🔧 器具
                <span className="text-sm font-medium text-green-700">
                  {availableTools}/{recipe.tools.length}品 使える
                </span>
              </h2>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${recipe.tools.length ? (availableTools / recipe.tools.length) * 100 : 0}%`,
                  }}
                />
              </div>
              {renderItemList(recipe.tools, "tool", missingTools)}
            </section>
          ) : (
            <section className="rounded-3xl bg-white p-5 text-sm text-stone-500 shadow-sm ring-1 ring-orange-100">
              このレシピには器具情報がありません（TheMealDB には器具データがないため、材料のみチェックできます）。
            </section>
          )}

          <button
            onClick={runSubstitution}
            disabled={loading || missingCount === 0}
            className="w-full rounded-full bg-orange-600 px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {loading
              ? "代替案を考え中…"
              : missingCount === 0
                ? "まず「ないもの」にチェックを入れてください"
                : `代替案を表示（${missingCount}件）`}
          </button>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {result && (
            <p className="text-center text-xs text-stone-400">
              提案エンジン: {result.engine === "llm" ? "LLM" : "ローカル知識ベース"}
            </p>
          )}
        </div>

        {/* 右カラム: 手順 */}
        <section className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-orange-100 sm:p-6">
          <h2 className="text-lg font-bold text-stone-800">📋 作り方</h2>
          {result && (
            <p className="mt-1 text-xs text-stone-400">
              変更があった手順は、元の文（打ち消し）と書き換え後を並べて表示しています。
            </p>
          )}
          <ol className="mt-4 space-y-4">
            {(result?.steps ?? recipe.steps.map((s, i) => ({ index: i, original: s, rewritten: s, changed: false }))).map(
              (step) => (
                <li key={step.index} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                    {step.index + 1}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    {step.changed ? (
                      <div className="space-y-1.5">
                        <p className="step-original text-sm leading-relaxed text-stone-400">
                          {step.original}
                        </p>
                        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium leading-relaxed text-stone-800 ring-1 ring-green-200">
                          {step.rewritten}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-stone-700">{step.original}</p>
                    )}
                  </div>
                </li>
              ),
            )}
          </ol>
        </section>
      </div>
    </div>
  );
}
