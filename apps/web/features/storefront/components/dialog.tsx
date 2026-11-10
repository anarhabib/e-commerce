"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { lockBodyScroll } from "@/lib/scroll-lock";
import { X } from "lucide-react";

export function Dialog({
  id,
  title,
  onClose,
  children,
  closeAtEndOnMobile = true,
  className = "",
}: {
  id: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeAtEndOnMobile?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const opener = document.activeElement as HTMLElement | null;
    dialog.showModal();
    if (closeAtEndOnMobile && window.matchMedia("(max-width: 700px)").matches)
      dialog.focus({ preventScroll: true });
    const releaseScroll = lockBodyScroll();
    return () => {
      dialog.close();
      releaseScroll();
      opener?.focus();
    };
  }, [closeAtEndOnMobile]);
  return (
    <dialog
      className={`storefront-dialog m-auto${closeAtEndOnMobile ? " has-mobile-end-close" : ""} ${className}`}
      ref={ref}
      id={id}
      aria-label={title}
      tabIndex={-1}
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
      {closeAtEndOnMobile && (
        <button
          type="button"
          className="dialog-end-close"
          onClick={onClose}
          aria-label={`Close ${title}`}
        >
          <X size={14} strokeWidth={1.5} aria-hidden="true" />
          Close
        </button>
      )}
    </dialog>
  );
}
