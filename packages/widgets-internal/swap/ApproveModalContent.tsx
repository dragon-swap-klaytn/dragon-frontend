import { useTranslation } from "@pancakeswap/localization";
import { Spinner, useTooltip } from "@pancakeswap/uikit";
import { Suspense, lazy } from "react";

const QRCodeSVG = lazy(() => import("qrcode.react").then((module) => ({ default: module.QRCodeSVG })));

interface ApproveModalContentProps {
  isBonus: boolean;
  qrUri?: string;
}

export const ApproveModalContent: React.FC<ApproveModalContentProps> = ({ isBonus, qrUri }) => {
  const { t } = useTranslation();
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <span>{t("Dragonswap AMM includes V3, V2 and stable swap.")}</span>,
    { placement: "top" }
  );

  return (
    <div className="w-full flex flex-col items-center space-y-7">
      {qrUri ? (
        <Suspense fallback={<Spinner />}>
          <QRCodeSVG value={qrUri} size={144} level="H" includeMargin />
        </Suspense>
      ) : (
        <Spinner />
      )}

      <div className="flex items-center space-x-1 text-sm text-on-surface">
        <span className="text-sm text-on-surface">{t("Swapping thru:")}</span>

        {isBonus ? (
          <b>{t("Bonus Route")}</b>
        ) : (
          <>
            <div className="font-bold" ref={targetRef}>
              <span>{t("Dragonswap AMM")}</span>
            </div>

            {tooltipVisible && tooltip}
          </>
        )}
      </div>
    </div>
  );
};
