import { useTranslation } from "@pancakeswap/localization";
import { AutoColumn, Box, ColumnCenter, Flex, Spinner, Text, TooltipText, useTooltip } from "@pancakeswap/uikit";
import { Suspense, lazy } from "react";

const QRCodeSVG = lazy(() => import("qrcode.react").then((module) => ({ default: module.QRCodeSVG })));

interface ApproveModalContentProps {
  title: string;
  isMM?: boolean;
  isBonus: boolean;
  qrUri?: string;
}

export const ApproveModalContent: React.FC<ApproveModalContentProps> = ({ title, isMM, isBonus, qrUri }) => {
  const { t } = useTranslation();
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <Text>{t("Dragonswap AMM includes V3, V2 and stable swap.")}</Text>,
    { placement: "top" }
  );

  return (
    <Box width="100%">
      <Box mb="16px">
        <ColumnCenter>
          {qrUri ? (
            <Suspense fallback={<Spinner />}>
              <QRCodeSVG value={qrUri} size={144} level="H" includeMargin />
            </Suspense>
          ) : (
            <Spinner />
          )}
        </ColumnCenter>
      </Box>
      <AutoColumn gap="12px" justify="center">
        <Text bold textAlign="center">
          {title}
        </Text>
        <Flex>
          <Text fontSize="14px">{t("Swapping thru:")}</Text>
          {isMM ? (
            <Text ml="4px" fontSize="14px">
              {t("Dragonswap MM")}
            </Text>
          ) : isBonus ? (
            <Text ml="4px" fontSize="14px">
              {t("Bonus Route")}
            </Text>
          ) : (
            <>
              <TooltipText ml="4px" fontSize="14px" color="textSubtle" ref={targetRef}>
                {t("Dragonswap AMM")}
              </TooltipText>
              {tooltipVisible && tooltip}
            </>
          )}
        </Flex>
      </AutoColumn>
    </Box>
  );
};
