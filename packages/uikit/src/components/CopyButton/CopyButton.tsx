import { Copy } from "@phosphor-icons/react";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { useTooltip } from "../../hooks";
import { SvgProps } from "../Svg";
import { copyText } from "./copyText";

interface CopyButtonProps extends SvgProps {
  text: string;
  tooltipMessage: string;
  className?: string;
  size?: number;
}

export const CopyButton: React.FC<React.PropsWithChildren<CopyButtonProps>> = ({
  text,
  tooltipMessage,
  size = 20,
  className = "",
}) => {
  const [isTooltipDisplayed, setIsTooltipDisplayed] = useState(false);

  const { targetRef, tooltip } = useTooltip(tooltipMessage, {
    placement: "auto",
    manualVisible: true,
    trigger: "hover",
  });

  const displayTooltip = useCallback(() => {
    setIsTooltipDisplayed(true);
  }, []);

  const handleOnClick = useCallback(() => {
    copyText(text, displayTooltip);
  }, [text, displayTooltip]);

  useEffect(() => {
    if (isTooltipDisplayed) {
      const tooltipTimeout = setTimeout(() => {
        setIsTooltipDisplayed(false);
      }, 1000);
      return () => clearTimeout(tooltipTimeout);
    }

    return undefined;
  }, [isTooltipDisplayed]);

  return (
    <>
      <button ref={targetRef} type="button" onClick={handleOnClick} className={clsx("hover:opacity-70", className)}>
        <Copy size={size} />
      </button>

      {isTooltipDisplayed && tooltip}
    </>
  );
};
