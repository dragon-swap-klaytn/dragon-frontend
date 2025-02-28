import { Children, cloneElement, PropsWithChildren, ReactElement } from "react";
import { NotificationDotProps } from "./types";

export default function NotificationDot({ show = false, children, ...props }: PropsWithChildren<NotificationDotProps>) {
  return (
    <span className="relative inline-flex w-fit">
      {Children.map(children, (child: ReactElement) => cloneElement(child, props))}
      {show && (
        <span className="absolute top-[2px] right-[2px] w-[10px] h-[10px] rounded-full bg-red-600 border border-white pointer-events-none" />
      )}
    </span>
  );
}
