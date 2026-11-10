/**
 * レシピと代替提案のデータモデル。
 * レシピの基本形は v1（alt-recipe-demo）と互換:
 *   { id, title, category {main, sub}, ingredients: [{key, label}],
 *     tools: [{key, label}], steps: string[] }
 * v2 では出所（source）や画像などの任意フィールドを追加している。
 */

/** 材料・器具の1項目。key は手順文中の表記と対応する識別名、label は分量付きの表示名。 */
export interface RecipeItem {
  key: string;
  label: string;
}

export type RecipeSource = "local" | "mealdb";

export interface Recipe {
  id: string;
  title: string;
  category: {
    main: string;
    sub: string;
  };
  ingredients: RecipeItem[];
  tools: RecipeItem[];
  steps: string[];
  /** 一覧表示用の画像URL（TheMealDB由来のレシピのみ） */
  image?: string;
  /** 出所サイトへのリンク */
  sourceUrl?: string;
  /** レシピの出所 */
  source: RecipeSource;
  /** 何人分などの目安（任意） */
  servings?: string;
}

/** 一覧カードなどに使う軽量なサマリ */
export interface RecipeSummary {
  id: string;
  title: string;
  category: { main: string; sub: string };
  image?: string;
  source: RecipeSource;
  ingredientCount: number;
}

/**
 * 代替知識ベースの1エントリ。
 * key / aliases で材料・器具名にマッチし、replacement を提案する。
 * stepNote は「手順がどう変わるか」の説明、stepReplace は手順文の決定的な書き換え用。
 */
export interface SubstitutionEntry {
  /** マッチ対象の正規名（例: 牛乳） */
  key: string;
  /** 表記ゆれ・別名・英語名など */
  aliases?: string[];
  kind: "ingredient" | "tool";
  /** 代替案の要約（例: 豆乳（同量）） */
  replacement: string;
  /** 代替案の詳細（分量の目安など） */
  detail: string;
  /** 手順への影響メモ */
  stepNote?: string;
  /**
   * 手順文中の key を置き換える語（例: 牛乳 → 豆乳）。
   * 未指定なら replacement の先頭語を使う。
   */
  stepWord?: string;
}

/** 解決済みの代替提案（APIレスポンス用） */
export interface ResolvedSubstitution {
  key: string;
  kind: "ingredient" | "tool";
  /** 代替案。null の場合は知識ベースにもLLMにも代替案がなかった */
  replacement: string | null;
  detail: string | null;
  stepNote: string | null;
  /** どのエンジンが解決したか */
  resolvedBy: "knowledge-base" | "llm" | "none";
}

/** 書き換え前後の手順 */
export interface StepResult {
  index: number;
  original: string;
  rewritten: string;
  changed: boolean;
}

export interface SubstituteResponse {
  engine: "local" | "llm";
  substitutions: ResolvedSubstitution[];
  steps: StepResult[];
}

export interface SubstituteRequest {
  recipe: Recipe;
  missingIngredients: string[];
  missingTools: string[];
}
