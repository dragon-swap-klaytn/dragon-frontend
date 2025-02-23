import clsx from "clsx";
import { PropsWithChildren } from "react";

export function ContainerV2({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx("p-4 rounded-2xl bg-neutral", className)}>{children}</div>;
}
