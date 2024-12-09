import { QuestionMark } from "@phosphor-icons/react";
import { styled } from "styled-components";
import { Placement, useTooltip } from "../../hooks";
import { BoxProps } from "../Box";

interface Props extends BoxProps {
  text: string | React.ReactNode;
  placement?: Placement;
  size?: string;
  color?: string;
}

const QuestionWrapper = styled.div`
  &:hover,
  &:focus {
    opacity: 0.7;
  }
`;

export const QuestionHelper: React.FC<React.PropsWithChildren<Props>> = ({
  text,
  placement = "right-end",
  size = 12,
  color,
  // ...props
}) => {
  const { targetRef, tooltip, tooltipVisible } = useTooltip(text, { placement });

  return (
    // <Flex alignItems="center" {...props} ref={targetRef}>
    <div className="flex items-center" ref={targetRef}>
      {tooltipVisible && tooltip}

      {/* <QuestionWrapper as={Flex} alignItems="center"> */}
      {/* <div className="flex items-center"> */}
      {/* <HelpIcon color={color || "textSubtle"} width={size} /> */}
      <div className="rounded-full bg-gray-500 p-0.5">
        <QuestionMark className="text-surface-container" size={size} weight="bold" />
      </div>
      {/* </div> */}
    </div>
  );
};
