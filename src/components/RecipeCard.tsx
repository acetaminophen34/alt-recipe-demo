import Link from "next/link";
import type { RecipeSummary } from "@/lib/types";

/** id から決定的にグラデーションを選ぶ（同梱レシピのプレースホルダ用） */
const GRADIENTS = [
  "from-amber-400 via-orange-400 to-rose-400",
  "from-lime-400 via-emerald-400 to-teal-500",
  "from-orange-400 via-amber-500 to-yellow-400",
  "from-rose-400 via-pink-400 to-fuchsia-400",
  "from-sky-400 via-cyan-400 to-teal-400",
  "from-violet-400 via-purple-400 to-indigo-400",
];

function gradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

export default function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  // 同梱レシピは静的生成された詳細ページへ、TheMealDB のレシピは
  // ID をクエリで渡してクライアント側で取得する静的ページへリンクする
  const href =
    recipe.source === "mealdb"
      ? `/recipes/mealdb?id=${encodeURIComponent(recipe.id)}`
      : `/recipes/${encodeURIComponent(recipe.id)}`;
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {recipe.image ? (
          // TheMealDB の画像。外部CDNのため通常の img で読み込む
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientFor(recipe.id)}`}
          >
            <span className="px-4 text-center text-2xl font-bold text-white/95 drop-shadow-sm">
              {recipe.title.slice(0, 2)}
            </span>
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/45 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {recipe.category.main}
        </span>
        {recipe.source === "mealdb" && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
            TheMealDB
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug text-stone-800 group-hover:text-orange-700">
          {recipe.title}
        </h3>
        <p className="mt-auto flex items-center gap-2 pt-1 text-xs text-stone-500">
          <span>{recipe.category.sub}</span>
          <span aria-hidden>·</span>
          <span>材料{recipe.ingredientCount}品</span>
        </p>
      </div>
    </Link>
  );
}
