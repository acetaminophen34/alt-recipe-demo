import type { NextConfig } from "next";

// GitHub Pages のプロジェクトサイトは /<repo-name>/ 配下で配信されるため、
// ベースパスは環境変数 NEXT_PUBLIC_BASE_PATH で差し替える（デフォルトは空＝ルート配信）。
// 例: NEXT_PUBLIC_BASE_PATH=/alt-recipe-demo npm run build
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // GitHub Pages は静的ファイルしか配信できないため、静的エクスポートを使う。
  // API ルートは使わず、代替エンジンと TheMealDB 取得はすべてブラウザ側で実行する。
  output: "export",
  basePath: basePath || undefined,
  // 各ルートを <route>/index.html として書き出し、Pages の静的配信と相性良くする
  trailingSlash: true,
  images: {
    // 静的エクスポートでは画像最適化サーバーが使えないため無効化する
    unoptimized: true,
  },
};

export default nextConfig;
