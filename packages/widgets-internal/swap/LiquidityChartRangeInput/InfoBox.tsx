import { ReactNode } from "react";

import { Spinner } from "@pancakeswap/uikit";
import clsx from "clsx";

export function InfoBox({ message, icon, className }: { message?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div className={clsx("flex flex-col items-center", className)}>
      {icon ?? <Spinner />}
      {message && <p className="font-bold text-on-surface mt-2">{message}</p>}
    </div>
  );
}
