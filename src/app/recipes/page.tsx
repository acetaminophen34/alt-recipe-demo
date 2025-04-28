'use client';

import Link from 'next/link';
import { recipes } from 'data/recipes';

export default function HomePage() {
  return (
    <main className="p-6 max-w-3xl mx-auto bg-orange-50 rounded-xl shadow-inner">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">レシピ一覧</h1>

      {Array.from(new Set(recipes.map(r => r.category))).map((category) => (
        <section key={category} className="mb-10 border-b border-orange-200 pb-6">
          <h2 className="text-xl font-semibold text-orange-500 mb-4">📑 {category}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recipes
              .filter((recipe) => recipe.category === category)
              .map((recipe) => (
                <li
                  key={recipe.id}
                  className="border border-orange-200 rounded-lg bg-white p-4 shadow hover:shadow-md transition"
                >
                  <a
                    href={`/recipes/${recipe.id}`}
                    className="block text-lg font-semibold text-orange-500 hover:underline"
                  >
                    {recipe.title}
                  </a>
                  <p className="text-sm text-orange-400 mt-1">カテゴリ: {recipe.category}</p>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>

  );
}
