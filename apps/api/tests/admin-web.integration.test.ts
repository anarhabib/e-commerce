import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import test from "node:test";
import { buildApp } from "../src/app.js";
import { hashPassword } from "../src/modules/admin/auth.js";
import { prisma } from "../src/lib/prisma.js";

// Requires the local Next dev server on 3000 and an unused API port 4000.
test("Next owner proxy keeps tokens private and rejects cross-origin writes", async () => {
  process.env.ADMIN_EMAIL = "web-test@example.com";
  const password = randomUUID();
  process.env.ADMIN_PASSWORD_HASH = hashPassword(password);
  process.env.ADMIN_SESSION_SECRET = randomUUID() + randomUUID();
  const app = buildApp();
  app.log.level = "silent";
  await app.listen({ port: 4000, host: "0.0.0.0" });
  const origin = "http://localhost:3000";
  const mediaIds: string[] = [];
  const productIds: string[] = [];
  try {
    async function assertProtectedRedirect(cookie?: string) {
      const response = await fetch(origin + "/admin", {
        redirect: "manual",
        headers: cookie ? { Cookie: cookie } : {},
      });
      if (response.status === 307)
        assert.equal(response.headers.get("location"), "/admin/login");
      else {
        assert.equal(response.status, 200);
        const html = await response.text();
        assert.match(html, /admin\/login/);
        assert.match(html, /NEXT_REDIRECT|http-equiv="refresh"/);
        assert.doesNotMatch(html, /CONTROL ROOM/);
      }
    }
    for (const path of ["/", "/products", "/admin/login"]) {
      const response = await fetch(origin + path);
      assert.equal(response.status, 200, path);
      if (path === "/admin/login") {
        const html = await response.text();
        assert.match(html, /Owner sign-in/);
        assert.doesNotMatch(html, /admin:setup|apps\/api\/\.env|CONTROL ROOM/);
      }
    }
    await assertProtectedRedirect();
    await assertProtectedRedirect("carbignite-owner-session=forged");
    const expiredPayload = Buffer.from(
      JSON.stringify({
        email: process.env.ADMIN_EMAIL,
        role: "admin",
        exp: Math.floor(Date.now() / 1000) - 1,
      }),
    ).toString("base64url");
    const expiredToken = `${expiredPayload}.${createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(expiredPayload).digest("base64url")}`;
    await assertProtectedRedirect(`carbignite-owner-session=${expiredToken}`);
    const api = origin + "/api/admin/";
    assert.equal((await fetch(api + "overview")).status, 401);
    const body = JSON.stringify({ email: process.env.ADMIN_EMAIL, password });
    assert.equal(
      (
        await fetch(api + "login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "https://untrusted.example",
          },
          body,
        })
      ).status,
      403,
    );
    const login = await fetch(api + "login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body,
    });
    assert.equal(login.status, 200, await login.clone().text());
    assert.deepEqual(await login.json(), { success: true });
    const setCookie = login.headers
      .getSetCookie()
      .find((cookie) => cookie.startsWith("carbignite-owner-session="))!;
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=strict/i);
    assert.match(setCookie, /Path=\/;/i);
    const cookie = setCookie.split(";")[0];
    const suffix = randomUUID();
    const productResponse = await fetch(api + "products", {
      method: "POST",
      headers: {
        Cookie: cookie,
        Origin: origin,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Temporary deletion test",
        description: "Removed after HTTP verification",
        sku: suffix,
        slug: suffix,
        price: "25.00",
        stock: 0,
        active: false,
        category: "TRIM",
      }),
    });
    assert.equal(
      productResponse.status,
      201,
      await productResponse.clone().text(),
    );
    const productId = (await productResponse.json()).id;
    productIds.push(productId);
    assert.equal(
      (
        await fetch(api + `products/${productId}`, {
          method: "DELETE",
          headers: { Origin: origin },
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await fetch(api + `products/${productId}`, {
          method: "DELETE",
          headers: { Cookie: cookie, Origin: "https://untrusted.example" },
        })
      ).status,
      403,
    );
    const deleteResponse = await fetch(api + `products/${productId}`, {
      method: "DELETE",
      headers: { Cookie: cookie, Origin: origin },
    });
    assert.equal(
      deleteResponse.status,
      204,
      await deleteResponse.clone().text(),
    );
    assert.equal(await deleteResponse.text(), "");
    assert.equal(
      await prisma.product.findUnique({ where: { id: productId } }),
      null,
    );
    const adminPage = await fetch(origin + "/admin", {
      headers: { Cookie: cookie },
    });
    assert.equal(adminPage.status, 200);
    assert.match(await adminPage.text(), /CONTROL ROOM/);
    const png =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1cAAAAASUVORK5CYII=";
    const uploaded = await fetch(api + "images", {
      method: "POST",
      headers: {
        Cookie: cookie,
        Origin: origin,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: png }),
    });
    assert.equal(uploaded.status, 201, await uploaded.clone().text());
    const imageUrl = (await uploaded.json()).url;
    mediaIds.push(imageUrl.split("/").pop());
    const imageResponse = await fetch(origin + imageUrl);
    assert.equal(imageResponse.status, 200);
    assert.equal(imageResponse.headers.get("content-type"), "image/png");
    assert.deepEqual(
      Buffer.from(await imageResponse.arrayBuffer()),
      Buffer.from(png, "base64"),
    );
    assert.equal(
      (await fetch(api + "overview", { headers: { Cookie: cookie } })).status,
      200,
    );
    assert.equal(
      (
        await fetch(api + "products", {
          method: "POST",
          headers: {
            Cookie: cookie,
            Origin: "https://untrusted.example",
            "Content-Type": "application/json",
          },
          body: "{}",
        })
      ).status,
      403,
    );
    const logout = await fetch(api + "logout", {
      method: "POST",
      headers: { Cookie: cookie, Origin: origin },
    });
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get("set-cookie")!, /Max-Age=0/i);
    assert.equal(
      (
        await fetch(api + "overview", {
          headers: { Cookie: "carbignite-owner-session=forged" },
        })
      ).status,
      401,
    );
  } finally {
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    await prisma.mediaAsset.deleteMany({ where: { id: { in: mediaIds } } });
    await app.close();
  }
});
