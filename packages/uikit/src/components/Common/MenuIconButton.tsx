import clsx from "clsx";
import { MouseEventHandler, PropsWithChildren } from "react";

export function MenuIconButton({
  children,
  onClick,
  disabled = false,
}: PropsWithChildren<{
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}>) {
  return (
    <button
      type="button"
      className={clsx("p-2 rounded-full disabled:cursor-not-allowed disabled:opacity-50", {
        "hover:bg-neutral": !disabled,
      })}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
