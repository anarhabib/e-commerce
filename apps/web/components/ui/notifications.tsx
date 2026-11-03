"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Kind = "success" | "info" | "error";
type Notice = { id: number; message: string; kind: Kind };
type Notifications = {
  notify: (message: string, kind?: Kind) => void;
  dismissAll: () => void;
  items: Notice[];
  remove: (id: number) => void;
};
const Context = createContext<Notifications | null>(null);
const ActionsContext = createContext<Pick<
  Notifications,
  "notify" | "dismissAll"
> | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notice[]>([]);
  const nextId = useRef(0);
  const notify = useCallback((message: string, kind: Kind = "success") => {
    const notice = { id: ++nextId.current, message, kind };
    setItems((current) => [
      ...current.filter((item) => item.message !== message).slice(-2),
      notice,
    ]);
  }, []);
  const remove = useCallback(
    (id: number) =>
      setItems((current) => current.filter((item) => item.id !== id)),
    [],
  );
  const dismissAll = useCallback(() => setItems([]), []);
  const actions = useMemo(() => ({ notify, dismissAll }), [notify, dismissAll]);
  return (
    <ActionsContext.Provider value={actions}>
      <Context.Provider value={{ items, notify, remove, dismissAll }}>
        {children}
      </Context.Provider>
    </ActionsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(Context);
  if (!context) throw new Error("Notifications require NotificationProvider");
  return context;
}

// Sending a notice should not subscribe the entire storefront to its timer/list.
export function useNotificationActions() {
  const actions = useContext(ActionsContext);
  if (!actions) throw new Error("Notifications require NotificationProvider");
  return actions;
}

function NotificationCard({
  notice,
  remove,
}: {
  notice: Notice;
  remove: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(5000);
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (paused || closing) return;
    const started = Date.now();
    const timeout = setTimeout(() => setClosing(true), remaining.current);
    return () => {
      clearTimeout(timeout);
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - started),
      );
    };
  }, [paused, closing]);
  useEffect(() => {
    if (!closing) return;
    const timeout = setTimeout(() => remove(notice.id), 180);
    return () => clearTimeout(timeout);
  }, [closing, notice.id, remove]);
  return (
    <div
      ref={card}
      className="notification-card"
      data-visible={visible && !closing}
      data-closing={closing}
      data-kind={notice.kind}
      role="status"
      aria-atomic="true"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => {
        if (!card.current?.contains(document.activeElement)) setPaused(false);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(event.relatedTarget) &&
          !event.currentTarget.matches(":hover")
        )
          setPaused(false);
      }}
    >
      <span className="notification-icon" aria-hidden="true">
        {notice.kind === "success" ? (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="m5 10 3.5 3.5L15 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : notice.kind === "error" ? (
          "!"
        ) : (
          "i"
        )}
      </span>
      <div className="notification-copy">
        <strong>
          {notice.kind === "success"
            ? "All set."
            : notice.kind === "error"
              ? "Please check."
              : "A quick note."}
        </strong>
        <p>{notice.message}</p>
      </div>
      <button
        type="button"
        className="notification-dismiss"
        aria-label="Dismiss notification"
        onClick={() => setClosing(true)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m4 4 8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export function NotificationViewport() {
  const { items, remove } = useNotifications();
  return (
    <div
      className="notification-viewport"
      aria-label="Notifications"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {items.map((notice) => (
        <NotificationCard key={notice.id} notice={notice} remove={remove} />
      ))}
    </div>
  );
}
