export const runtime = 'nodejs'; // ← これが大事！EdgeでなくNodeを使う

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4', // または 'gpt-3.5-turbo'
      messages: [
        { role: 'system', content: 'あなたは料理研究家です。ユーザーが持っていない材料・器具に対して代替案を提案してください。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  const data = await res.json();

  return NextResponse.json({ result: data.choices?.[0]?.message?.content || '代替案を取得できませんでした。' });
}