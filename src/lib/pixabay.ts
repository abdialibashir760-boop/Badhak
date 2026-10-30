/**
 * Pixabay client. SERVER ONLY: it reads PIXABAY_API_KEY and must never be
 * imported from a client component. The browser talks to /api/pixabay/*.
 * The request URL contains the key, so it is never logged or put in errors.
 */

export const IMAGES_ENDPOINT = "https://pixabay.com/api/";
export const VIDEOS_ENDPOINT = "https://pixabay.com/api/videos/";

/** Pixabay asks clients to cache results for 24 hours. */
export const CACHE_SECONDS = 24 * 60 * 60;

export type PixabayErrorCode = "not_configured" | "invalid_request" | "rate_limited" | "upstream";

export class PixabayError extends Error {
  constructor(
    readonly code: PixabayErrorCode,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PixabayError";
  }
}

export const IMAGE_TYPES = ["all", "photo", "illustration", "vector"] as const;
export const VIDEO_TYPES = ["all", "film", "animation"] as const;
export const ORIENTATIONS = ["all", "horizontal", "vertical"] as const;
export const ORDERS = ["popular", "latest"] as const;

export interface SearchParams {
  q: string;
  page: number;
  perPage: number;
  lang?: string;
  safesearch: boolean;
  order: (typeof ORDERS)[number];
}
export interface ImageSearchParams extends SearchParams {
  imageType: (typeof IMAGE_TYPES)[number];
  orientation: (typeof ORIENTATIONS)[number];
}
export interface VideoSearchParams extends SearchParams {
  videoType: (typeof VIDEO_TYPES)[number];
}

export interface PixabayImage {
  id: number;
  pageUrl: string;
  tags: string[];
  previewUrl: string;
  webUrl: string;
  largeUrl: string;
  width: number;
  height: number;
  user: string;
}
export interface PixabayVideoFile {
  url: string;
  width: number;
  height: number;
  size: number;
}
export interface PixabayVideo {
  id: number;
  pageUrl: string;
  tags: string[];
  duration: number;
  thumbnailUrl: string;
  user: string;
  files: Partial<Record<"large" | "medium" | "small" | "tiny", PixabayVideoFile>>;
}
export interface SearchResult<T> {
  total: number;
  totalHits: number;
  hits: T[];
}

const MAX_QUERY_LENGTH = 100; // Pixabay limit
const LANG = /^[a-z]{2}(-[A-Za-z]{2})?$/;

function pick<T extends readonly string[]>(value: string | null, allowed: T, fallback: T[number]): T[number] {
  if (value === null || value === "") return fallback;
  if (!(allowed as readonly string[]).includes(value)) {
    throw new PixabayError("invalid_request", `Invalid value "${value.slice(0, 30)}".`, 400);
  }
  return value as T[number];
}

function integer(value: string | null, name: string, min: number, max: number, fallback: number): number {
  if (value === null || value === "") return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new PixabayError("invalid_request", `"${name}" must be a whole number from ${min} to ${max}.`, 400);
  }
  return n;
}

function parseCommon(input: URLSearchParams): SearchParams {
  const q = (input.get("q") ?? "").trim();
  if (q.length > MAX_QUERY_LENGTH) {
    throw new PixabayError("invalid_request", `"q" must be at most ${MAX_QUERY_LENGTH} characters.`, 400);
  }
  const lang = input.get("lang");
  if (lang && !LANG.test(lang)) {
    throw new PixabayError("invalid_request", `"lang" must be a language code such as "en" or "tr".`, 400);
  }
  return {
    q,
    page: integer(input.get("page"), "page", 1, 1000, 1),
    perPage: integer(input.get("per_page"), "per_page", 3, 200, 20),
    lang: lang || undefined,
    safesearch: input.get("safesearch") !== "false",
    order: pick(input.get("order"), ORDERS, "popular"),
  };
}

export function parseImageParams(input: URLSearchParams): ImageSearchParams {
  return {
    ...parseCommon(input),
    imageType: pick(input.get("image_type"), IMAGE_TYPES, "all"),
    orientation: pick(input.get("orientation"), ORIENTATIONS, "all"),
  };
}

export function parseVideoParams(input: URLSearchParams): VideoSearchParams {
  return {
    ...parseCommon(input),
    videoType: pick(input.get("video_type"), VIDEO_TYPES, "all"),
  };
}

