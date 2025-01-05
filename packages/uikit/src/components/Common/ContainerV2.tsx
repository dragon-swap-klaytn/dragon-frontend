import clsx from "clsx";
import { PropsWithChildren } from "react";

export function Container({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={clsx("p-4 rounded-2xl bg-surface-container-highest flex flex-col items-center space-y-3", className)}
    >
      {children}
    </div>
  );
}
