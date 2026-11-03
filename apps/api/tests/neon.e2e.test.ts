import assert from "node:assert/strict";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import test from "node:test";
import {
  createRealtimeClient,
  nodePostgresParsers,
  type SealedLiveQuery,
} from "@neon/realtime/client";
import { prisma } from "../src/lib/prisma.js";
import {
  objectStorage,
  closeObjectStorage,
} from "../src/lib/object-storage.js";
import WebSocket from "ws";

test(
  "Neon database, private storage, hosted API, customer auth and live orders work through production Next",
  { timeout: 240_000 },
  async () => {
    const root = resolve(import.meta.dirname, "../../..");
    const neonEnvPath = [".env", ".env.local"]
      .map((name) => resolve(root, name))
      .find(existsSync);
    assert.ok(
      neonEnvPath,
      "Pull Neon's environment variables before running this test",
    );
    const neon = parseEnv(readFileSync(neonEnvPath, "utf8"));
    const web = parseEnv(
      readFileSync(resolve(root, "apps/web/.env.local"), "utf8"),
    );
    const apiUrl = neon.NEON_FUNCTION_HELLO_BASE_URL.replace(/\/$/, "");
    const remoteFrontend = process.env.NEON_E2E_WEB_URL;
    if (remoteFrontend) {
      const target = new URL(remoteFrontend);
      assert.equal(target.protocol, "https:");
      assert.equal(
        target.origin,
        process.env.APP_ORIGIN,
        "Remote test target must match the configured app origin",
      );
    }
    const nextUrl = remoteFrontend
      ? new URL(remoteFrontend).origin
      : "http://localhost:4317";
    const originHeaders = {
      "x-carbignite-origin": process.env.API_ORIGIN_SECRET!,
    };
    assert.ok(
      process.env.ADMIN_EMAIL &&
        process.env.ADMIN_PASSWORD_HASH &&
        process.env.ADMIN_SESSION_SECRET,
      "Configure existing owner credentials before running the owner endpoint tests",
    );
    const payload = Buffer.from(
      JSON.stringify({
        email: process.env.ADMIN_EMAIL,
        role: "admin",
        exp: Math.floor(Date.now() / 1000) + 600,
      }),
    ).toString("base64url");
    const token =
      payload +
      "." +
      createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
        .update(payload)
        .digest("base64url");
    const ownerHeaders = {
      ...originHeaders,
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const imageIds: string[] = [];
    const orderId = randomUUID();
    const email = `carbignite-e2e-${randomUUID()}@example.com`;
    const password = randomBytes(24).toString("base64url");
    let userId: string | undefined;
    let client: ReturnType<typeof createRealtimeClient> | undefined;
    let testSocket: WebSocket | undefined;
    let nextOutput = "";
    const next = remoteFrontend
      ? undefined
      : spawn(
          process.execPath,
          [
            resolve(root, "apps/web/node_modules/next/dist/bin/next"),
            "start",
            "--port",
            "4317",
          ],
          {
            cwd: resolve(root, "apps/web"),
            windowsHide: true,
            env: {
              ...process.env,
              ...web,
              API_URL: apiUrl,
              APP_ORIGIN: nextUrl,
              NODE_ENV: "production",
            },
            stdio: ["ignore", "pipe", "pipe"],
          },
        );
    next?.stdout?.on("data", (chunk) => {
      nextOutput += chunk;
    });
    next?.stderr?.on("data", (chunk) => {
      nextOutput += chunk;
    });
    const request = (url: string, init: RequestInit = {}) =>
      fetch(url, { ...init, signal: AbortSignal.timeout(30_000) });
    const cookies = new Map<string, string>();
    async function authRequest(path: string, body?: object) {
      const response = await request(`${nextUrl}/api/auth/${path}`, {
        method: body ? "POST" : "GET",
        headers: {
          Origin: nextUrl,
          "Content-Type": "application/json",
          Cookie: [...cookies]
            .map(([key, value]) => `${key}=${value}`)
            .join("; "),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      for (const cookie of response.headers.getSetCookie()) {
        const pair = cookie.split(";", 1)[0];
        const split = pair.indexOf("=");
        const key = pair.slice(0, split),
          value = pair.slice(split + 1);
        if (!value || /max-age=0(?:;|$)/i.test(cookie)) cookies.delete(key);
        else cookies.set(key, value);
      }
      return response;
    }
    const cookieHeader = () =>
      [...cookies].map(([key, value]) => `${key}=${value}`).join("; ");
    try {
      let ready = false;
      for (let attempt = 0; attempt < 50; attempt++) {
        if (next && next.exitCode !== null)
          throw new Error(
            `Next production server exited: ${nextOutput.slice(-1500)}`,
          );
        try {
          if ((await request(`${nextUrl}/api/account`)).status === 401) {
            ready = true;
            break;
          }
        } catch {}
        await new Promise((done) => setTimeout(done, 500));
      }
      assert.ok(
        ready,
        "Frontend did not respond with the expected signed-out account status",
      );
      const health = await request(`${nextUrl}/api/health`);
      assert.equal(health.status, 200);
      assert.equal((await health.json()).status, "ok");
      assert.equal((await request(`${apiUrl}/health`)).status, 200);
      assert.equal(
        (await request(`${apiUrl}/products`)).status,
        401,
        "Function origin protection must reject direct browser calls",
      );
      const catalog = await request(`${apiUrl}/products`, {
        headers: originHeaders,
      });
      assert.equal(catalog.status, 200, await catalog.text());
      const shop = await request(`${nextUrl}/shop`);
      assert.equal(shop.status, 200);
      assert.match(await shop.text(), /CARBIGNITE/);
      console.log(
        "PASS PostgreSQL: hosted API reads Neon and production /shop renders",
      );

      const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1cAAAAASUVORK5CYII=",
        "base64",
      );
      assert.equal(
        (
          await request(`${apiUrl}/admin/images`, {
            method: "POST",
            headers: originHeaders,
            body: "{}",
          })
        ).status,
        401,
      );
      const uploaded = await request(`${apiUrl}/admin/images`, {
        method: "POST",
        headers: ownerHeaders,
        body: JSON.stringify({ data: png.toString("base64") }),
      });
      const uploadedBody = await uploaded.json();
      assert.equal(uploaded.status, 201, JSON.stringify(uploadedBody));
      imageIds.push(uploadedBody.url.split("/").pop());
      const asset = await prisma.mediaAsset.findUniqueOrThrow({
        where: { id: imageIds[0] },
      });
      assert.ok(asset.objectKey);
      assert.equal(asset.data, null);
      assert.deepEqual(await objectStorage()!.download(asset.objectKey), png);
      const served = await request(`${nextUrl}${uploadedBody.url}`);
      assert.equal(served.status, 200);
      assert.equal(served.headers.get("content-type"), "image/png");
      assert.deepEqual(Buffer.from(await served.arrayBuffer()), png);
      const legacy = await prisma.mediaAsset.create({
        data: { contentType: "image/png", data: png },
      });
      imageIds.push(legacy.id);
      const legacyResponse = await request(`${nextUrl}/media/${legacy.id}`);
      assert.equal(legacyResponse.status, 200);
      assert.deepEqual(Buffer.from(await legacyResponse.arrayBuffer()), png);
      console.log(
        "PASS Object Storage: authenticated upload -> private S3 object -> database key -> Next image; legacy image also reads",
      );

      const ownerCookie = `carbignite-owner-session=${token}`;
      const ownerSession = await request(`${nextUrl}/api/admin/session`, {
        headers: { Cookie: ownerCookie },
      });
      assert.equal(ownerSession.status, 200);
      const feedResponse = await request(`${nextUrl}/api/admin/live-orders`, {
        method: "POST",
        headers: { Cookie: ownerCookie, Origin: nextUrl },
      });
      assert.equal(feedResponse.status, 200);
      const feed = (await feedResponse.json()) as {
        enabled: boolean;
        url: string;
        query: SealedLiveQuery<{ total: number; latest: string }>;
      };
      assert.ok(feed.enabled);
      client = createRealtimeClient({
        url: feed.url,
        parsers: nodePostgresParsers,
        webSocketFactory(url, protocols) {
          testSocket = new WebSocket(url, protocols, {
            origin: remoteFrontend ? nextUrl : "http://localhost:3000",
          });
          return testSocket;
        },
      });
      const subscription = client.subscribe(feed.query);
      let initialTotal: number | undefined;
      let initialDone!: () => void;
      let changedDone!: () => void;
      let failed!: (error: unknown) => void;
      const initial = new Promise<void>((done) => {
        initialDone = done;
      });
      const changed = new Promise<void>((done, reject) => {
        changedDone = done;
        failed = reject;
      });
      const cancelListener = subscription.onChange((snapshot) => {
        if (snapshot.status === "error") {
          failed(snapshot.error);
          return;
        }
        if (snapshot.status !== "live" || !snapshot.data?.length) return;
        const total = Number(snapshot.data[0].total);
        if (initialTotal === undefined) {
          initialTotal = total;
          initialDone();
        } else if (total === initialTotal + 1) changedDone();
      });
      const limit = new Promise<never>((_, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Realtime initial/change event timed out")),
          45_000,
        );
        timer.unref();
      });
      await Promise.race([initial, changed, limit]);
      await prisma.orderRequest.create({
        data: {
          id: orderId,
          customer: {
            name: "Temporary Neon E2E",
            email,
            phone: "",
            address: "",
            city: "",
            region: "",
            postal: "",
            country: "",
            note: "Temporary test fixture",
          },
          items: [],
          totalCents: 0,
        },
      });
      await Promise.race([changed, limit]);
      cancelListener();
      client.close();
      testSocket?.terminate();
      client = undefined;
      console.log(
        "PASS Realtime: owner-authorized sealed query receives the committed Neon order insert without polling",
      );

      const signup = await authRequest("sign-up/email", {
        name: "Temporary Neon E2E",
        email,
        password,
      });
      const signupData = await signup.json();
      userId = signupData.user?.id;
      assert.ok(
        signup.ok,
        `Customer signup returned HTTP ${signup.status}: ${signupData.error?.message || signupData.message || "request failed"}`,
      );
      assert.ok(userId, "Neon Auth did not return the new test user");
      assert.equal(
        (
          await request(`${nextUrl}/api/account`, {
            headers: { Cookie: cookieHeader() },
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await request(`${nextUrl}/api/admin/session`, {
            headers: { Cookie: cookieHeader() },
          })
        ).status,
        401,
        "Customer sign-in must not grant owner privileges",
      );
      assert.equal((await authRequest("sign-out", {})).status, 200);
      assert.equal(
        (
          await request(`${nextUrl}/api/account`, {
            headers: { Cookie: cookieHeader() },
          })
        ).status,
        401,
      );
      const signin = await authRequest("sign-in/email", { email, password });
      assert.equal(signin.status, 200, "Customer sign-in failed");
      const restored = await request(`${nextUrl}/api/account`, {
        headers: { Cookie: cookieHeader() },
      });
      assert.equal(restored.status, 200);
      assert.equal((await restored.json()).id, userId);
      console.log(
        "PASS Neon Auth: sign-up, protected account, owner isolation, sign-out, sign-in and restored session through same-origin Next routes",
      );
      console.log(
        "PASS Functions: existing catalog, media and protected owner routes run at the deployed Function URL",
      );
    } finally {
      client?.close();
      testSocket?.terminate();
      try {
        // Every delete is restricted to a fixture created by this test.
        if (userId) {
          const deleted = await authRequest("delete-user", { password }).catch(
            () => undefined,
          );
          if (!deleted?.ok) {
            assert.match(email, /^carbignite-e2e-[a-f0-9-]+@example\.com$/);
            await prisma.$executeRaw`DELETE FROM neon_auth."user" WHERE id::text = ${userId} AND email = ${email}`;
          }
        }
        await prisma.orderRequest.deleteMany({ where: { id: orderId } });
        const assets = await prisma.mediaAsset.findMany({
          where: { id: { in: imageIds } },
        });
        for (const asset of assets)
          if (asset.objectKey) await objectStorage()!.remove(asset.objectKey);
        await prisma.mediaAsset.deleteMany({ where: { id: { in: imageIds } } });
      } finally {
        await prisma.$disconnect().catch(() => {});
        closeObjectStorage();
        if (next) {
          next.kill();
          await new Promise<void>((done) => {
            if (next.exitCode !== null) return done();
            next.once("exit", () => done());
          });
        }
        console.log(
          remoteFrontend
            ? "Cleaned up test-only accounts, orders and images; public frontend remains running"
            : "Cleaned up test-only accounts, orders, images and the temporary production server",
        );
      }
    }
  },
);
