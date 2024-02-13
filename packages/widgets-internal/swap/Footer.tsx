import { useTranslation } from "@pancakeswap/localization";
import { Flex, Image, LinkExternal } from "@pancakeswap/uikit";
import { ReactNode, memo } from "react";
import { styled } from "styled-components";

const Wrapper = styled.div<{ $isSide: boolean }>`
  width: 100%;
  height: ${({ $isSide }) => ($isSide ? "100%" : "auto")};
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  padding-top: 16px;
  padding-right: ${({ $isSide }) => ($isSide ? "32px" : "0px")};
  ${({ theme }) => theme.mediaQueries.md} {
    justify-content: space-between;
    flex-direction: ${({ $isSide }) => ($isSide ? "column" : "row")};
  }
`;

const BubbleWrapper = styled(Flex)`
  svg {
    fill: ${({ theme }) => theme.colors.textSubtle};
    transition: background-color 0.2s, opacity 0.2s;
  }
  &:hover {
    svg {
      opacity: 0.65;
    }
  }
  &:active {
    svg {
      opacity: 0.85;
    }
  }
`;

type FooterVariant = "default" | "side";

const Footer: React.FC<
  React.PropsWithChildren<{
    variant?: FooterVariant;
    helpUrl?: string;
    helpImage?: ReactNode;
    externalText?: string;
    externalLinkUrl?: string;
  }>
> = ({
  variant = "default",
  helpUrl,
  externalText,
  externalLinkUrl,
  helpImage = <Image src="https://cdn.pancakeswap.com/help/help.png" alt="Get some help" width={160} height={108} />,
}) => {
  const { t } = useTranslation();
  const isSide = variant === "side";
  return (
    <Wrapper $isSide={isSide}>
      {externalText && externalLinkUrl && (
        <Flex flexDirection={isSide ? "column" : ["column", "column", "row"]} alignItems="center">
          <LinkExternal
            id="ercBridge"
            href={externalLinkUrl}
            ml={[0, 0, "40px"]}
            mt={["20px", "20px", isSide ? "20px" : 0]}
            mb={["8px", "8px", 0]}
          >
            {externalText}
          </LinkExternal>
        </Flex>
      )}
      {isSide && <Flex flexGrow={1} />}{" "}
    </Wrapper>
  );
};

export const SwapFooter = memo(Footer);
