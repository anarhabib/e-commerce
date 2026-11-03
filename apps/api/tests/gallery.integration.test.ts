import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { hashPassword, signIn } from "../src/modules/admin/auth.js";

test("authenticated uploads, public image bytes, gallery ordering and removal persist", async () => {
  process.env.ADMIN_EMAIL = "gallery-test@example.com";
  process.env.ADMIN_PASSWORD_HASH = hashPassword("gallery-test-password");
  process.env.ADMIN_SESSION_SECRET = randomUUID() + randomUUID();
  const headers = {
    authorization: `Bearer ${signIn(process.env.ADMIN_EMAIL, "gallery-test-password")}`,
  };
  const app = buildApp();
  app.log.level = "silent";
  const assetIds: string[] = [];
  let productId: string | undefined;
  const png =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1cAAAAASUVORK5CYII=";
  try {
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/admin/images",
          payload: { data: png },
        })
      ).statusCode,
      401,
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/admin/images",
          headers,
          payload: { data: Buffer.from("<svg>bad</svg>").toString("base64") },
        })
      ).statusCode,
      400,
    );
    const urls: string[] = [];
    for (let index = 0; index < 2; index++) {
      const upload = await app.inject({
        method: "POST",
        url: "/admin/images",
        headers,
        payload: { data: png },
      });
      assert.equal(upload.statusCode, 201, upload.body);
      const url = upload.json().url;
      urls.push(url);
      assetIds.push(url.split("/").pop());
      const image = await app.inject({ method: "GET", url });
      assert.equal(image.statusCode, 200);
      assert.equal(image.headers["content-type"], "image/png");
      assert.deepEqual(image.rawPayload, Buffer.from(png, "base64"));
    }
    const suffix = randomUUID();
    const created = await app.inject({
      method: "POST",
      url: "/products",
      headers,
      payload: {
        name: "Gallery test",
        slug: suffix,
        sku: suffix,
        description: "Temporary gallery test",
        category: "TRIM",
        priceCents: 12000,
        imageUrls: urls,
      },
    });
    assert.equal(created.statusCode, 201, created.body);
    productId = created.json().id;
    assert.deepEqual(created.json().imageUrls, urls);
    assert.equal(created.json().imageUrl, urls[0]);
    const changed = await app.inject({
      method: "PATCH",
      url: `/products/${productId}`,
      headers,
      payload: { imageUrls: [urls[1]] },
    });
    assert.equal(changed.statusCode, 200);
    assert.equal(changed.json().imageUrl, urls[1]);
    const read = await app.inject({
      method: "GET",
      url: `/products/${productId}`,
    });
    assert.deepEqual(read.json().imageUrls, [urls[1]]);
    assert.equal(
      (
        await app.inject({
          method: "PATCH",
          url: `/products/${productId}`,
          headers,
          payload: { imageUrls: ["javascript:alert(1)"] },
        })
      ).statusCode,
      400,
    );
    assert.equal(
      (
        await app.inject({
          method: "PATCH",
          url: `/products/${productId}`,
          headers,
          payload: { imageUrls: [urls[0], urls[0]] },
        })
      ).statusCode,
      400,
    );
    const cleared = await app.inject({
      method: "PATCH",
      url: `/products/${productId}`,
      headers,
      payload: { imageUrls: [] },
    });
    assert.equal(cleared.json().imageUrl, null);
    assert.deepEqual(
      (await prisma.product.findUniqueOrThrow({ where: { id: productId } }))
        .imageUrls,
      [],
    );
  } finally {
    if (productId) await prisma.product.delete({ where: { id: productId } });
    await prisma.mediaAsset.deleteMany({ where: { id: { in: assetIds } } });
    await app.close();
  }
});
