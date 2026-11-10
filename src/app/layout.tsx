import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "代用レシピ | ない材料・器具の代替案と手順書き換え",
  description:
    "持っていない材料や器具をチェックするだけで、代替案と書き換えた手順を提案するレシピアプリ。APIキーなしで動くローカル代替エンジン搭載。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-20 border-b border-orange-100 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-lg shadow-sm">
                🍳
              </span>
              <span className="leading-tight">
                <span className="block text-base font-bold tracking-tight text-stone-800">
                  代用レシピ
                </span>
                <span className="block text-[11px] text-stone-500">
                  ない材料・器具があっても作れる
                </span>
              </span>
            </Link>
            <span className="hidden items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-200 sm:flex">
              ローカル代替エンジン搭載 · APIキー不要
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">{children}</main>

        <footer className="border-t border-orange-100 bg-white/60">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-stone-500 sm:px-6">
            <p>
              代替案は内蔵の知識ベース（＋任意でLLM）から提案しています。分量は目安なので、味見しながら調整してください。
            </p>
            <p className="mt-1">
              海外レシピのデータ提供: TheMealDB（無料公開API）。同梱レシピはオフラインでも利用できます。
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
