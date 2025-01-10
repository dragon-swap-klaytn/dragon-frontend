import clsx from "clsx";
import { PropsWithChildren, ReactNode } from "react";
import { SpaceProps } from "styled-system";

export function Section({
  title,
  children,
  className,
  mb = "mb-4",
}: { title?: ReactNode; className?: string; mb?: string } & PropsWithChildren & SpaceProps) {
  return (
    <div className={clsx("w-full", className, mb)}>
      <h3 className="text-xs text-on-surface-brand self-start mb-2">{title}</h3>

      {children}
    </div>
  );
}
