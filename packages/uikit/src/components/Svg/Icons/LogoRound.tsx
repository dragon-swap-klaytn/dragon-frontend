import getTokenIconSrcFromSs from "@pancakeswap/utils/getTokenIconSrcFromSs";
import React from "react";
import { styled } from "styled-components";
import { ZERO_ADDRESS } from "../../../tokens";

interface IconProps {
  width: number;
  height?: number;
  mr?: number;
  ml?: number;
}

const IconWrapper = styled.div<IconProps>`
  width: ${({ width }) => `${width}px`};
  height: ${({ width, height }) => `${height ?? width}px`};
  margin-left: ${({ ml }) => `${ml ?? 0}px`};
  margin-right: ${({ mr }) => `${mr ?? 0}px`};
  border-radius: 50%;
  padding: 5%;
  border: ${({ theme }) => `1px solid ${theme.colors.secondary}`};
`;

const Icon: React.FC<React.PropsWithChildren<IconProps>> = (props) => {
  return (
    <IconWrapper {...props}>
      <img
        src={getTokenIconSrcFromSs(ZERO_ADDRESS) || "/images/klaytn-logo.svg"}
        alt="pcs"
        width={props.width}
        height={props.height ?? props.width}
        style={{ borderRadius: "50%" }}
      />
    </IconWrapper>
  );
};

export default Icon;
