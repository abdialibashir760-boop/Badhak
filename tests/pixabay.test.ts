import { describe, expect, it } from "vitest";
import {
  PixabayError,
  buildUrl,
  handleSearch,
  parseImageParams,
  parseVideoParams,
  searchImages,
  searchVideos,
  type Fetcher,
} from "@/lib/pixabay";

const KEY = "secret-test-key";
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const imageParams = () => parseImageParams(new URLSearchParams({ q: "çay & simit" }));

describe("pixabay params", () => {
  it("applies defaults", () => {
    const p = parseImageParams(new URLSearchParams());
    expect(p).toMatchObject({ q: "", page: 1, perPage: 20, safesearch: true, imageType: "all" });
  });

  it("rejects bad values", () => {
    for (const qs of ["per_page=2", "per_page=500", "page=0", "page=x", "image_type=gif", "lang=english"]) {
      expect(() => parseImageParams(new URLSearchParams(qs)), qs).toThrow(PixabayError);
    }
    expect(() => parseImageParams(new URLSearchParams({ q: "a".repeat(101) }))).toThrow(PixabayError);
    expect(() => parseVideoParams(new URLSearchParams("video_type=photo"))).toThrow(PixabayError);
  });
});

describe("pixabay buildUrl", () => {
  it("puts the key in the query string and encodes the search", () => {
    const url = new URL(buildUrl("https://pixabay.com/api/", imageParams(), KEY));
    expect(url.searchParams.get("key")).toBe(KEY);
    expect(url.searchParams.get("q")).toBe("çay & simit");
    expect(url.searchParams.get("image_type")).toBe("all");
    expect(url.searchParams.has("video_type")).toBe(false);
  });

  it("uses video options for videos", () => {
    const params = parseVideoParams(new URLSearchParams("video_type=film"));
    const url = new URL(buildUrl("https://pixabay.com/api/videos/", params, KEY));
    expect(url.pathname).toBe("/api/videos/");
    expect(url.searchParams.get("video_type")).toBe("film");
  });
});

describe("pixabay search", () => {
  it("requires a key", async () => {
    const prev = process.env.PIXABAY_API_KEY;
    delete process.env.PIXABAY_API_KEY;
    try {
      await expect(searchImages(imageParams(), { fetcher: async () => json({}) })).rejects.toMatchObject({
        code: "not_configured",
        status: 503,
      });
    } finally {
      if (prev !== undefined) process.env.PIXABAY_API_KEY = prev;
    }
  });

  it("normalises image hits and calls the images endpoint", async () => {
    let called = "";
    const fetcher: Fetcher = async (url) => {
      called = url;
      return json({
        total: 1,
        totalHits: 1,
        hits: [{ id: 7, pageURL: "p", tags: "tea, glass", previewURL: "a", webformatURL: "b", largeImageURL: "c", imageWidth: 10, imageHeight: 5, user: "u", views: 99 }],
      });
    };
    const result = await searchImages(imageParams(), { apiKey: KEY, fetcher });
    expect(called.startsWith("https://pixabay.com/api/?")).toBe(true);
    expect(result.hits[0]).toEqual({ id: 7, pageUrl: "p", tags: ["tea", "glass"], previewUrl: "a", webUrl: "b", largeUrl: "c", width: 10, height: 5, user: "u" });
  });

  it("normalises video hits and skips sizes without a url", async () => {
    const fetcher: Fetcher = async () =>
      json({
        total: 1,
        totalHits: 1,
        hits: [{ id: 3, pageURL: "p", tags: "sea", duration: 12, user: "u", videos: { large: { url: "", width: 0, height: 0, size: 0 }, tiny: { url: "t", width: 1, height: 1, size: 2, thumbnail: "th" } } }],
      });
    const result = await searchVideos(parseVideoParams(new URLSearchParams("q=sea")), { apiKey: KEY, fetcher });
    expect(result.hits[0].files).toEqual({ tiny: { url: "t", width: 1, height: 1, size: 2 } });
    expect(result.hits[0].thumbnailUrl).toBe("th");
  });

  it("maps upstream failures to safe errors", async () => {
    const cases: [Response | Error, string, number][] = [
      [json("x", 429), "rate_limited", 429],
      [json("x", 400), "invalid_request", 400],
      [json("x", 401), "not_configured", 503],
      [json("x", 500), "upstream", 502],
      [new Response("not json", { status: 200 }), "upstream", 502],
      [json({ nope: true }), "upstream", 502],
      [new Error(`fetch failed https://pixabay.com/api/?key=${KEY}`), "upstream", 502],
    ];
    for (const [outcome, code, status] of cases) {
      const fetcher: Fetcher = async () => {
        if (outcome instanceof Error) throw outcome;
        return outcome.clone();
      };
      const err = await searchImages(imageParams(), { apiKey: KEY, fetcher }).catch((e) => e);
      expect(err).toMatchObject({ code, status });
      expect(String(err.message)).not.toContain(KEY);
    }
  });
});

describe("pixabay handleSearch", () => {
  it("returns JSON errors without leaking the key", async () => {
    const res = await handleSearch(
      new Request("http://localhost/api/pixabay/images?per_page=1"),
      parseImageParams,
      (p) => searchImages(p, { apiKey: KEY, fetcher: async () => json({}) }),
    );
    expect(res.status).toBe(400);
    expect(await res.text()).not.toContain(KEY);
  });

  it("hides unexpected errors", async () => {
    const res = await handleSearch(new Request("http://localhost/x"), parseImageParams, async () => {
      throw new Error(`boom ${KEY}`);
    });
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain(KEY);
  });
});
