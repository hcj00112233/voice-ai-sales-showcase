import { handleGeneration, liveConfigured } from "@/lib/live";
export const runtime = "nodejs";
export async function GET() {
  return Response.json(
    { configured: liveConfigured() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: Request) {
  return handleGeneration(request);
}
