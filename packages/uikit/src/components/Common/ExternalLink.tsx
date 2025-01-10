import { ArrowSquareOut } from "@phosphor-icons/react";
import clsx from "clsx";
import { PropsWithChildren } from "react";

export function ExternalLink({
  children,
  href,
  textSize = "text-sm",
  className,
  hideIcon = false,
}: PropsWithChildren<{
  href: string;
  textSize?: string;
  className?: string;
  hideIcon?: boolean;
}>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={clsx("underline underline-offset-2 hover:opacity-70 inline-block", textSize, className)}
    >
      {children}

      {!hideIcon && <ArrowSquareOut size={16} className="inline-block ml-1 shrink-0 mb-1 text-on-surface-link" />}
    </a>
  );
}
