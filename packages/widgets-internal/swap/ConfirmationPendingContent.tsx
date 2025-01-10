import { useTranslation } from "@pancakeswap/localization";
import { Spinner } from "@pancakeswap/uikit";
import { Suspense, lazy } from "react";

const QRCodeSVG = lazy(() => import("qrcode.react").then((module) => ({ default: module.QRCodeSVG })));

export function ConfirmationPendingContent({ qrUri, pendingText }: { qrUri?: string; pendingText?: string }) {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      <div className="flex justify-center">
        {qrUri ? (
          <Suspense fallback={<Spinner />}>
            <QRCodeSVG value={qrUri} size={144} level="H" includeMargin />
          </Suspense>
        ) : (
          <Spinner />
        )}
      </div>

      <div className="flex flex-col items-center text-on-surface mt-7">
        {pendingText ? (
          <>
            <p>{t("Waiting For Confirmation")}</p>
            <p className="text-sm mt-7">{pendingText}</p>
          </>
        ) : null}

        <p className="text-sm text-center mt-2">{t("Confirm this transaction in your wallet")}</p>
      </div>
    </div>
  );
}
