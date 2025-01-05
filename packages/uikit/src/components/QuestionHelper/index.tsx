import { QuestionMark } from "@phosphor-icons/react";
import clsx from "clsx";
import { Placement, useTooltip } from "../../hooks";
import { BoxProps } from "../Box";

interface Props extends BoxProps {
  text: string | React.ReactNode;
  placement?: Placement;
  size?: string;
  background?: string;
  color?: string;
}

export const QuestionHelper: React.FC<React.PropsWithChildren<Props>> = ({
  text,
  placement = "right-end",
  size = 12,
  background = "bg-gray-500",
  color = "text-surface-container",
}) => {
  const { targetRef, tooltip, tooltipVisible } = useTooltip(text, { placement });

  return (
    <div className="flex items-center" ref={targetRef}>
      {tooltipVisible && tooltip}

      <div className={clsx("p-0.5 rounded-full", background)}>
        <QuestionMark className={clsx(color)} size={size} weight="bold" />
      </div>
    </div>
  );
};
