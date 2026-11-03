import { customerAuth } from "@/lib/customer-auth";
import type { NextRequest } from "next/server";

type Context = { params: Promise<{ path: string[] }> };
async function handle(request: NextRequest, context: Context) {
  const auth = customerAuth();
  if (!auth)
    return Response.json(
      { error: "Customer accounts are not configured" },
      { status: 503 },
    );
  const handlers = auth.handler();
  const method = request.method as keyof typeof handlers;
  const handler = handlers[method];
  if (!handler) return new Response(null, { status: 405 });
  return handler(request, context);
}
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
