import type { Recipe } from "../types";

/**
 * レシピプロバイダの共通インターフェース。
 *
 * 新しい出所（例: 楽天レシピAPI）を足すときは、このインターフェースを実装して
 * providers/index.ts の registry に登録するだけでよい。
 * 楽天レシピAPIはユーザー自身のアプリケーションIDが必要なため v2 では未実装
 * （README の「プロバイダの追加方法」参照）。
 */
export interface RecipeProvider {
  /** プロバイダ識別子（"local" | "mealdb" | 将来の "rakuten" など） */
  readonly id: string;
  /** 表示名 */
  readonly label: string;
  /** キーワード検索。取得できない場合は空配列を返す（例外にしない） */
  search(query: string): Promise<Recipe[]>;
  /** カテゴリ別一覧。未対応なら空配列 */
  listByCategory(category: string): Promise<Recipe[]>;
  /** ID指定で1件取得。見つからなければ null */
  getById(id: string): Promise<Recipe | null>;
}
