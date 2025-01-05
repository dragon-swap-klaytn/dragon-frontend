import clsx from "clsx";
import { PropsWithChildren } from "react";

export function TruncatedText({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={clsx("inline-block w-[220px] text-ellipsis", className)}>{children}</span>;
}
