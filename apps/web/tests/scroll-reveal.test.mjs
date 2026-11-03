import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Exercise the actual effect body without requiring a browser or mounting the whole app.
const source = readFileSync(new URL("../features/carbignite/storefront-shell.tsx", import.meta.url), "utf8");
const start = source.indexOf("    const element = root.current!;");
assert.ok(start >= 0);
const end = source.indexOf("  }, []);", start);
assert.ok(end > start);
const script = ts.transpileModule(`(function () {${source.slice(start, end)}})()`, {
  compilerOptions: { target: ts.ScriptTarget.ES2020 },
}).outputText;

function target(name) {
  const classes = new Set();
  return {
    name,
    classList: { add: (value) => classes.add(value), remove: (value) => classes.delete(value), contains: (value) => classes.has(value) },
    style: { setProperty() {} },
    matches: () => false,
  };
}
function fixture(reduced = false) {
  const nodes = ["collection", "material controls", "approach", "custom part"].map(target);
  const element = Object.assign(target("root"), { querySelectorAll: () => nodes });
  const observers = [];
  const mutations = [];
  const listeners = new Set();
  const preference = {
    matches: reduced,
    addEventListener: (_, listener) => listeners.add(listener),
    removeEventListener: (_, listener) => listeners.delete(listener),
  };
  class IntersectionObserver {
    observed = new Set();
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(node) { this.observed.add(node); }
    unobserve(node) { this.observed.delete(node); }
    disconnect() { this.observed.clear(); }
    reveal() { this.callback([...this.observed].map((node) => ({ target: node, isIntersecting: true }))); }
  }
  class MutationObserver {
    constructor(callback) { this.callback = callback; mutations.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  const context = { root: { current: element }, matchMedia: () => preference, window: { IntersectionObserver }, IntersectionObserver, MutationObserver };
  return {
    nodes, element, observers, mutations, listeners, context,
    setup: () => runInNewContext(script, context),
    motion(value) { preference.matches = value; for (const listener of listeners) listener(); },
  };
}

test("Strict Mode and Fast Refresh reobserve existing reveal nodes and reveal every section", () => {
  const f = fixture();
  const cleanup = f.setup();
  assert.equal(f.observers[0].observed.size, 4);
  cleanup();
  assert.equal(f.element.classList.contains("motion-ready"), false);
  assert.equal(f.listeners.size, 0);
  assert.equal(f.mutations[0].disconnected, true);
  const cleanupAgain = f.setup();
  assert.equal(f.observers[1].observed.size, 4);
  f.observers[1].reveal();
  for (const node of f.nodes) assert.ok(node.classList.contains("is-visible"), node.name);
  cleanupAgain();
  f.setup();
  assert.equal(f.observers[2].observed.size, 0, "already visible sections stay visible");
});

test("reduced motion in either direction never re-hides sections or newly added cards", () => {
  for (const initial of [false, true]) {
    const f = fixture(initial);
    f.setup();
    f.motion(true);
    assert.equal(f.element.classList.contains("motion-ready"), false);
    const card = target("new product card");
    f.nodes.push(card);
    f.mutations[0].callback();
    f.motion(false);
    for (const node of f.nodes) assert.ok(node.classList.contains("is-visible"), node.name);
    assert.equal(f.observers[0].observed.size, 0);
  }
});

test("new hidden content is observed, including nodes already carrying reveal", () => {
  const f = fixture();
  f.setup();
  const card = target("new product card");
  card.classList.add("reveal");
  f.nodes.push(card);
  f.mutations[0].callback();
  assert.ok(f.observers[0].observed.has(card));
});

test("missing observation support clears a stale motion-ready marker", () => {
  const f = fixture();
  f.element.classList.add("motion-ready");
  delete f.context.window.IntersectionObserver;
  f.setup();
  assert.equal(f.element.classList.contains("motion-ready"), false);
});