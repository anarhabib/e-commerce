import { timingSafeEqual } from "node:crypto";
import { buildApp } from "./app.js";

const app = buildApp();

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return Response.json({ status: "ok" });
    }
    type Method =
      "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
    if (
      !["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].includes(
        request.method,
      )
    ) {
      return new Response(null, { status: 405 });
    }
    // Only our Next server invokes the Function; owner routes still verify the
    // existing signed session token inside Fastify as well.
    const expected = Buffer.from(process.env.API_ORIGIN_SECRET || "");
    const actual = Buffer.from(
      request.headers.get("x-carbignite-origin") || "",
    );
    if (
      !expected.length ||
      expected.length !== actual.length ||
      !timingSafeEqual(expected, actual)
    ) {
      return Response.json(
        { error: "App server authentication required" },
        { status: 401 },
      );
    }
    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : Buffer.from(await request.arrayBuffer());
    if (body && body.length > 7 * 1024 * 1024) {
      return Response.json({ error: "Request is too large" }, { status: 413 });
    }
    const response = await app.inject({
      method: request.method as Method,
      url: url.pathname + url.search,
      headers: Object.fromEntries(request.headers),
      ...(body?.length ? { payload: body } : {}),
    });
    const headers = new Headers();
    for (const [key, value] of Object.entries(response.headers)) {
      if (
        value === undefined ||
        /^(connection|transfer-encoding|keep-alive)$/i.test(key)
      )
        continue;
      for (const item of Array.isArray(value) ? value : [value])
        headers.append(key, String(item));
    }
    return new Response(
      request.method === "HEAD" || [204, 304].includes(response.statusCode)
        ? null
        : new Uint8Array(response.rawPayload),
      { status: response.statusCode, headers },
    );
  },
};
