"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { lockBodyScroll } from "@/lib/scroll-lock";
import { X } from "lucide-react";

export function Dialog({
  id,
  title,
  onClose,
  children,
}: {
  id: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const opener = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const releaseScroll = lockBodyScroll();
    return () => {
      dialog.close();
      releaseScroll();
      opener?.focus();
    };
  }, []);
  return (
    <dialog
      className="storefront-dialog m-auto"
      ref={ref}
      id={id}
      aria-label={title}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const box = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < box.left ||
          event.clientX > box.right ||
          event.clientY < box.top ||
          event.clientY > box.bottom
        )
          onClose();
      }}
    >
      <div className="dialog-toolbar">
        <button
          type="button"
          className="close"
          onClick={onClose}
          aria-label={`Close ${title}`}
        >
          <X size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
