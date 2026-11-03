import assert from "node:assert/strict";
import test from "node:test";
import { ownerConfiguration } from "../scripts/admin-config.js";

test("first-time owner configuration preserves database settings and hashes the password", () => {
  const original =
    'DATABASE_URL="postgresql://local/example"\r\nPORT=4000\r\nADMIN_EMAIL=""\r\nADMIN_PASSWORD_HASH=""\r\nADMIN_SESSION_SECRET=""\r\n';
  const configured = ownerConfiguration(
    original,
    "owner@example.com",
    "test-password-only",
  );
  assert.ok(configured.includes('DATABASE_URL="postgresql://local/example"'));
  assert.ok(configured.includes("PORT=4000"));
  assert.ok(configured.includes('ADMIN_EMAIL="owner@example.com"'));
  assert.ok(!configured.includes("test-password-only"));
  assert.match(
    configured,
    /^ADMIN_PASSWORD_HASH="[a-f0-9]{32}:[a-f0-9]{128}"$/m,
  );
  assert.match(configured, /^ADMIN_SESSION_SECRET="[a-f0-9]{96}"$/m);
  assert.equal((configured.match(/^ADMIN_EMAIL=/gm) || []).length, 1);
  assert.throws(
    () =>
      ownerConfiguration(configured, "other@example.com", "different-password"),
    /already exist/,
  );
});

test("owner setup rejects invalid credentials before generating configuration", () => {
  assert.throws(
    () => ownerConfiguration("", "invalid", "test-password-only"),
    /email/,
  );
  assert.throws(
    () => ownerConfiguration("", 'owner"@example.com', "test-password-only"),
    /email/,
  );
  assert.throws(
    () => ownerConfiguration("", "owner@example.com", "short"),
    /12 and 256/,
  );
});
