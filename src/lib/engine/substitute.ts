import type {
  Recipe,
  ResolvedSubstitution,
  StepResult,
  SubstituteResponse,
  SubstitutionEntry,
} from "../types";
import { lookupSubstitution } from "../data/substitutions";

/**
 * ローカル代替エンジン。
 *
 * v1 の課題だった「毎回レシピ全文をLLMに送る」方式をやめ、
 * 1) 知識ベースで代替案を即時解決し、
 * 2) 手順文は「ない材料・器具の key が現れる文だけ」を決定的に書き換える。
 * 通信もAPIキーも不要で、コストはゼロ。
 */

interface MissingItem {
  key: string;
  kind: "ingredient" | "tool";
  entry: SubstitutionEntry | null;
  /** 利用者が「代わりにこれがある」と指定した代用品（あれば最優先で使う） */
  override?: string;
}

function collectMissing(
  missingIngredients: string[],
  missingTools: string[],
  overrides: Record<string, string> = {},
): MissingItem[] {
  const pick = (key: string) => {
    const v = overrides[key]?.trim();
    return v ? v : undefined;
  };
  const items: MissingItem[] = [];
  for (const key of missingIngredients) {
    items.push({ key, kind: "ingredient", entry: lookupSubstitution(key, "ingredient"), override: pick(key) });
  }
  for (const key of missingTools) {
    items.push({ key, kind: "tool", entry: lookupSubstitution(key, "tool"), override: pick(key) });
  }
  return items;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 手順文の書き換え。
 * - ないアイテムの key（と KB の正規名）が文中にあれば stepWord に置換する。
 * - 置換が起きた文には、KB の stepNote があれば末尾に注記を付ける。
 * - 変更のない文はそのまま返す（changed: false）。
 */
export function rewriteSteps(
  steps: string[],
  missing: MissingItem[],
): StepResult[] {
  const active = missing.filter((m) => m.entry || m.override);
  return steps.map((original, index) => {
    let rewritten = original;
    const notes: string[] = [];

    for (const m of active) {
      const entry = m.entry;
      // 利用者の指定があれば、その語をそのまま置換語にする（KB既定案より優先）
      const word = m.override ?? entry?.stepWord ?? entry?.replacement ?? m.key;
      // レシピ側の key と KB の正規名の両方を置換対象にする
      const targets = [m.key, ...(entry ? [entry.key, ...(entry.aliases ?? [])] : [])]
        .filter((t, i, arr) => t && arr.indexOf(t) === i)
        .sort((a, b) => b.length - a.length);

      let hit = false;
      for (const t of targets) {
        const re = new RegExp(escapeRegExp(t), "g");
        if (re.test(rewritten)) {
          rewritten = rewritten.replace(re, word);
          hit = true;
          break; // 1アイテムにつき最初に当たった表記だけ置換する
        }
      }
      // KB の手順メモは既定案向けの説明なので、利用者指定のときは付けない
      if (hit && !m.override && entry?.stepNote && !notes.includes(entry.stepNote)) {
        notes.push(entry.stepNote);
      }
    }

    if (notes.length > 0 && rewritten !== original) {
      rewritten = `${rewritten}（※${notes.join(" ")}）`;
    }
    return { index, original, rewritten, changed: rewritten !== original };
  });
}

/** 知識ベースだけで代替案と手順書き換えを解決する */
export function runLocalEngine(
  recipe: Recipe,
  missingIngredients: string[],
  missingTools: string[],
  overrides: Record<string, string> = {},
): SubstituteResponse {
  const missing = collectMissing(missingIngredients, missingTools, overrides);

  const substitutions: ResolvedSubstitution[] = missing.map((m) =>
    m.override
      ? {
          key: m.key,
          kind: m.kind,
          replacement: m.override,
          detail: "「代わりにこれがある」として指定されたもので作ります。",
          stepNote: null,
          resolvedBy: "user" as const,
        }
      : {
          key: m.key,
          kind: m.kind,
          replacement: m.entry?.replacement ?? null,
          detail: m.entry?.detail ?? null,
          stepNote: m.entry?.stepNote ?? null,
          resolvedBy: m.entry ? ("knowledge-base" as const) : ("none" as const),
        },
  );

  return {
    engine: "local",
    substitutions,
    steps: rewriteSteps(recipe.steps, missing),
  };
}
