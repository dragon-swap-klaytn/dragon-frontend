import clsx from "clsx";
import { MouseEventHandler, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "subtle" | "blank";
type ButtonState = "loading" | "default";

export const COMMON_BUTTON_STYLE =
  "rounded-[20px] disabled:bg-surface-disable disabled:text-on-surface-subtlest disabled:cursor-not-allowed hover:opacity-70 disabled:hover:opacity-100";

export const LOADING_BUTTON_STYLE = "bg-surface-disable text-on-surface-subtlest";
export const PRIMARY_BUTTON_STYLE = "bg-brand text-on-surface-inverse";
export const SECONDARY_BUTTON_STYLE = "bg-bold text-on-surface-inverse";
export const SUBTLE_BUTTON_STYLE = "bg-neutral text-on-surface";
export const BLANK_BUTTON_STYLE = "bg-transparent border-gray-700 border text-on-surface";

export const XS_BUTTON_STYLE = "px-2 py-1 text-xs";
export const SM_BUTTON_STYLE = "px-3 py-1.5 text-sm";
export const MD_BUTTON_STYLE = "px-4 py-2.5 text-sm";

export type ButtonV2Scale = "xs" | "sm" | "md";
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
  scale?: ButtonV2Scale;
  fullWidth?: boolean;
  state?: ButtonState;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        COMMON_BUTTON_STYLE,
        className,
        state && ["loading"].includes(state)
          ? LOADING_BUTTON_STYLE
          : variant === "primary"
          ? PRIMARY_BUTTON_STYLE
          : variant === "secondary"
          ? SECONDARY_BUTTON_STYLE
          : variant === "subtle"
          ? SUBTLE_BUTTON_STYLE
          : variant === "blank"
          ? BLANK_BUTTON_STYLE
          : "",
        {
          [XS_BUTTON_STYLE]: scale === "xs",
          [SM_BUTTON_STYLE]: scale === "sm",
          [MD_BUTTON_STYLE]: scale === "md",
          "w-full": fullWidth,
        }
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
