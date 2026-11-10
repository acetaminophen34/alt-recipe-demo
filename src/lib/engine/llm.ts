import type { Recipe, SubstituteResponse} from "../types";
import { runLocalEngine} from "./substitute";

/**
* 任意のLLMモード。
*
* OPENAI_API_KEY が設定されている場合だけ有効になる。
* コスト対策として、レシピ全文は送らず
* 「ない材料・器具」と「その key が登場する手順文だけ」を送る。
* 応答は JSON 固定。失敗時はローカルエンジンにフォールバックする。
*
* 接続先は OpenAI 互換 API（LLM_BASE_URL）。llama.cpp の llama-server など
* ローカルLLMにも向けられる。
*/

interface LlmSubstitution {
key: string;
replacement: string;
detail: string;
stepNote?: string;
}

interface LlmPayload {
substitutions: LlmSubstitution[];
steps: { index: number; text: string}[];
}

export function isLlmEnabled(): boolean {
return Boolean(process.env.OPENAI_API_KEY);
}

function buildPrompt(
recipe: Recipe,
missingIngredients: string[],
missingTools: string[],
): { system: string; user: string; relevantStepIndexes: number[]} {
const missingKeys = [...missingIngredients,...missingTools];
const relevantStepIndexes = recipe.steps
.map((s, i) => (missingKeys.some((k) => s.includes(k))? i: -1))
.filter((i) => i >= 0);

const system = [
"あなたは家庭料理の代替案を提案するアシスタントです。",
"出力は必ず次のJSON形式のみにしてください:",
'{"substitutions":[{"key":"元の材料・器具名","replacement":"代替案（分量の目安つき）","detail":"補足説明","stepNote":"手順への影響"}],"steps":[{"index":0,"text":"書き換え後の手順文"}]}',
"steps には書き換えが必要な手順だけを含めてください。変更不要な手順は含めないでください。",
].join("\n");

const user = [
`レシピ: ${recipe.title}`,
"",
"",
...missingIngredients.map((k) => `- ${k}`),
"",
...missingTools.map((k) => `- ${k}`),
"",
"",
...relevantStepIndexes.map((i) => `${i}: ${recipe.steps[i]}`),
].join("\n");

return { system, user, relevantStepIndexes};
}

export async function runLlmEngine(
recipe: Recipe,
missingIngredients: string[],
missingTools: string[],
): Promise<SubstituteResponse> {
const baseUrl = (process.env.LLM_BASE_URL?? "https://api.openai.com/v1").replace(/\/$/, "");
const model = process.env.LLM_MODEL?? "gpt-4o-mini";
const { system, user, relevantStepIndexes} = buildPrompt(
recipe,
missingIngredients,
missingTools,
);

const res = await fetch(`${baseUrl}/chat/completions`, {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
},
body: JSON.stringify({
model,
messages: [
{ role: "system", content: system},
{ role: "user", content: user},
],
response_format: { type: "json_object"},
temperature: 0.3,
}),
});

if (!res.ok) {
throw new Error(`LLM API error: ${res.status}`);
}

const data = (await res.json()) as {
choices?: { message?: { content?: string}}[];
};
const content = data.choices?.[0]?.message?.content;
if (!content) throw new Error("LLM API: empty response");

const payload = JSON.parse(content) as LlmPayload;

// ローカルエンジンの結果を土台にし、LLMの提案で上書きする（安全側のマージ）
const local = runLocalEngine(recipe, missingIngredients, missingTools);

const llmSubs = new Map(payload.substitutions.map((s) => [s.key, s]));
const substitutions = local.substitutions.map((sub) => {
const llm = llmSubs.get(sub.key);
if (!llm) return sub;
return {
...sub,
replacement: llm.replacement,
detail: llm.detail,
stepNote: llm.stepNote?? sub.stepNote,
resolvedBy: "llm" as const,
};
});

const llmSteps = new Map(payload.steps.map((s) => [s.index, s.text]));
const steps = local.steps.map((step) => {
const text = llmSteps.get(step.index);
if (text && relevantStepIndexes.includes(step.index)) {
return {...step, rewritten: text, changed: text!== step.original};
}
return step;
});

return { engine: "llm", substitutions, steps};
}
