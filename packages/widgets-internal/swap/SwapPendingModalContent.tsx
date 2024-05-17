import { Currency } from "@pancakeswap/sdk";
import { ArrowUpIcon, AutoColumn, Box, ColumnCenter, Spinner, Text } from "@pancakeswap/uikit";
import { ReactNode, Suspense, lazy } from "react";
import TokenTransferInfo from "./TokenTransferInfo";

const QRCodeSVG = lazy(() => import("qrcode.react").then((module) => ({ default: module.QRCodeSVG })));

interface SwapPendingModalContentProps {
  title: string;
  showIcon?: boolean;
  currencyA?: Currency;
  currencyB?: Currency;
  amountA: string;
  amountB: string;
  children?: ReactNode;
  qrUri?: string;
}

export const SwapPendingModalContent: React.FC<SwapPendingModalContentProps> = ({
  title,
  showIcon,
  currencyA,
  currencyB,
  amountA,
  amountB,
  children,
  qrUri,
}) => {
  const symbolA = currencyA?.symbol;
  const symbolB = currencyB?.symbol;

  return (
    <Box width="100%">
      {showIcon ? (
        <Box margin="auto auto 36px auto" width="fit-content">
          <ArrowUpIcon color="success" width={80} height={80} />
        </Box>
      ) : (
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
      )}
      <AutoColumn gap="12px" justify="center">
        <Text bold textAlign="center">
          {title}
        </Text>
        <TokenTransferInfo
          symbolA={symbolA}
          symbolB={symbolB}
          amountA={amountA}
          amountB={amountB}
          currencyA={currencyA}
          currencyB={currencyB}
        />
        {children}
      </AutoColumn>
    </Box>
  );
};
