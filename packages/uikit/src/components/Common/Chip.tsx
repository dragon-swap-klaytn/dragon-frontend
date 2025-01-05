import clsx from "clsx";
import { PropsWithChildren } from "react";

type ChipProps = {
  className?: string;
  color?: "blue" | "green" | "orange" | "default" | "red";
};

export function Chip({ children, className, color = "default" }: PropsWithChildren<ChipProps>) {
  return (
    <div
      className={clsx(
        "inline-flex items-center justify-center rounded-[100px] space-x-2 px-2 py-1 text-xs",
        className,
        {
          "bg-surface-container-highest text-on-surface-secondary": color === "default",
          "bg-[#3B82F61A] text-blue-500": color === "blue",
          "bg-[#10B9811A] text-emerald-500": color === "green",
          "bg-[#F973161A] text-on-surface-orange-on-overlay": color === "orange",
          "bg-[#b91c1c1A] text-red-500": color === "red",
        }
      )}
    >
      {children}
    </div>
  );
}
