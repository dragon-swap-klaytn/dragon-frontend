import { ArrowSquareOut } from "@phosphor-icons/react";
import clsx from "clsx";
import { PropsWithChildren } from "react";

export function ExternalLink({
  children,
  href,
  textSize = "text-sm",
  className,
}: PropsWithChildren<{
  href: string;
  textSize?: string;
  className?: string;
}>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={clsx("underline underline-offset-2 hover:opacity-70", textSize, className)}
    >
      {children}

      <ArrowSquareOut size={16} className="inline-block ml-1 shrink-0 mb-1" />
    </a>
  );
}
