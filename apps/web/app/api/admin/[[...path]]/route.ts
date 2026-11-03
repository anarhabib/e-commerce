import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ownerCookieName, ownerCookieOptions } from "@/lib/admin-session";

const cookieName = ownerCookieName;
async function handle(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await context.params;
  const target = path.join("/");
  const headers = { "Cache-Control": "no-store" };
  if (
    !/^(login|logout|session|overview|images|products(?:\/[^/]+)?|orders(?:\/[^/]+)?)$/.test(
      target,
    )
  )
    return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  if (
    request.method !== "GET" &&
    request.headers.get("origin") !== request.nextUrl.origin
  )
    return NextResponse.json(
      { error: "Same-origin request required" },
      { status: 403, headers },
    );
  const jar = await cookies();
  const options = ownerCookieOptions;
  if (target === "logout" && request.method === "POST") {
    jar.set("carbignite-owner", "", {
      ...options,
      path: "/api/admin",
      maxAge: 0,
    });
    jar.set(cookieName, "", { ...options, maxAge: 0 });
    return NextResponse.json({ success: true }, { headers });
  }
  const token = jar.get(cookieName)?.value;
  if (target !== "login" && !token)
    return NextResponse.json(
      { error: "Owner sign-in required" },
      { status: 401, headers },
    );
  if (target === "login" && request.method !== "POST")
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405, headers },
    );
  if (!process.env.API_URL)
    return NextResponse.json(
      { error: "API_URL is not configured" },
      { status: 503, headers },
    );
  try {
    const body =
      request.method === "GET"
        ? undefined
        : (await request.text()) || undefined;
    const response = await fetch(
      `${process.env.API_URL}${target === "login" ? "/auth/admin/login" : `/admin/${path.map(encodeURIComponent).join("/")}`}${request.nextUrl.search}`,
      {
        method: request.method,
        cache: "no-store",
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(token && target !== "login"
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        body,
        signal: AbortSignal.timeout(15000),
      },
    );
    if (response.status === 204)
      return new NextResponse(null, { status: 204, headers });
    const data = await response.json();
    if (target === "login" && response.ok) {
      jar.set("carbignite-owner", "", {
        ...options,
        path: "/api/admin",
        maxAge: 0,
      });
      jar.set(cookieName, data.token, options);
      return NextResponse.json({ success: true }, { headers });
    }
    if (response.status === 401)
      jar.set(cookieName, "", { ...options, maxAge: 0 });
    return NextResponse.json(data, { status: response.status, headers });
  } catch {
    return NextResponse.json(
      { error: "The workshop API is unavailable. Please try again." },
      { status: 503, headers },
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
