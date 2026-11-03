export function LoadingBar({
  label = "Loading",
  fixed = false,
}: {
  label?: string;
  fixed?: boolean;
}) {
  return (
    <div
      className={`loading-bar${fixed ? " loading-bar-fixed" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      <span className="loading-bar-track" aria-hidden="true">
        <span />
      </span>
    </div>
  );
}
