'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { recipes } from 'data/recipes';

export default function RecipeListBySubCategoryPage() {
  const params = useParams();
  const rawMain = params?.main;
  const rawSub = params?.sub;

  const main = typeof rawMain === 'string' ? decodeURIComponent(rawMain) : '';
  const sub = typeof rawSub === 'string' ? decodeURIComponent(rawSub) : '';

  const router = useRouter();

  const filteredRecipes = recipes.filter(
    (r) => r.category.main === main && r.category.sub === sub
  );

  return (
    <main className="p-6 max-w-3xl mx-auto bg-orange-50 rounded-xl shadow-inner">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 font-semibold bg-orange-100 hover:bg-orange-200 px-4 py-2 rounded-md transition"
      >
        ← 戻る
      </button>

      <h1 className="text-3xl font-bold text-orange-600 mb-6">
        {main} / {sub} のレシピ一覧
      </h1>


      {filteredRecipes.length === 0 ? (
        <p className="text-orange-400">このカテゴリにレシピは登録されていません。</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredRecipes.map((recipe) => (
            <li
              key={recipe.id}
              className="border border-orange-200 bg-white rounded-lg p-4 shadow hover:shadow-md transition"
            >
              <Link
                href={`/recipes/${recipe.id}`}
                className="block text-lg font-semibold text-orange-500 hover:underline"
              >
                {recipe.title}
              </Link>
              <p className="text-sm text-orange-400 mt-1">
                カテゴリ: {recipe.category.main} / {recipe.category.sub}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
