"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type SelectHTMLAttributes,
  type KeyboardEvent,
} from "react";

type OptionProps = {
  value?: string | number;
  children?: React.ReactNode;
  disabled?: boolean;
};
type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "multiple" | "size">;

// A themed listbox with a native select kept for FormData and existing change handlers.
export function Dropdown({
  children,
  className,
  value,
  defaultValue,
  onChange,
  disabled,
  ...props
}: Props) {
  const options = Children.toArray(children)
    .filter((child): child is ReactElement<OptionProps> =>
      isValidElement<OptionProps>(child),
    )
    .map((child) => ({
      value: String(child.props.value ?? child.props.children ?? ""),
      label: child.props.children,
      disabled: Boolean(child.props.disabled),
      text: String(child.props.children ?? ""),
    }));
  const [localValue, setLocalValue] = useState(
    String(defaultValue ?? options[0]?.value ?? ""),
  );
  const currentValue = value === undefined ? localValue : String(value);
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === currentValue),
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selected);
  const [placement, setPlacement] = useState({ above: false, height: 240 });
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const native = useRef<HTMLSelectElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: "", time: 0 });
  const id = useId();
  function show() {
    if (disabled || trigger.current?.matches(":disabled")) return;
    const box = root.current!.getBoundingClientRect();
    const dialog = root.current!.closest("dialog")?.getBoundingClientRect();
    const below =
      Math.min(window.innerHeight, dialog?.bottom ?? window.innerHeight) -
      box.bottom -
      12;
    const above = box.top - Math.max(0, dialog?.top ?? 0) - 12;
    const flip = below < 200 && above > below;
    setPlacement({
      above: flip,
      height: Math.max(80, Math.min(240, flip ? above : below)),
    });
    setActive(selected);
    setOpen(true);
  }
  function choose(index: number) {
    const option = options[index];
    if (
      !option ||
      option.disabled ||
      disabled ||
      trigger.current?.matches(":disabled")
    )
      return;
    setLocalValue(option.value);
    setOpen(false);
    if (native.current) {
      native.current.value = option.value;
      native.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
    trigger.current?.focus();
  }
  function move(direction: number) {
    let index = active;
    for (let step = 0; step < options.length; step++) {
      index = (index + direction + options.length) % options.length;
      if (!options[index].disabled) {
        setActive(index);
        break;
      }
    }
  }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (
      ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key)
    ) {
      event.preventDefault();
      if (!open) {
        show();
        return;
      }
      if (event.key === "Enter" || event.key === " ") choose(active);
      else if (event.key === "Home")
        setActive(options.findIndex((option) => !option.disabled));
      else if (event.key === "End")
        setActive(options.findLastIndex((option) => !option.disabled));
      else move(event.key === "ArrowDown" ? 1 : -1);
    } else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      const now = Date.now();
      typed.current = {
        text:
          (now - typed.current.time < 700 ? typed.current.text : "") +
          event.key.toLowerCase(),
        time: now,
      };
      const index = options.findIndex(
        (option) =>
          !option.disabled &&
          option.text.toLowerCase().startsWith(typed.current.text),
      );
      if (!open) show();
      if (index >= 0) setActive(index);
    }
  }
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => {
    if (open)
      list.current
        ?.querySelector(`[data-index="${active}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);
  return (
    <div
      className="brand-dropdown"
      ref={root}
      data-open={open}
      data-above={placement.above}
    >
      <button
        ref={trigger}
        type="button"
        role="combobox"
        className={`dropdown-trigger ${className ?? ""}`}
        disabled={disabled}
        aria-label={props["aria-label"] ?? props.name}
        aria-labelledby={props["aria-labelledby"]}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-list`}
        aria-activedescendant={
          open && active >= 0 ? `${id}-${active}` : undefined
        }
        onKeyDown={keyboard}
        onClick={() => (open ? setOpen(false) : show())}
        onBlur={(event) => {
          if (!root.current?.contains(event.relatedTarget)) setOpen(false);
        }}
      >
        <span className="dropdown-value">
          {options[selected]?.label ?? "Choose an option"}
        </span>
        <svg
          className="dropdown-arrow"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <select
        {...props}
        ref={native}
        value={currentValue}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: "none" }}
        onChange={(event) => {
          setLocalValue(event.target.value);
          onChange?.(event);
        }}
      >
        {children}
      </select>
      {open && (
        <div
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={props["aria-label"] ?? props.name ?? "Options"}
          className="dropdown-menu"
          style={{ maxHeight: placement.height }}
        >
          {options.map((option, index) => (
            <div
              key={`${option.value}-${index}`}
              id={`${id}-${index}`}
              role="option"
              aria-selected={currentValue === option.value}
              aria-disabled={option.disabled || undefined}
              className="dropdown-option"
              data-active={active === index}
              data-index={index}
              onPointerMove={() => {
                if (!option.disabled) setActive(index);
              }}
              onPointerDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                choose(index);
              }}
            >
              <span>{option.label}</span>
              {currentValue === option.value && (
                <span aria-hidden="true">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
