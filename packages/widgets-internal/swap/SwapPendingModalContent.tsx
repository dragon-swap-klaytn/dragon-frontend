import { Currency } from "@pancakeswap/sdk";
import { Spinner } from "@pancakeswap/uikit";
import { ArrowCircleUp } from "@phosphor-icons/react";
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
  return (
    <div className="flex flex-col items-center space-y-7">
      {showIcon ? (
        <ArrowCircleUp size={80} />
      ) : (
        <>
          {qrUri ? (
            <Suspense fallback={<Spinner />}>
              <QRCodeSVG value={qrUri} size={144} level="H" includeMargin />
            </Suspense>
          ) : (
            <Spinner />
          )}
        </>
      )}

      <h3 className="text-lg font-bold">{title}</h3>

      <TokenTransferInfo
        symbolA={currencyA?.symbol}
        symbolB={currencyB?.symbol}
        amountA={amountA}
        amountB={amountB}
        currencyA={currencyA}
        currencyB={currencyB}
      />

      {children}
    </div>
  );
};
