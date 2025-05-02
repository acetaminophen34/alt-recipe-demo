'use client';

import Link from 'next/link';
import { recipes } from 'data/recipes';

export default function CategoryListPage() {
  const mainCategories = Array.from(
    new Set(recipes.map((r) => r.category.main))
  );

  return (
    <main className="p-6 max-w-3xl mx-auto bg-orange-50 rounded-xl shadow-inner">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">カテゴリ一覧</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {mainCategories.map((main) => (
          <li
            key={main}
            className="border border-orange-200 bg-white rounded-lg p-4 shadow hover:shadow-md transition"
          >
            <Link
              href={`/categories/${encodeURIComponent(main)}`}
              className="block text-lg font-semibold text-orange-500 hover:underline"
            >
              {main}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
