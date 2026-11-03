import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!process.env.API_URL)
    return new Response("Image service unavailable", { status: 503 });
  try {
    const response = await fetch(
      `${process.env.API_URL}/media/${encodeURIComponent(id)}`,
      { signal: AbortSignal.timeout(15000) },
    );
    if (!response.ok)
      return new Response("Image unavailable", { status: response.status });
    return new Response(response.body, {
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Image service unavailable", { status: 503 });
  }
}
