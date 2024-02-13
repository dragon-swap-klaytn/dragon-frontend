import React from "react";
import { keyframes, styled } from "styled-components";
import Flex from "../../../components/Box/Flex";

interface Props {
  href: string;
}

const blink = keyframes`
  0%,  100% { transform: scaleY(1); }
  50% { transform:  scaleY(0.1); }
`;

const StyledLink = styled("a")`
  display: flex;
  .mobile-icon {
    width: 32px;
    ${({ theme }) => theme.mediaQueries.lg} {
      display: none;
    }
  }
  .desktop-icon {
    width: 160px;
    display: none;
    ${({ theme }) => theme.mediaQueries.lg} {
      display: block;
    }
  }
  .eye {
    animation-delay: 20ms;
  }
  &:hover {
    .eye {
      transform-origin: center 60%;
      animation-name: ${blink};
      animation-duration: 350ms;
      animation-iteration-count: 1;
    }
  }
`;
const DragonSwapLogo = styled("span")`
  font-weight: bold;
  font-size: 20px;
`;

const DragonLink = styled("a")`
  display: flex;
  align-items: center;
  .desktop-icon {
    display: none;
    ${({ theme }) => theme.mediaQueries.lg} {
      display: inline-block;
    }
  }
`;
const Logo: React.FC<React.PropsWithChildren<Props>> = ({ href }) => {
  // const { linkComponent } = useContext(MenuContext);
  // const isAbsoluteUrl = href.startsWith("http");
  // const innerLogo = (
  //   <>
  //     <LogoIcon className="mobile-icon" />
  //     <LogoWithTextIcon className="desktop-icon" />
  //   </>
  // );

  return (
    <Flex alignItems="center">
      <DragonLink href={href}>
        <img src="/images/decorations/dgs-light.png" width="40px" alt="mainLogo" />
        <DragonSwapLogo className="desktop-icon">DragonSwap</DragonSwapLogo>
      </DragonLink>
    </Flex>
  );
};

export default React.memo(Logo);