/** Builds the upstream URL. The key goes in the `key` query parameter, as Pixabay requires. */
export function buildUrl(
  endpoint: string,
  params: ImageSearchParams | VideoSearchParams,
  apiKey: string,
): string {
  const search = new URLSearchParams({
    key: apiKey,
    page: String(params.page),
    per_page: String(params.perPage),
    safesearch: String(params.safesearch),
    order: params.order,
  });
  if (params.q) search.set("q", params.q);
  if (params.lang) search.set("lang", params.lang);
  if ("imageType" in params) {
    search.set("image_type", params.imageType);
    search.set("orientation", params.orientation);
  } else {
    search.set("video_type", params.videoType);
  }
  return `${endpoint}?${search.toString()}`;
}

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export interface ClientOptions {
  apiKey?: string;
  fetcher?: Fetcher;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const splitTags = (v: unknown): string[] =>
  str(v)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

async function request(endpoint: string, params: ImageSearchParams | VideoSearchParams, options: ClientOptions) {
  const apiKey = options.apiKey ?? process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    throw new PixabayError("not_configured", "Pixabay is not configured. Set PIXABAY_API_KEY on the server.", 503);
  }
  const fetcher: Fetcher = options.fetcher ?? ((url, init) => fetch(url, init));
  let response: Response;
  try {
    response = await fetcher(buildUrl(endpoint, params, apiKey), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      // Next.js data cache: Pixabay asks for 24-hour caching.
      next: { revalidate: CACHE_SECONDS },
    } as RequestInit);
  } catch {
    // Deliberately drop the original error: it could mention the URL (and key).
    throw new PixabayError("upstream", "Could not reach Pixabay. Try again later.", 502);
  }
  if (response.status === 429) {
    throw new PixabayError("rate_limited", "Pixabay rate limit reached. Try again in a minute.", 429);
  }
  if (response.status === 400) {
    throw new PixabayError("invalid_request", "Pixabay rejected the search. Check the search options.", 400);
  }
  if (response.status === 401 || response.status === 403) {
    throw new PixabayError("not_configured", "Pixabay rejected the API key. Check PIXABAY_API_KEY.", 503);
  }
  if (!response.ok) {
    throw new PixabayError("upstream", `Pixabay returned an error (${response.status}).`, 502);
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new PixabayError("upstream", "Pixabay returned an unreadable response.", 502);
  }
  if (!isRecord(body) || !Array.isArray(body.hits)) {
    throw new PixabayError("upstream", "Pixabay returned an unexpected response.", 502);
  }
  return { total: num(body.total), totalHits: num(body.totalHits), hits: body.hits.filter(isRecord) };
}

export async function searchImages(
  params: ImageSearchParams,
  options: ClientOptions = {},
): Promise<SearchResult<PixabayImage>> {
  const { total, totalHits, hits } = await request(IMAGES_ENDPOINT, params, options);
  return {
    total,
    totalHits,
    hits: hits.map((h) => ({
      id: num(h.id),
      pageUrl: str(h.pageURL),
      tags: splitTags(h.tags),
      previewUrl: str(h.previewURL),
      webUrl: str(h.webformatURL),
      largeUrl: str(h.largeImageURL),
      width: num(h.imageWidth),
      height: num(h.imageHeight),
      user: str(h.user),
    })),
  };
}

const VIDEO_SIZES = ["large", "medium", "small", "tiny"] as const;

export async function searchVideos(
  params: VideoSearchParams,
  options: ClientOptions = {},
): Promise<SearchResult<PixabayVideo>> {
  const { total, totalHits, hits } = await request(VIDEOS_ENDPOINT, params, options);
  return {
    total,
    totalHits,
    hits: hits.map((h) => {
      const videos = isRecord(h.videos) ? h.videos : {};
      const files: PixabayVideo["files"] = {};
      for (const size of VIDEO_SIZES) {
        const f = videos[size];
        // Pixabay leaves url empty for sizes it has not rendered.
        if (isRecord(f) && str(f.url)) {
          files[size] = { url: str(f.url), width: num(f.width), height: num(f.height), size: num(f.size) };
        }
      }
      return {
        id: num(h.id),
        pageUrl: str(h.pageURL),
        tags: splitTags(h.tags),
        duration: num(h.duration),
        thumbnailUrl: str((isRecord(videos.tiny) ? videos.tiny : {}).thumbnail),
        user: str(h.user),
        files,
      };
    }),
  };
}

/** Shared route-handler body: parse, search, and turn any failure into a safe JSON response. */
export async function handleSearch<P, T>(
  request: Request,
  parse: (input: URLSearchParams) => P,
  search: (params: P) => Promise<SearchResult<T>>,
): Promise<Response> {
  try {
    const params = parse(new URL(request.url).searchParams);
    return Response.json(await search(params), {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=3600` },
    });
  } catch (error) {
    if (error instanceof PixabayError) {
      return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status });
    }
    return Response.json({ error: { code: "upstream", message: "Unexpected error." } }, { status: 500 });
  }
}
