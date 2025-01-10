import clsx from "clsx";
import { MouseEventHandler, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "subtle" | "blank";
type ButtonState = "loading" | "default";
export function ButtonV2({
  children,
  onClick,
  className,
  disabled,
  variant,
  scale = "md",
  fullWidth,
  state,
}: PropsWithChildren<{
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
  variant: ButtonVariant;
  scale?: "xs" | "sm" | "md";
  fullWidth?: boolean;
  state?: ButtonState;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-[20px] disabled:bg-surface-disable disabled:text-on-surface-subtlest disabled:cursor-not-allowed",
        className,
        state && ["loading"].includes(state)
          ? "bg-surface-disable text-on-surface-subtlest"
          : variant === "primary"
          ? "bg-brand text-on-surface-inverse"
          : variant === "secondary"
          ? "bg-bold text-on-surface-inverse"
          : variant === "subtle"
          ? "bg-neutral text-on-surface"
          : variant === "blank"
          ? "bg-transparent border-gray-700 border text-on-surface"
          : "",
        {
          "hover:opacity-70": !disabled,
          "px-2 py-1 text-xs": scale === "xs",
          "px-3 py-1.5 text-sm": scale === "sm",
          "px-4 py-2.5 text-sm": scale === "md",
          "w-full": fullWidth,
        }
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
