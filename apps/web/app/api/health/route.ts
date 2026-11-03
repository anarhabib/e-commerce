// Render checks the frontend process without waking the API or PostgreSQL.
export function GET() {
  return Response.json(
    { status: "ok" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
