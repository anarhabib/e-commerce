"use client";

import Link, { useLinkStatus } from "next/link";
import { createPortal } from "react-dom";
import type { ComponentProps } from "react";
import { LoadingBar } from "./loading-bar";

function NavigationProgress() {
  const { pending } = useLinkStatus();
  // Pending is client-only. A portal keeps the bar outside transformed buttons/dialogs.
  return pending
    ? createPortal(<LoadingBar fixed label="Loading page" />, document.body)
    : null;
}

export default function NavigationLink({
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <NavigationProgress />
    </Link>
  );
}
