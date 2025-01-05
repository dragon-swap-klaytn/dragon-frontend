import { MouseEventHandler, PropsWithChildren } from "react";

export function MenuIconButton({
  children,
  onClick,
}: PropsWithChildren<{
  onClick: MouseEventHandler<HTMLButtonElement>;
}>) {
  return (
    <button type="button" className="hover:bg-overlay-surface-hover-light p-2 rounded-full" onClick={onClick}>
      {children}
    </button>
  );
}
