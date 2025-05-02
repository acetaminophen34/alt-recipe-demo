'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { recipes } from 'data/recipes';

export default function SubCategoryListPage() {
  const params = useParams();
  const rawMain = params?.main;
  const main = typeof rawMain === 'string' ? decodeURIComponent(rawMain) : '';

  const router = useRouter();

  const subCategories = Array.from(
    new Set(
      recipes
        .filter((r) => r.category.main === main)
        .map((r) => r.category.sub)
    )
  );

  return (
    <main className="p-6 max-w-3xl mx-auto bg-orange-50 rounded-xl shadow-inner">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 font-semibold bg-orange-100 hover:bg-orange-200 px-4 py-2 rounded-md transition"
      >
  ← 戻る
</button>
      <h1 className="text-3xl font-bold text-orange-600 mb-6">{main} のサブカテゴリ</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {subCategories.map((sub) => (
          <li
            key={sub}
            className="border border-orange-200 bg-white rounded-lg p-4 shadow hover:shadow-md transition"
          >
            <Link
              href={`/categories/${encodeURIComponent(main)}/sub/${encodeURIComponent(sub)}`}
              className="block text-lg font-semibold text-orange-500 hover:underline"
            >
              {sub}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
