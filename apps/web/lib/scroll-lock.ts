// Each modal owns a release handle; nested dialogs must not unlock each other.
const locks = new WeakMap<
  Document,
  { count: number; previousOverflow: string }
>();

export function lockBodyScroll(owner: Document = document): () => void {
  let state = locks.get(owner);
  if (!state) {
    state = { count: 0, previousOverflow: owner.body.style.overflow };
    locks.set(owner, state);
  }
  state.count += 1;
  owner.body.style.overflow = "hidden";
  let released = false;
  return () => {
    if (released) return;
    released = true;
    state.count -= 1;
    if (state.count === 0) {
      owner.body.style.overflow = state.previousOverflow;
      locks.delete(owner);
    }
  };
}
