/// <reference types="@cloudflare/workers-types" />

export type Env = {
  ASSETS: Fetcher;
  ALLOWED_ORIGIN: string;
  IMAGES_BASE_URL: string;
};
