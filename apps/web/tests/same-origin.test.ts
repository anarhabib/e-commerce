import assert from "node:assert/strict";
import test from "node:test";
import { isSameOriginRequest } from "../lib/same-origin";

test("local owner writes require the same host, protocol and port", () => {
  assert.equal(
    isSameOriginRequest("http://localhost:3000", "http://localhost:3000"),
    true,
  );
  assert.equal(
    isSameOriginRequest("http://localhost:3001", "http://localhost:3000"),
    false,
  );
  assert.equal(
    isSameOriginRequest("https://localhost:3000", "http://localhost:3000"),
    false,
  );
});
test("Render HTTPS owner writes accept the configured public origin behind an internal HTTP proxy", () => {
  assert.equal(
    isSameOriginRequest(
      "https://carbignite-web-dev.onrender.com",
      "http://localhost:10000",
      "https://carbignite-web-dev.onrender.com",
    ),
    true,
  );
});
test("a public deployment origin still rejects internal, foreign and missing browser origins", () => {
  for (const origin of [
    null,
    "null",
    "http://localhost:10000",
    "https://evil.example",
    "https://carbignite-web-dev.onrender.com.evil.example",
  ]) {
    assert.equal(
      isSameOriginRequest(
        origin,
        "http://localhost:10000",
        "https://carbignite-web-dev.onrender.com",
      ),
      false,
    );
  }
});
test("trusted URL configuration is normalized while browser Origin must contain only the origin", () => {
  assert.equal(
    isSameOriginRequest(
      "https://shop.example",
      "http://localhost:10000",
      "https://shop.example/",
    ),
    true,
  );
  assert.equal(
    isSameOriginRequest(
      "https://shop.example/path",
      "http://localhost:10000",
      "https://shop.example",
    ),
    false,
  );
});
test("invalid deployment origin configuration fails closed", () => {
  assert.equal(
    isSameOriginRequest(
      "https://shop.example",
      "http://localhost:10000",
      "not a URL",
    ),
    false,
  );
  assert.equal(
    isSameOriginRequest(
      "null",
      "http://localhost:10000",
      "javascript:alert(1)",
    ),
    false,
  );
});
