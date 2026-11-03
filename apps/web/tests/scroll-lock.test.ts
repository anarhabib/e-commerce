import assert from "node:assert/strict";
import test from "node:test";
import { lockBodyScroll } from "../lib/scroll-lock";
function page(overflow = "") {
  return { body: { style: { overflow } } } as Document;
}
test("closing a modal or unmounting restores the original body overflow", () => {
  const owner = page("clip");
  const release = lockBodyScroll(owner);
  assert.equal(owner.body.style.overflow, "hidden");
  release();
  assert.equal(owner.body.style.overflow, "clip");
  release();
  assert.equal(owner.body.style.overflow, "clip");
});
test("nested dialogs remain locked until both owners release", () => {
  const owner = page("auto");
  const first = lockBodyScroll(owner);
  const second = lockBodyScroll(owner);
  first();
  first();
  assert.equal(owner.body.style.overflow, "hidden");
  second();
  assert.equal(owner.body.style.overflow, "auto");
});
test("Strict Mode restart and separate documents keep independent locks", () => {
  const owner = page();
  lockBodyScroll(owner)();
  const release = lockBodyScroll(owner);
  const other = page("scroll");
  const releaseOther = lockBodyScroll(other);
  release();
  assert.equal(owner.body.style.overflow, "");
  assert.equal(other.body.style.overflow, "hidden");
  releaseOther();
  assert.equal(other.body.style.overflow, "scroll");
});
