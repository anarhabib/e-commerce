import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { hashPassword, signIn, isAdmin } from "../src/modules/admin/auth.js";

test("owner authorization, hidden catalog, persistence, server prices and request statuses", async () => {
  process.env.ADMIN_EMAIL = "test-owner@example.com";
  process.env.ADMIN_PASSWORD_HASH = hashPassword("only-for-integration-tests");
  process.env.ADMIN_SESSION_SECRET = randomUUID() + randomUUID();
  const app = buildApp();
  app.log.level = "silent";
  const suffix = randomUUID();
  const ids: string[] = [];
  const orderIds: string[] = [];
  try {
    for (const [method, url] of [
      ["GET", "/admin/overview"],
      ["GET", "/admin/session"],
      ["GET", "/admin/products"],
      ["GET", "/admin/orders"],
      ["GET", "/admin/orders/missing"],
      ["POST", "/admin/products"],
      ["PATCH", "/admin/products/missing"],
      ["DELETE", "/admin/products/missing"],
      ["POST", "/admin/orders"],
      ["PATCH", "/admin/orders/missing"],
      ["POST", "/products"],
      ["PATCH", "/products/missing"],
      ["DELETE", "/products/missing"],
    ] as const) {
      const denied = await app.inject({ method, url });
      assert.equal(denied.statusCode, 401, `${method} ${url}`);
    }
    const badLogin = await app.inject({
      method: "POST",
      url: "/auth/admin/login",
      payload: { email: process.env.ADMIN_EMAIL, password: "wrong" },
    });
    assert.equal(badLogin.statusCode, 401);
    const login = await app.inject({
      method: "POST",
      url: "/auth/admin/login",
      payload: {
        email: process.env.ADMIN_EMAIL,
        password: "only-for-integration-tests",
      },
    });
    assert.equal(login.statusCode, 200);
    const token = login.json().token;
    assert.equal(isAdmin(token), true);
    assert.equal(isAdmin(token + "tampered"), false);
    const headers = { authorization: `Bearer ${token}` };
    const payload = {
      name: "Temporary admin test",
      description: "Removed after testing",
      sku: suffix,
      slug: suffix,
      category: "TRIM",
      price: "125.49",
      stock: 4,
      patterns: ["Forged"],
      finishes: ["Matte"],
      active: false,
      make: `Admin-${suffix}`,
      model: "Test",
      yearFrom: 2015,
      yearTo: 2020,
    };
    const created = await app.inject({
      method: "POST",
      url: "/admin/products",
      headers,
      payload,
    });
    assert.equal(created.statusCode, 201, created.body);
    const product = created.json();
    ids.push(product.id);
    assert.equal(product.priceCents, 12549);
    assert.equal(
      (await app.inject({ method: "GET", url: `/products/${product.id}` }))
        .statusCode,
      404,
    );
    assert.equal(
      (
        await app.inject({ method: "GET", url: `/products?search=${suffix}` })
      ).json().total,
      0,
    );
    assert.equal(
      (
        await app.inject({
          method: "GET",
          url: `/products/filters?make=${payload.make}`,
        })
      )
        .json()
        .vehicles.some((v: { make: string }) => v.make === payload.make),
      false,
    );
    assert.equal(
      (
        await app.inject({
          method: "PATCH",
          url: `/products/${product.id}`,
          headers,
          payload: { yearTo: 2010 },
        })
      ).statusCode,
      400,
    );
    assert.equal(
      (
        await app.inject({
          method: "PATCH",
          url: `/admin/products/${product.id}`,
          headers,
          payload: { ...payload, price: "1.999" },
        })
      ).statusCode,
      400,
    );
    const visible = await app.inject({
      method: "PATCH",
      url: `/admin/products/${product.id}`,
      headers,
      payload: { ...payload, active: true },
    });
    assert.equal(visible.statusCode, 200, visible.body);
    assert.equal(
      (await app.inject({ method: "GET", url: `/products/${product.id}` }))
        .statusCode,
      200,
    );
    const id = randomUUID();
    orderIds.push(id);
    const request = {
      id,
      customer: {
        name: "Integration Customer",
        email: "test@example.com",
        note: "Temporary test",
      },
      items: [
        {
          productId: product.id,
          pattern: "Forged",
          finish: "Matte",
          quantity: 2,
        },
      ],
    };
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/admin/orders",
          headers,
          payload: { ...request, totalCents: 1 },
        })
      ).statusCode,
      400,
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/admin/orders",
          headers,
          payload: {
            ...request,
            items: [{ ...request.items[0], finish: "Gloss" }],
          },
        })
      ).statusCode,
      400,
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/admin/orders",
          headers,
          payload: {
            ...request,
            items: [
              { ...request.items[0], quantity: 3 },
              { ...request.items[0], quantity: 2 },
            ],
          },
        })
      ).statusCode,
      400,
    );
    const saved = await app.inject({
      method: "POST",
      url: "/admin/orders",
      headers,
      payload: request,
    });
    assert.equal(saved.statusCode, 201, saved.body);
    assert.equal(saved.json().totalCents, 25098);
    assert.equal(saved.json().status, "requested");
    assert.equal(saved.json().items[0].name, product.name);
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/admin/orders",
          headers,
          payload: request,
        })
      ).json().id,
      id,
    );
    assert.equal(await prisma.orderRequest.count({ where: { id } }), 1);
    assert.equal(
      (await prisma.product.findUniqueOrThrow({ where: { id: product.id } }))
        .stock,
      4,
    );
    assert.equal(
      (
        await app.inject({
          method: "PATCH",
          url: `/admin/orders/${id}`,
          headers,
          payload: { status: "paid" },
        })
      ).statusCode,
      400,
    );
    for (const status of [
      "in_review",
      "quoted",
      "in_production",
      "shipped",
      "cancelled",
    ]) {
      assert.equal(
        (
          await app.inject({
            method: "PATCH",
            url: `/admin/orders/${id}`,
            headers,
            payload: { status },
          })
        ).statusCode,
        200,
      );
      assert.equal(
        (
          await app.inject({
            method: "GET",
            url: `/admin/orders/${id}`,
            headers,
          })
        ).json().status,
        status,
      );
    }
    const listing = await app.inject({
      method: "GET",
      url: `/admin/products?search=${suffix}`,
      headers,
    });
    assert.equal(listing.json().total, 1);
    const overview = await app.inject({
      method: "GET",
      url: "/admin/overview",
      headers,
    });
    assert.equal(overview.statusCode, 200);
    assert.ok(overview.json().orders >= 1);
    const copy = await app.inject({
      method: "POST",
      url: "/admin/products",
      headers,
      payload: {
        ...payload,
        name: "Temporary admin test (copy)",
        sku: `${suffix}-copy`,
        slug: `${suffix}-copy`,
        active: false,
        stock: 0,
      },
    });
    assert.equal(copy.statusCode, 201, copy.body);
    ids.push(copy.json().id);
    assert.notEqual(copy.json().id, product.id);
    assert.equal(copy.json().stock, 0);
    assert.equal(copy.json().active, false);
    assert.equal(
      (await prisma.product.findUniqueOrThrow({ where: { id: product.id } }))
        .stock,
      4,
    );
    const deleted = await app.inject({
      method: "DELETE",
      url: `/admin/products/${product.id}`,
      headers,
    });
    assert.equal(deleted.statusCode, 204, deleted.body);
    assert.equal(
      (await app.inject({ method: "GET", url: `/products/${product.id}` }))
        .statusCode,
      404,
    );
    const preserved = await prisma.orderRequest.findUniqueOrThrow({
      where: { id },
    });
    assert.equal(preserved.totalCents, 25098);
    assert.deepEqual(preserved.items, saved.json().items);
    assert.equal(
      (
        await app.inject({
          method: "DELETE",
          url: `/admin/products/${product.id}`,
          headers,
        })
      ).statusCode,
      404,
    );
    process.env.ADMIN_SESSION_SECRET = randomUUID() + randomUUID();
    assert.equal(isAdmin(token), false);
    const newToken = signIn(
      process.env.ADMIN_EMAIL,
      "only-for-integration-tests",
    );
    assert.ok(newToken);
    for (let i = 0; i < 9; i++)
      await app.inject({
        method: "POST",
        url: "/auth/admin/login",
        payload: { email: process.env.ADMIN_EMAIL, password: "wrong" },
      });
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/auth/admin/login",
          payload: { email: process.env.ADMIN_EMAIL, password: "wrong" },
        })
      ).statusCode,
      429,
    );
  } finally {
    await prisma.orderRequest.deleteMany({ where: { id: { in: orderIds } } });
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
    await app.close();
  }
});
