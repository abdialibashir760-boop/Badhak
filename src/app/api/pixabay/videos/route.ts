import { handleSearch, parseVideoParams, searchVideos } from "@/lib/pixabay";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleSearch(request, parseVideoParams, (params) => searchVideos(params));
}
