/**
 * API のベース URL を返す。
 * - サーバー（SSR/Cloudflare Pages Worker）: process.env.API_URL を優先
 * - クライアント（ブラウザ）: ビルド時に埋め込んだ NEXT_PUBLIC_API_URL を使用
 * - フォールバック: ローカル開発用 localhost:8787
 */
export function getApiUrl(): string {
  if (typeof window === "undefined") {
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
}
