import React from "react";
import Image from "next/image";
import {styled} from "styled-components";

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
  margin-right: ${({ mr}) => `${mr ?? 0}px`};
  border-radius: 50%;
  padding: 5%;
  border: ${({ theme }) => `1px solid ${theme.colors.secondary}`};
`;

const Icon: React.FC<React.PropsWithChildren<IconProps>> = (props) => {
  return (
    <IconWrapper {...props}>
      <Image src="/images/klaytn-logo.svg" alt="pcs" width={props.width} height={props.height ?? props.width} />
    </IconWrapper>
  );
};

export default Icon;
