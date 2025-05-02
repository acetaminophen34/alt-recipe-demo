'use client';

import { useState } from 'react';
import { recipes } from 'data/recipes';

export default function Home() {
  const [selectedRecipeId, setSelectedRecipeId] = useState('tiramisu');
  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);
  const ingredients = selectedRecipe?.ingredients ?? [];
  const tools = selectedRecipe?.tools ?? [];
  const steps = selectedRecipe?.steps ?? [];

  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);
  const [missingTools, setMissingTools] = useState<string[]>([]);
  const [updatedSteps, setUpdatedSteps] = useState<string[]>([]);
  const [substitutions, setSubstitutions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const toggleMissing = (item: string, type: 'ingredient' | 'tool') => {
    const current = type === 'ingredient' ? missingIngredients : missingTools;
    const setter = type === 'ingredient' ? setMissingIngredients : setMissingTools;

    if (current.includes(item)) {
      setter(current.filter(i => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  const generatePrompt = () => {
    const missingList = [
      ...missingIngredients.map(i => `- 材料: ${i}`),
      ...missingTools.map(i => `- 器具: ${i}`)
    ].join('\n');

    const stepText = steps.map((s, i) => `${i + 1}. ${s}`).join('\n');

    return `
以下のレシピの調理手順を、持っていない材料や器具に合わせて必要な箇所だけ書き換えてください。

- 内容が完全に同じ手順は、言い換えずにそのまま出力してください。
- 変更がある場合のみ、その箇所だけを明確に変更してください。
- 手順は「1. 手順文」の形式で出力してください。
- 手順のあとに「【代替材料・器具】」というセクションを作り、以下の形式でリストしてください：
必ずすべての代替材料に対して、g や ml などの単位つきで具体的な使用量を明記してください。
形式の例：
  - エスプレッソ → インスタントコーヒー（小さじ2）＋お湯（100ml）
  - マスカルポーネ → クリームチーズ（100g）＋生クリーム（50ml）

【持っていないもの】
${missingList}

【元の手順】
${stepText}
    `;
  };

  const parseSubstitutions = (text: string): Record<string, string> => {
    const lines = text.split('\n');
    const subs: Record<string, string> = {};
    const start = lines.findIndex(line => line.includes('【代替材料') || line.includes('【代替案】'));
    if (start === -1) return subs;
    for (let i = start + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || !line.includes('→')) continue;
      const [original, replacement] = line.split('→').map(s => s.trim());
      subs[original] = replacement;
    }
    return subs;
  };

  const fetchSubstitutionSteps = async (prompt: string): Promise<string[]> => {
    const res = await fetch('/api/gpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setSubstitutions(parseSubstitutions(data.result));

    const lines = data.result?.split('\n').filter(line => line.trim().match(/^\d+\./)) ?? [];
    return lines.map((line: string) => line.replace(/^\d+\.\s*/, '').trim());
  };

  const handleClick = async () => {
    const prompt = generatePrompt();
    setLoading(true);
    const stepsResult = await fetchSubstitutionSteps(prompt);
    setUpdatedSteps(stepsResult);
    setLoading(false);
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="bg-orange-50 rounded-xl shadow-inner p-4">
        <div className="mb-6">
          <label className="block text-orange-600 font-semibold mb-2">レシピを選択：</label>
          <select className="border border-orange-300 rounded px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={selectedRecipeId}
            onChange={(e) => {
              setSelectedRecipeId(e.target.value);
              setMissingIngredients([]);
              setMissingTools([]);
              setUpdatedSteps([]);
              setSubstitutions({});
            }}
          >
            {Array.from(new Set(recipes.map(r => r.category.main))).map(main => (
                <optgroup key={main} label={main}>
                   {recipes
                   .filter(r => r.category.main === main)
                   .map(r => (
                <option key={r.id} value={r.id}>
                  {r.title}（{r.category.sub}）
                </option>
              ))}
              </optgroup>
            ))}
          </select>
        </div>

        <section className="border-b border-orange-200 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-orange-500 mb-3">🥣 材料</h2>
          <ul className="space-y-2">
            {ingredients.map(({ key, label }) => {
              const matchedKey = Object.keys(substitutions).find(k => k.includes(key));
              const [name, amount] = label.split(/\s+(?=[^\s]+$)/);
              return (
                <li key={key}>
                  <label className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={missingIngredients.includes(key)}
                        onChange={() => toggleMissing(key, 'ingredient')}
                        className="accent-pink-500"
                      />
                      <div className="flex justify-between w-full">
                        <span className="w-1/2 text-left">{name}</span>
                        <span className="w-1/2 text-left text-gray-600">{amount}</span>
                      </div>
                    </div>
                    {matchedKey && substitutions[matchedKey] && (
                      <span className="text-sm text-green-700 ml-6">
                        → {substitutions[matchedKey]} で代用可能
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="border-b border-orange-200 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-orange-500 mb-3">🔧 器具</h2>
          <ul className="space-y-2">
            {tools.map(({ key, label }) => {
              const matchedKey = Object.keys(substitutions).find(k => k.includes(key));
              return (
                <li key={key}>
                  <label className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={missingTools.includes(key)}
                        onChange={() => toggleMissing(key, 'tool')}
                        className="accent-blue-500"
                      />
                      <span>{label}</span>
                    </div>
                    {matchedKey && substitutions[matchedKey] && (
                      <span className="text-sm text-green-700 ml-6">
                        → {substitutions[matchedKey]} で代用可能
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="border-b border-orange-200 pb-6 mb-6">
          <div className="mt-4">
            <button
              onClick={handleClick}
              className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-colors duration-300 disabled:opacity-50"
              disabled={missingIngredients.length === 0 && missingTools.length === 0 || loading}
            >
              {loading ? '🍳 取得中...' : '🍰 代替案を表示'}
            </button>
          </div>
        </div>

        <section className="border-b border-orange-200 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-orange-500 mb-3">👩‍🍳 手順</h2>
          <ol className="list-decimal pl-6 space-y-2">
            {steps.map((step, i) => {
              const updated = updatedSteps[i];
              return (
                <li key={i}>
                  {updated && updated !== step ? (
                    <div>
                      <p className="line-through text-gray-500">{step}</p>
                      <p className="text-green-800">{updated}</p>
                    </div>
                  ) : (
                    <p>{step}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mt-16 pt-10 text-sm text-gray-600">
          <h2 className="font-semibold mb-2">デバッグ出力</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
            <div>
              <p className="font-medium mb-1">▼ 入力ログ（missingIngredients / missingTools）:</p>
              <pre className="whitespace-pre-wrap text-xs">
                <code>
missingIngredients: {JSON.stringify(missingIngredients, null, 2)}
missingTools: {JSON.stringify(missingTools, null, 2)}
                </code>
              </pre>
            </div>
            <div>
              <p className="font-medium mb-1">▼ プロンプト:</p>
              <pre className="whitespace-pre-wrap text-xs">
                <code>{generatePrompt()}</code>
              </pre>
            </div>
            <div>
              <p className="font-medium mb-1">▼ GPTの手順出力:</p>
              <div className="whitespace-pre-wrap text-xs">
                {updatedSteps.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
