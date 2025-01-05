import { Copy } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { useTooltip } from "../../hooks";
import { SvgProps } from "../Svg";
import { copyText } from "./copyText";

interface CopyButtonProps extends SvgProps {
  text: string;
  tooltipMessage: string;
  className?: string;
}

export const CopyButton: React.FC<React.PropsWithChildren<CopyButtonProps>> = ({
  text,
  tooltipMessage,
  width = "20px",
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
      <button ref={targetRef} type="button" onClick={handleOnClick} className="hover:opacity-70">
        <Copy size={width} className={className} />
      </button>

      {isTooltipDisplayed && tooltip}
    </>
  );
};
