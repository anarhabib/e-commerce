"use client";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import NavigationLink from "./navigation-link";

type Props = { variant?: "primary" | "secondary"; endIcon?: ReactNode } & (
  | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
  | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
);

export function Button({
  variant = "primary",
  endIcon,
  children,
  className = "",
  ...props
}: Props) {
  const classes = `button ${variant} ${className}`.trim();
  const content = (
    <>
      {children}
      {endIcon && (
        <span className="button-icon" aria-hidden="true">
          {endIcon}
        </span>
      )}
    </>
  );
  if (typeof props.href === "string") {
    if (
      props.href.startsWith("#") ||
      props.href.startsWith("/#") ||
      /^(https?:|mailto:|tel:)/.test(props.href)
    ) {
      // Native anchors resolve same-page and cross-page section links.
      return (
        <a {...props} className={classes}>
          {content}
        </a>
      );
    }
    return (
      <NavigationLink {...props} className={classes}>
        {content}
      </NavigationLink>
    );
  }
  return (
    <button type="button" {...props} className={classes}>
      {content}
    </button>
  );
}
