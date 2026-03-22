/**
 * API のベース URL を返す。
 * - process.env.API_URL（Cloudflare Workers の [vars] または .env.local）
 * - フォールバック: ローカル開発用 localhost:8787
 */
export function getApiUrl(): string {
  return process.env.API_URL || "http://localhost:8787";
}
