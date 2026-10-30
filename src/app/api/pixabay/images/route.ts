import { handleSearch, parseImageParams, searchImages } from "@/lib/pixabay";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleSearch(request, parseImageParams, (params) => searchImages(params));
}
