'use client';

import { useState } from 'react';

const ingredients = [
  { key: 'マスカルポーネ', label: 'マスカルポーネ 200g' },
  { key: 'エスプレッソ', label: 'エスプレッソ 100ml' },
  { key: '卵黄', label: '卵黄 2個分' },
  { key: 'グラニュー糖', label: 'グラニュー糖 大さじ2' },
  { key: 'カステラ', label: 'カステラ 適量' },
];

const tools = [
  { key: 'ボウル', label: 'ボウル' },
  { key: 'ハンドミキサー', label: 'ハンドミキサー' },
  { key: 'エスプレッソマシン', label: 'エスプレッソマシン' },
];

const steps = [
  '卵黄とグラニュー糖を白っぽくなるまで泡立てる。',
  'マスカルポーネを混ぜる。',
  'カステラにエスプレッソを染み込ませる。',
  'カステラとクリームを重ねる。',
  '冷蔵庫で冷やしてココアを振る。'
];

export default function Home() {
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

- 変更不要な手順はそのまま番号付きで再出力してください。
- 変更がある手順のみ書き換えてください。
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
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonString = text.slice(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonString);
        const cleaned: Record<string, string> = {};
        for (const rawKey in parsed) {
          const cleanKey = rawKey
            .replace(/^['"]/, '')
            .replace(/^[-–ー―\s　]+/, '')
            .replace(/['"]$/, '')
            .trim();
          console.log('🧩 key整形:', rawKey, '→', cleanKey);
          cleaned[cleanKey] = parsed[rawKey];
        }
        return cleaned;
      }
    } catch (e) {
      console.warn('JSON parse failed in substitution block:', e);
    }

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

    console.log('🧪 GPT返答全体:', data.result);
    console.log('🧩 parseSubstitutions結果:', parseSubstitutions(data.result));

    const lines = data.result?.split('\n').filter(line => line.trim().match(/^\d+\./)) ?? [];
    setSubstitutions(parseSubstitutions(data.result));

    return lines.map((line: string) => {
      const content = line.replace(/^\d+\.\s*/, '').trim();
      return content === '(返答なし)' || content.toLowerCase().includes('同じ') ? '' : content;
    });
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
      <h1 className="text-3xl font-bold text-orange-600 mb-6 tracking-wide">ティラミスのレシピ</h1>

      <section>
        <h2 className="text-xl font-semibold text-orange-500 mt-6 mb-2">🥣 材料</h2>
        <ul className="space-y-2">
          {ingredients.map(({ key, label }) => {
            const matchedKey = Object.keys(substitutions).find(k => k.includes(key));
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

      <section>
        <h2 className="text-xl font-semibold text-orange-500 mt-6 mb-2">🔧 器具</h2>
        <ul className="space-y-2">
          {tools.map(({ key, label }) => {
            const matchedKey = Object.keys(substitutions).find(k => key.includes(k));
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

      {(missingIngredients.length > 0 || missingTools.length > 0) && (
        <div className="mt-6">
          <button
            onClick={handleClick}
            className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-colors duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '🍳 取得中...' : '🍰 代替案を表示'}
          </button>
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold text-orange-500 mt-6 mb-2">👩‍🍳 手順</h2>
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

              {loading && <p className="mt-4 text-gray-500">代替手順を取得中...</p>}

        <section className="mt-10 border-t pt-6 text-sm text-gray-600">
        <h2 className="font-semibold mb-2">デバッグ出力</h2>
        <div className="bg-gray-100 p-4 rounded space-y-4">
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
